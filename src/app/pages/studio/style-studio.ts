import { Dialog } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';
import { CvRepository } from '../../cv/data/cv-repository';
import { CvPreview } from '../../cv/document/cv-preview';
import { scopeCss } from '../../cv/document/custom-css';
import { SHAPES } from '../../cv/document/parts/shapes';
import {
  ACCENT_COLORS,
  CV_LANGUAGES,
  CV_TEMPLATES,
  CvTemplateId,
  newId,
} from '../../cv/model/cv.model';
import { contrastRatio } from '../../cv/model/color';
import { CV_FONTS, CvFontId, isFontId } from '../../cv/model/cv-fonts';
import {
  CvStyle,
  PAPER_PRESETS,
  SHAPE_COLORS,
  SHAPE_KINDS,
  SHAPE_LIMITS,
  STUDIO_BASE,
  STYLE_BLOCKS,
  STYLE_BLOCK_KEYS,
  ShapeKind,
  StyleBase,
  StyleBlockKey,
  StyleShape,
  createShape,
  MAX_SHAPES,
} from '../../cv/model/cv-style';
import { ResolvedCv, hidesPersonalDetails, resolveCv } from '../../cv/model/resolve-cv';
import { SAMPLE_PHOTO_URL, createShowcaseCv } from '../../cv/model/sample-cv';
import { Icon, IconName } from '../../shared/icon/icon';
import { ToastService } from '../../shared/toast/toast';
import { BLOCK_SKETCHES, SKETCH_FILLS, SketchRect } from './block-previews';
import { StyleShare, StyleShareData } from './style-share';

const SAVE_DELAY_MS = 400;
const SAMPLE = 'sample';

type Tab = 'blocks' | 'shapes' | 'colors' | 'css';
const TABS: readonly { id: Tab; icon: IconName }[] = [
  { id: 'blocks', icon: 'layout' },
  { id: 'shapes', icon: 'shapes' },
  { id: 'colors', icon: 'palette' },
  { id: 'css', icon: 'code' },
];

/** Réglages d'une forme sous forme de curseurs, dans l'ordre du panneau. */
const SHAPE_CONTROLS = ['size', 'rotate', 'alpha', 'x', 'y'] as const;
type ShapeControl = (typeof SHAPE_CONTROLS)[number];

/** Classes stables de la toile du studio, listées dans l'aide du CSS. */
const CSS_CLASSES = [
  'cv',
  'cv-header',
  'cv-photo',
  'cv-name',
  'cv-headline',
  'cv-contact',
  'cv-body',
  'cv-main',
  'cv-side',
  'cv-summary',
  'cv-section',
  'cv-heading',
  'cv-entry',
  'cv-entry-title',
  'cv-entry-org',
  'cv-dates',
  'cv-bullets',
  'cv-skill',
  'cv-chip',
  'cv-languages',
  'cv-meter',
  'cv-shape',
];
const CSS_VARIABLES = ['--cv-accent', '--cv-paper', '--cv-ink', '--soft', '--muted', '--line'];
const CSS_EXAMPLE = `.cv-name {
  color: var(--cv-accent);
  letter-spacing: 0.02em;
}

.cv-heading {
  font-size: 17px;
  letter-spacing: 0.01em;
}

.cv-chip {
  border: 1px solid var(--cv-accent);
  background: transparent;
}
`;

/**
 * Studio de styles : un panneau latéral de blocs, de formes, de couleurs et de CSS, et l'aperçu
 * en direct sur le CV d'exemple ou sur l'un de ses CV. Les formes se placent à la souris (ou au
 * clavier) directement sur la page. Chaque modification est enregistrée dans le navigateur et
 * reportée sur les CV qui utilisent ce style.
 */
@Component({
  selector: 'app-style-studio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon, CvPreview, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  templateUrl: './style-studio.html',
})
export class StyleStudio {
  /** Paramètres de route liés par `withComponentInputBinding`. */
  readonly id = input.required<string>();
  /** CV d'où vient l'utilisateur : montré dans l'aperçu, et bouton pour y revenir. */
  readonly cv = input<string>();
  readonly tab = input<string>();

  private readonly repository = inject(CvRepository);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly toast = inject(ToastService);
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  protected readonly status = signal<'loading' | 'ready' | 'notFound'>('loading');
  protected readonly style = signal<CvStyle | null>(null);
  protected readonly saveState = signal<'saved' | 'saving' | 'error'>('saved');
  private saveTimer?: ReturnType<typeof setTimeout>;

  protected readonly tabs = TABS;
  protected readonly activeTab = signal<Tab>('blocks');
  protected readonly isStudio = computed(() => this.style()?.base === STUDIO_BASE);
  protected readonly templates = CV_TEMPLATES;

  // --- Blocs ---
  protected readonly blockKeys = STYLE_BLOCK_KEYS;
  protected readonly fills = SKETCH_FILLS;

