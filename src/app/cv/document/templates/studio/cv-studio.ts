import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { luminance } from '../../../model/color';
import { DEFAULT_BLOCKS, PAPER_PRESETS, StyleShape } from '../../../model/cv-style';
import { Icon } from '../../../../shared/icon/icon';
import { CvLetter } from '../../parts/cv-letter';
import { RichText } from '../../parts/rich-text';
import { SHAPES, shapeColor } from '../../parts/shapes';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Toile du studio : la mise en page vient des blocs choisis dans le style (en-tête, titres,
 * expériences, compétences, colonnes, photo) et des formes posées derrière le texte.
 * Ses classes `cv-*` sont stables et documentées pour le CSS personnalisé.
 * Les variantes ne jouent que sur les grilles, bordures et fonds : le texte reste dans le flux,
 * dans l'ordre de lecture (colonne latérale après la colonne principale).
 */
@Component({
  selector: 'app-cv-studio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RichText, CvLetter, NgTemplateOutlet],
  template: `
    <article
      class="cv"
      [class]="classes()"
      [attr.lang]="cv().language"
      [style.--cv-accent]="cv().accentColor"
      [style.--cv-paper]="colors().paper"
      [style.--cv-ink]="colors().ink"
    >
      @for (shape of shapes(); track shape.id) {
        <svg
          class="cv-shape"
          viewBox="0 0 100 100"
          aria-hidden="true"
          [style.left]="'calc(' + shape.x + ' * 7.94px / var(--cv-zoom, 1))'"
          [style.top]="'calc(' + shape.y + ' * 11.23px / var(--cv-zoom, 1))'"
          [style.width]="'calc(' + shape.size + ' * 7.94px / var(--cv-zoom, 1))'"
        >
          <g [attr.transform]="'rotate(' + shape.rotate + ' 50 50)'">
            <path
              [attr.d]="geometry[shape.kind].d"
              [attr.transform]="geometry[shape.kind].transform ?? null"
              [attr.stroke-width]="geometry[shape.kind].strokeWidth ?? null"
              [style.fill]="geometry[shape.kind].mode === 'fill' ? color(shape) : 'none'"
              [style.stroke]="geometry[shape.kind].mode === 'stroke' ? color(shape) : 'none'"
            />
          </g>
        </svg>
      }

      @if (!columns()) {
        <ng-container *ngTemplateOutlet="headerBlock" />
      }
      <div class="cv-body">
        <div class="cv-main">
          @if (columns()) {
            <ng-container *ngTemplateOutlet="headerBlock" />
          }
          @if (summary()) {
            <p class="cv-summary">{{ summary() }}</p>
          }
          @if (letter(); as body) {
            <app-cv-letter class="letter cv-letter" [letter]="body" [cv]="cv()" />
          }
          @for (section of mainList(); track section.id) {
            <ng-container *ngTemplateOutlet="sectionBlock; context: { $implicit: section }" />
          }
        </div>
        @if (columns()) {
          <!-- Colonne sur toute la hauteur, écrite après la colonne principale dans le PDF -->
          <aside class="cv-side">
            @if (showPhoto()) {
              <img class="cv-photo" [src]="photoUrl()" alt="" />
            }
            @for (section of sideSections(); track section.id) {
              <ng-container *ngTemplateOutlet="sectionBlock; context: { $implicit: section }" />
            }
          </aside>
        }
      </div>
    </article>

    <!-- En une colonne, l'en-tête occupe toute la largeur ; en deux colonnes, il ouvre la
         colonne principale et la photo passe en haut de la colonne latérale. -->
    <ng-template #headerBlock>
      <header class="cv-header">
        @if (!columns() && showPhoto()) {
          <img class="cv-photo" [src]="photoUrl()" alt="" />
        }
        <div class="cv-identity">
          @if (fullName()) {
            <h1 class="cv-name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="cv-headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (contactItems().length) {
          <ul class="cv-contact">
            @for (item of contactItems(); track $index) {
              <li>
                <app-icon class="cv-contact-icon" [name]="item.icon" [strokeWidth]="2" />
                <span>{{ item.text }}</span>
              </li>
            }
          </ul>
        }
      </header>
    </ng-template>

    <ng-template #sectionBlock let-section>
      <section class="cv-section" [attr.data-kind]="section.kind">
        <h2 class="cv-heading">{{ sectionTitle(section) }}</h2>
        @switch (section.kind) {
          @case ('skills') {
            <div class="cv-skills">
              @for (group of skills(section); track group.id) {
                <div class="cv-skill">
                  @if (group.label.trim()) {
                    <strong class="cv-skill-label"
                      >{{ group.label }}
                      @if (blocks().skills === 'inline') {
                        {{ separator() }}
                      }
                    </strong>
                  }
                  @if (blocks().skills === 'chips') {
                    <ul class="cv-chips">
                      @for (keyword of keywords(group); track $index) {
                        <li class="cv-chip">{{ keyword }}</li>
                      }
                    </ul>
                  } @else {
                    <span class="cv-keywords">{{ group.keywords }}</span>
                  }
                </div>
              }
            </div>
          }
          @case ('languages') {
            @if (blocks().languages === 'meter') {
              <ul class="cv-languages">
                @for (item of languages(section); track item.id) {
                  <li>
                    <span
                      ><strong>{{ item.name }}</strong>
                      @if (item.level.trim()) {
                        <span class="cv-level">{{ separator() }}{{ item.level }}</span>
                      }
                    </span>
                    @if (languageLevel(item); as level) {
                      <span class="cv-meter" aria-hidden="true">
                        @for (step of levelSteps; track step) {
                          <span class="cv-step" [class.on]="step <= level"></span>
                        }
                      </span>
                    }
                  </li>
                }
              </ul>
            } @else {
              <p>{{ languageLine(languages(section)) }}</p>
            }
          }
          @case ('interests') {
            @if (blocks().skills === 'chips') {
              <ul class="cv-chips">
                @for (item of interests(section); track item.id) {
                  <li class="cv-chip">{{ item.label }}</li>
                }
              </ul>
            } @else {
              <p>{{ interestLine(interests(section)) }}</p>
            }
          }
          @default {
            <div class="cv-entries">
              @for (entry of entries(section); track entry.id) {
                <div class="cv-entry">
                  @if (datesFirst() && dates(entry)) {
                    <p class="cv-dates">{{ dates(entry) }}</p>
                  }
                  <div class="cv-entry-body">
                    <div class="cv-entry-head">
                      <h3 class="cv-entry-title">{{ entry.title }}</h3>
                      @if (!datesFirst() && dates(entry)) {
                        <p class="cv-dates">{{ dates(entry) }}</p>
                      }
                    </div>
                    @if (organization(entry)) {
                      <p class="cv-entry-org">{{ organization(entry) }}</p>
                    }
                    @if (entry.bullets.length) {
                      <ul class="cv-bullets">
                        @for (bullet of entry.bullets; track bullet.id) {
                          <li><app-cv-rich [text]="bullet.text" /></li>
                        }
                      </ul>
                    }
                  </div>
                </div>
              }
            </div>
          }
        }
      </section>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
    .cv {
      --soft: color-mix(in srgb, var(--cv-accent) 14%, var(--cv-paper));
      --tint: color-mix(in srgb, var(--cv-accent) 6%, var(--cv-paper));
      --muted: color-mix(in srgb, var(--cv-ink) 66%, var(--cv-paper));
      --line: color-mix(in srgb, var(--cv-ink) 14%, var(--cv-paper));
      --r: 8px;
      /* Texte en couleur d'accent, éclairci sur un fond sombre pour rester lisible. */
      --accent-text: var(--cv-accent);
      position: relative;
      /* Formes sous le texte (z-index négatif) : le texte reste hors de tout calque. */
      isolation: isolate;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      overflow: hidden;
      background: var(--cv-paper);
      color: var(--cv-ink);
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .paper-dark {
      --accent-text: color-mix(in oklab, var(--cv-accent) 50%, white);
    }
    .cv-shape {
      position: absolute;
      z-index: -1;
      height: auto;
      aspect-ratio: 1;
      overflow: hidden;
      pointer-events: none;
    }
    h1,
    h2,
    h3 {
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
    }

    /* --- En-tête --- */
    .cv-header {
      display: grid;
      grid-template: 'photo id' auto 'photo contact' auto / auto 1fr;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 24px;
      padding: calc(40px * var(--cv-space, 1)) 48px calc(20px * var(--cv-space, 1));
    }
    .cv-photo {
      grid-area: photo;
      width: 112px;
      height: 112px;
      border-radius: 50%;
      object-fit: cover;
    }
    .photo-rounded .cv-photo {
      border-radius: 18px;
    }
    .photo-square .cv-photo {
      border-radius: 0;
    }
    .cv-identity {
      grid-area: id;
      align-self: end;
    }
    .cv-name {
      font-size: 30px;
      font-weight: 700;
      line-height: calc(1.15 * var(--cv-leading, 1));
    }
    .cv-headline {
      margin-top: calc(3px * var(--cv-space, 1));
      color: var(--accent-text);
      font-size: 15px;
      font-weight: 600;
    }
    .cv-contact {
      grid-area: contact;
      align-self: start;
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      color: var(--muted);
      font-size: 11px;
    }
    .cv-contact > li {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .cv-contact-icon {
      width: 12px;
      height: 12px;
      color: var(--accent-text);
    }
    .header-center .cv-header {
      grid-template: 'photo' auto 'id' auto 'contact' auto / 1fr;
      justify-items: center;
      text-align: center;
    }
    .header-center .cv-contact {
      justify-content: center;
    }
    .header-band .cv-header {
      margin-bottom: calc(18px * var(--cv-space, 1));
      padding-bottom: calc(28px * var(--cv-space, 1));
      background: var(--cv-accent);
      color: #fff;
    }
    .header-band .cv-photo {
      border: 4px solid rgb(255 255 255 / 0.85);
    }
    .header-band :is(.cv-headline, .cv-contact, .cv-contact-icon) {
      color: #fff;
    }
    /* Coordonnées encadrées sous le nom (jamais à côté : un ATS mêlerait les lignes). */
    .header-card .cv-header {
      grid-template: 'id photo' auto 'contact contact' auto / 1fr auto;
    }
    .header-card .cv-contact {
      margin-top: calc(6px * var(--cv-space, 1));
      padding: calc(9px * var(--cv-space, 1)) 14px;
      border-radius: var(--r);
      background: var(--tint);
      box-shadow: inset 0 0 0 1px var(--line);
    }

    /* --- Corps et colonnes --- */
    .cv-body {
      display: grid;
      flex: 1;
      grid-template-columns: minmax(0, 1fr);
      padding: 0 48px calc(40px * var(--cv-space, 1));
    }
    /* Deux colonnes sur toute la hauteur, comme le modèle Colonne latérale : les ATS les
       repèrent mieux que des colonnes posées sous un en-tête pleine largeur. */
    .layout-sidebarLeft .cv-body {
      grid-template-columns: 220px minmax(0, 1fr);
      padding: 0;
    }
    /* Placement par la grille, jamais par order : le texte garde l'ordre du document. */
    .layout-sidebarLeft .cv-main {
      grid-area: 1 / 2;
    }
    .layout-sidebarLeft .cv-side {
      grid-area: 1 / 1;
    }
    .columns .cv-main {
      padding: calc(40px * var(--cv-space, 1)) 40px;
    }
    .columns .cv-side {
      padding: calc(40px * var(--cv-space, 1)) 22px;
      background: var(--tint);
    }
    .columns .cv-side .cv-photo {
      display: block;
      width: 150px;
      height: 150px;
      margin: 0 auto calc(4px * var(--cv-space, 1));
    }
    .columns .cv-header {
      grid-template: 'id' auto 'contact' auto / 1fr;
      margin: 0;
      padding: 0 0 calc(4px * var(--cv-space, 1));
    }
    .columns.header-band .cv-header {
      margin: calc(-40px * var(--cv-space, 1)) -40px 0;
      padding: calc(40px * var(--cv-space, 1)) 40px calc(24px * var(--cv-space, 1));
    }
    .cv-summary {
      white-space: pre-line;
    }
    .cv-section,
    .cv-letter {
      display: block;
      margin-top: calc(18px * var(--cv-space, 1));
    }

    /* --- Titres des rubriques --- */
    .cv-heading {
      margin-bottom: calc(8px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 700;
    }
    .headings-underline .cv-heading {
      padding-bottom: calc(3px * var(--cv-space, 1));
      border-bottom: 2px solid var(--cv-accent);
    }
    .headings-bar .cv-heading {
      padding-left: 9px;
      border-left: 4px solid var(--cv-accent);
    }
    .headings-pill .cv-heading {
      display: table;
      padding: calc(2px * var(--cv-space, 1)) 12px;
      border-radius: 999px;
      background: var(--cv-accent);
      color: #fff;
      font-size: 13px;
    }
    .headings-caps .cv-heading {
      color: var(--accent-text);
      font-size: 12.5px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .headings-boxed .cv-heading {
      padding: calc(3px * var(--cv-space, 1)) 10px;
      border-radius: var(--r);
      background: var(--soft);
    }
    .headings-line .cv-heading {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .headings-line .cv-heading::after {
      content: '';
      flex: 1;
      height: 1.5px;
      background: var(--soft);
    }

    /* --- Expériences et formations --- */
    .cv-entry {
      break-inside: avoid;
    }
    .cv-entry + .cv-entry {
      margin-top: calc(11px * var(--cv-space, 1));
    }
    .cv-entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }
    .cv-entry-title {
      font-size: 13px;
      font-weight: 650;
    }
    .cv-dates {
      flex-shrink: 0;
      color: var(--muted);
      font-size: 11px;
      white-space: nowrap;
    }
    .cv-entry-org {
      color: var(--accent-text);
      font-weight: 500;
    }
    .cv-bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .cv-bullets > li::marker {
      color: var(--cv-accent);
    }
    .entries-timeline .cv-entries {
      margin-left: 4px;
      padding-left: 18px;
      border-left: 2px solid var(--soft);
    }
    /* Pastille en flottant, pas en absolu : dans le PDF, le texte garde l'ordre du document. */
    .entries-timeline .cv-entry::before {
      content: '';
      float: left;
      width: 10px;
      height: 10px;
      margin: 4px 0 0 -24px;
      border-radius: 50%;
      background: var(--cv-accent);
    }
    .entries-cards .cv-entry {
      padding: calc(9px * var(--cv-space, 1)) 12px;
      border: 1px solid var(--line);
      border-radius: var(--r);
      background: var(--tint);
    }
    .entries-cards .cv-entry + .cv-entry {
      margin-top: calc(8px * var(--cv-space, 1));
    }
    /* Dates et intitulé sur la même ligne de base : un ATS les lit dans l'ordre du fichier. */
    .entries-datesLeft .cv-entry {
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr);
      align-items: baseline;
      gap: 14px;
    }
    .entries-datesLeft .cv-dates {
      white-space: normal;
    }

    /* --- Compétences, langues, centres d'intérêt --- */
    .cv-skill + .cv-skill {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .cv-skill-label {
      display: block;
      margin-bottom: calc(3px * var(--cv-space, 1));
      font-weight: 650;
    }
    .skills-inline .cv-skill-label {
      display: inline;
    }
    .skills-grid .cv-main .cv-skills {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: calc(8px * var(--cv-space, 1)) 20px;
    }
    .skills-grid .cv-skill + .cv-skill {
      margin-top: 0;
    }
    .cv-chips {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 5px;
    }
    .cv-chip {
      padding: calc(1px * var(--cv-space, 1)) 9px;
      border-radius: var(--r);
      background: var(--soft);
      font-size: 11px;
    }
    .cv-languages > li {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 14px;
    }
    .cv-languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .cv-level {
      color: var(--muted);
    }
    .cv-meter {
      display: flex;
      gap: 4px;
    }
    .cv-step {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--line);
    }
    .cv-step.on {
      background: var(--cv-accent);
    }
  `,
})
export class CvStudio extends CvTemplateBase {
  protected readonly geometry = SHAPES;
  protected readonly color = shapeColor;

