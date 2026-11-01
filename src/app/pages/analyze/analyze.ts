import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CheckCategory, CheckStatus, CvAnalysis, analyzeCv } from '../../cv/analysis/cv-analyzer';
import { ExtractedPdf, PdfReadError, extractPdfText } from '../../cv/analysis/pdf-text';
import { CvRepository } from '../../cv/data/cv-repository';
import { importCv } from '../../cv/import/cv-import';
import { ToastService } from '../../shared/toast/toast';
import { Icon, IconName } from '../../shared/icon/icon';

const MAX_SIZE = 15 * 1024 * 1024;
const RING_RADIUS = 52;

type ErrorCode = 'notPdf' | 'tooLarge' | 'encrypted' | 'unreadable';

const STATUS_ICONS: Record<CheckStatus, { icon: IconName; classes: string }> = {
  pass: { icon: 'check', classes: 'bg-accent-soft text-accent' },
  warn: { icon: 'alert', classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  fail: { icon: 'x', classes: 'bg-danger/12 text-danger' },
};

/** Analyse d'un CV PDF existant, entièrement dans le navigateur. */
@Component({
  selector: 'app-analyze',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon],
  templateUrl: './analyze.html',
})
export class Analyze {
  protected readonly state = signal<'idle' | 'reading' | 'done'>('idle');
  protected readonly error = signal<ErrorCode | null>(null);
  protected readonly analysis = signal<CvAnalysis | null>(null);
  protected readonly fileName = signal('');
  protected readonly dragging = signal(false);
  /** Texte lu par position (la plupart des ATS) ou dans l'ordre du fichier (les autres). */
  protected readonly robotModes = ['position', 'file'] as const;
  protected readonly robotMode = signal<'position' | 'file'>('position');
  private readonly pdf = signal<ExtractedPdf | null>(null);

  private readonly router = inject(Router);
  private readonly repository = inject(CvRepository);
  private readonly toast = inject(ToastService);
  private readonly transloco = inject(TranslocoService);

  protected readonly statusIcons = STATUS_ICONS;
  protected readonly categories: CheckCategory[] = ['readability', 'structure', 'content'];
  protected readonly ringRadius = RING_RADIUS;
  protected readonly ringCircumference = 2 * Math.PI * RING_RADIUS;

  protected readonly score = computed(() => this.analysis()?.score ?? 0);
  protected readonly verdict = computed(() => {
    const score = this.score();
    return score >= 85 ? 'excellent' : score >= 65 ? 'good' : score >= 40 ? 'fair' : 'poor';
  });
  protected readonly ringColor = computed(
    () =>
      ({
        excellent: 'var(--accent)',
        good: 'var(--accent)',
        fair: '#d97706',
        poor: 'var(--danger)',
      })[this.verdict()],
  );

  protected checksOf(category: CheckCategory) {
    return this.analysis()?.checks.filter((check) => check.category === category) ?? [];
  }

  protected categoryScore(category: CheckCategory) {
    return this.analysis()?.categories.find((item) => item.id === category);
  }

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) void this.analyze(file);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) void this.analyze(file);
  }

  /** Reprend le CV analysé dans l'éditeur, pour le mettre dans un modèle compatible ATS. */
  protected async importToEditor(): Promise<void> {
    const pdf = this.pdf();
    if (!pdf) return;
    const { cv, items } = importCv(pdf, this.fileName().replace(/\.pdf$/i, ''));
    await this.repository.saveCv(cv);
    this.toast.success(this.transloco.translate('import.done', { items }));
    await this.router.navigate(['/editor', cv.id]);
  }

  protected reset(): void {
    this.analysis.set(null);
    this.error.set(null);
    this.state.set('idle');
  }

  private async analyze(file: File): Promise<void> {
    this.error.set(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.error.set('notPdf');
      return;
    }
    if (file.size > MAX_SIZE) {
      this.error.set('tooLarge');
      return;
    }
    this.fileName.set(file.name);
    this.state.set('reading');
    try {
      const pdf = await extractPdfText(await file.arrayBuffer());
      this.pdf.set(pdf);
      this.analysis.set(analyzeCv(pdf));
      this.state.set('done');
    } catch (error) {
      this.error.set(error instanceof PdfReadError ? error.code : 'unreadable');
      this.state.set('idle');
    }
  }
}