  protected blockOptions(key: StyleBlockKey): readonly string[] {
    return STYLE_BLOCKS[key];
  }

  protected sketch(key: StyleBlockKey, option: string): SketchRect[] {
    return (BLOCK_SKETCHES[key] as Record<string, SketchRect[]>)[option] ?? [];
  }

  // --- Formes ---
  protected readonly shapeKinds = SHAPE_KINDS;
  protected readonly geometry = SHAPES;
  protected readonly shapeColors = SHAPE_COLORS;
  protected readonly shapeControls = SHAPE_CONTROLS;
  protected readonly limits = SHAPE_LIMITS;
  protected readonly maxShapes = MAX_SHAPES;
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selectedShape = computed(
    () => this.style()?.shapes.find((shape) => shape.id === this.selectedId()) ?? null,
  );

  // --- Couleurs et polices ---
  protected readonly accents = ACCENT_COLORS;
  protected readonly papers = PAPER_PRESETS;
  protected readonly fonts = CV_FONTS;
  protected readonly fontRoles = ['heading', 'body'] as const;
  protected readonly lowContrast = computed(() => {
    const colors = this.style()?.colors;
    return !!colors && contrastRatio(colors.paper, colors.ink) < 4.5;
  });

  // --- CSS ---
  protected readonly cssPlaceholder = CSS_EXAMPLE;
  protected readonly cssClasses = CSS_CLASSES;
  protected readonly cssVariables = CSS_VARIABLES;
  private readonly css = computed(() => this.style()?.css ?? '');
  protected readonly diagnostics = computed(() => scopeCss(this.css(), '[data-cv-scope]'));