  private readonly style = computed(() => this.cv().style);
  protected readonly blocks = computed(() => this.style()?.blocks ?? DEFAULT_BLOCKS);
  protected readonly colors = computed(() => this.style()?.colors ?? PAPER_PRESETS[0]);
  protected readonly shapes = computed((): StyleShape[] => this.style()?.shapes ?? []);

  protected readonly columns = computed(() => this.blocks().layout !== 'single');
  protected readonly datesFirst = computed(() => this.blocks().entries === 'datesLeft');
  protected readonly showPhoto = computed(
    () => !!this.photoUrl() && this.blocks().photo !== 'hidden',
  );
  /** En une colonne, toutes les rubriques dans l'ordre choisi ; sinon la colonne principale. */
  protected readonly mainList = computed(() =>
    this.columns() ? this.mainSections() : this.cv().sections,
  );

  protected readonly classes = computed(() => {
    const blocks = this.blocks();
    return [
      'cv',
      `layout-${blocks.layout}`,
      this.columns() ? 'columns' : '',
      `header-${blocks.header}`,
      `headings-${blocks.headings}`,
      `entries-${blocks.entries}`,
      `skills-${blocks.skills}`,
      `photo-${blocks.photo}`,
      luminance(this.colors().paper) < 0.25 ? 'paper-dark' : '',
    ].join(' ');
  });
}