  // --- Aperçu ---
  protected readonly cvs = toSignal(this.repository.cvs$, { initialValue: [] });
  protected readonly source = signal<string>(SAMPLE);
  private readonly sample = computed((): ResolvedCv => {
    const lang = this.language.current();
    const language = CV_LANGUAGES.find((cvLanguage) => cvLanguage === lang) ?? 'en';
    return resolveCv(createShowcaseCv(language), null);
  });
  private readonly sourceCv = computed(
    () => this.cvs().find((cv) => cv.id === this.source()) ?? null,
  );
  protected readonly previewCv = computed((): ResolvedCv => {
    const cv = this.sourceCv();
    return { ...(cv ? resolveCv(cv, null) : this.sample()), style: this.style() };
  });
  private readonly cvPhoto = signal<string | null>(null);
  protected readonly previewPhoto = computed(() => {
    if (this.sourceCv()) return this.previewCv().profile.photoId ? this.cvPhoto() : null;
    return hidesPersonalDetails(this.sample().language) ? null : SAMPLE_PHOTO_URL;
  });
  /** Poignées des formes sur l'aperçu : seulement dans l'onglet Formes de la toile du studio. */
  protected readonly showHandles = computed(() => this.activeTab() === 'shapes' && this.isStudio());

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.load(id));
    });
    effect(() => {
      const tab = this.tab();
      if (TABS.some((t) => t.id === tab)) untracked(() => this.activeTab.set(tab as Tab));
    });
    effect(() => {
      const cv = this.cv();
      if (cv) untracked(() => this.source.set(cv));
    });
    // Photo du CV choisi pour l'aperçu, lue dans IndexedDB.
    effect((onCleanup) => {
      const photoId = this.sourceCv()?.profile.photoId;
      let url: string | null = null;
      let cancelled = false;
      if (photoId) {
        void this.repository.getPhoto(photoId).then((blob) => {
          if (cancelled || !blob) return;
          url = URL.createObjectURL(blob);
          this.cvPhoto.set(url);
        });
      }
      onCleanup(() => {
        cancelled = true;
        if (url) URL.revokeObjectURL(url);
        this.cvPhoto.set(null);
      });
    });

    const onPageHide = () => void this.flush();
    addEventListener('pagehide', onPageHide);
    inject(DestroyRef).onDestroy(() => {
      removeEventListener('pagehide', onPageHide);
      void this.flush();
    });
  }

  private async load(id: string): Promise<void> {
    // Une modification en attente sur le style précédent est enregistrée avant d'en changer.
    await this.flush();
    const style = await this.repository.getStyle(id);
    this.style.set(style ?? null);
    this.status.set(style ? 'ready' : 'notFound');
  }

  // --- Enregistrement ---

  private update(change: (draft: CvStyle) => void): void {
    const current = this.style();
    if (!current) return;
    const draft = structuredClone(current);
    change(draft);
    draft.updatedAt = new Date().toISOString();
    this.style.set(draft);
    this.saveState.set('saving');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.flush(), SAVE_DELAY_MS);
  }

  private async flush(): Promise<void> {
    if (this.saveTimer === undefined) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;
    const style = this.style();
    if (!style) return;
    try {
      await this.repository.saveStyle(style);
      if (this.saveTimer === undefined) this.saveState.set('saved');
    } catch {
      this.saveState.set('error');
    }
  }

  protected rename(name: string): void {
    this.update((style) => (style.name = name));
  }

  protected setBase(base: StyleBase): void {
    this.update((style) => (style.base = base));
  }

  /** Modèle proposé quand on quitte la toile : celui du CV montré, sinon le premier. */
  protected templateBase(): CvTemplateId {
    return this.sourceCv()?.template ?? CV_TEMPLATES[0].id;
  }

  protected setBlock(key: StyleBlockKey, option: string): void {
    this.update((style) => ((style.blocks as Record<StyleBlockKey, string>)[key] = option));
  }

  // --- Formes ---

  protected addShape(kind: ShapeKind): void {
    const shape = createShape(kind);
    this.update((style) => style.shapes.push(shape));
    this.selectedId.set(shape.id);
  }

  protected updateShape(id: string, patch: Partial<StyleShape>): void {
    this.update((style) => Object.assign(style.shapes.find((s) => s.id === id) ?? {}, patch));
  }

  protected setControl(id: string, control: ShapeControl, value: string): void {
    const { min, max } = SHAPE_LIMITS[control];
    const number = Math.min(max, Math.max(min, Number(value)));
    if (Number.isFinite(number)) this.updateShape(id, { [control]: number });
  }

  protected duplicateShape(shape: StyleShape): void {
    const copy = {
      ...shape,
      id: newId(),
      x: Math.min(shape.x + 4, 100),
      y: Math.min(shape.y + 3, 100),
    };
    this.update((style) => style.shapes.push(copy));
    this.selectedId.set(copy.id);
  }

  protected removeShape(id: string): void {
    this.update((style) => (style.shapes = style.shapes.filter((shape) => shape.id !== id)));
    this.selectedId.set(null);
  }

  /** Déplacement à la souris ou au doigt : position en % de la page, bornée. */
  protected startDrag(event: PointerEvent, shape: StyleShape): void {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    const page = handle.parentElement?.getBoundingClientRect();
    if (!page) return;
    this.selectedId.set(shape.id);
    handle.focus();
    handle.setPointerCapture(event.pointerId);
    const start = { x: event.clientX, y: event.clientY, shapeX: shape.x, shapeY: shape.y };
    const round = (value: number) => Math.round(value * 10) / 10;
    const move = (e: PointerEvent) => {
      const x = start.shapeX + ((e.clientX - start.x) / page.width) * 100;
      const y = start.shapeY + ((e.clientY - start.y) / page.height) * 100;
      this.updateShape(shape.id, {
        x: round(Math.min(SHAPE_LIMITS.x.max, Math.max(SHAPE_LIMITS.x.min, x))),
        y: round(Math.min(SHAPE_LIMITS.y.max, Math.max(SHAPE_LIMITS.y.min, y))),
      });
    };
    const stop = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', stop);
      handle.removeEventListener('pointercancel', stop);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }

  /** Flèches : déplacer de 1 % (Maj : 5 %) ; Suppr : retirer la forme. */
  protected onHandleKeydown(event: KeyboardEvent, shape: StyleShape): void {
    const step = event.shiftKey ? 5 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.removeShape(shape.id);
      return;
    }
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    this.setControl(shape.id, 'x', String(shape.x + move[0]));
    this.setControl(shape.id, 'y', String(shape.y + move[1]));
  }

  // --- Couleurs et polices ---

  protected setAccent(accent: string | null): void {
    this.update((style) => (style.colors.accent = accent));
  }

  protected setColor(role: 'paper' | 'ink', value: string): void {
    this.update((style) => (style.colors[role] = value));
  }

  protected setPaper(preset: { paper: string; ink: string }): void {
    this.update((style) => (style.colors = { ...style.colors, ...preset }));
  }

  protected setFont(role: 'heading' | 'body', value: string): void {
    const font: CvFontId | null = isFontId(value) ? value : null;
    this.update((style) => (style.fonts = { ...style.fonts, [role]: font }));
  }

  // --- CSS ---

  protected setCss(css: string): void {
    this.update((style) => (style.css = css));
  }

  protected insertExample(): void {
    this.setCss(CSS_EXAMPLE);
  }

  // --- Partage et utilisation ---

  protected share(): void {
    const style = this.style();
    if (!style) return;
    this.dialog.open<CvStyle, StyleShareData>(StyleShare, {
      data: { style },
      backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
      panelClass: 'dialog-in',
    });
  }

  /** Applique une copie du style au CV, puis ouvre l'éditeur sur ce CV. */
  protected async applyTo(cvId: string): Promise<void> {
    await this.flush();
    const style = this.style();
    const cv = await this.repository.getCv(cvId);
    if (!style || !cv) return;
    await this.repository.saveCv({
      ...cv,
      style: structuredClone(style),
      updatedAt: new Date().toISOString(),
    });
    this.toast.success(this.transloco.translate('studio.toolbar.applied', { name: cv.name }));
    await this.router.navigate(['/editor', cvId]);
  }
}
