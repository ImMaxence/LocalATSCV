import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Éventail de rayons (dessin vectoriel sans texte) placé derrière l'en-tête. */
const RAYS = Array.from({ length: 13 }, (_, i) => {
  const angle = (-90 + (i - 6) * 11) * (Math.PI / 180);
  return `M200 160 L${(200 + Math.cos(angle) * 320).toFixed(1)} ${(160 + Math.sin(angle) * 320).toFixed(1)}`;
}).join(' ');

/**
 * Art déco : éventail de rayons derrière l'en-tête, double cadre, chevrons et losanges dorés
 * (ton dérivé de l'accent), capitales espacées en Cormorant. Une seule colonne.
 */
@Component({
  selector: 'app-cv-artdeco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="frame">
        <svg class="rays" viewBox="0 0 400 160" aria-hidden="true">
          <path [attr.d]="rays" />
        </svg>
        <header>
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          <span class="chevrons" aria-hidden="true"></span>
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
          @if (contact().length) {
            <p class="contact">
              @for (item of contact(); track $index) {
                @if (!$first) {
                  <span class="diamond" aria-hidden="true"></span>
                }
                <span>{{ item }}</span>
              }
            </p>
          }
          @if (qr(); as code) {
            <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
          }
        </header>

        @if (summary()) {
          <p class="summary">{{ summary() }}</p>
        }

        @if (letter(); as body) {
          <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
        }
        @for (section of cv().sections; track section.id) {
          <section class="section">
            <h2>{{ sectionTitle(section) }}</h2>
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id) {
                  <p class="skill-row">
                    @if (group.label.trim()) {
                      <strong class="skill-label">{{ group.label }}{{ separator() }}</strong>
                    }
                    <span>{{ keywords(group).join(' · ') }}</span>
                  </p>
                }
              }
              @case ('languages') {
                <ul class="languages">
                  @for (item of languages(section); track item.id) {
                    <li>
                      <span>{{ languageLabel(item) }}</span>
                      @if (languageLevel(item); as level) {
                        <span class="meter" aria-hidden="true">
                          @for (step of levelSteps; track step) {
                            <span class="step" [class.on]="step <= level"></span>
                          }
                        </span>
                      }
                    </li>
                  }
                </ul>
              }
              @case ('interests') {
                <p>{{ interestLine(interests(section)) }}</p>
              }
              @default {
                @for (entry of entries(section); track entry.id) {
                  <div class="entry">
                    <div class="entry-head">
                      <h3>{{ entry.title }}</h3>
                      @if (dates(entry)) {
                        <span class="dates">{{ dates(entry) }}</span>
                      }
                    </div>
                    @if (organization(entry)) {
                      <p class="org">{{ organization(entry) }}</p>
                    }
                    @if (entry.bullets.length) {
                      <ul class="bullets">
                        @for (bullet of entry.bullets; track bullet.id) {
                          <li><app-cv-rich [text]="bullet.text" /></li>
                        }
                      </ul>
                    }
                  </div>
                }
              }
            }
          </section>
        }
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .cv {
      position: relative;
      isolation: isolate;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      overflow: hidden;
      padding: 22px;
      background: #15151a;
      color: #1d1b17;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --gold: oklch(from var(--cv-accent) 0.72 0.11 h);
      --gold-deep: oklch(from var(--cv-accent) 0.55 0.11 h);
      --paper: #f8f4ea;
    }
    /* Éventail au-dessus de la photo, dans le flux : il ne recouvre aucun texte. */
    .rays {
      display: block;
      width: 400px;
      height: 96px;
      margin: calc(-22px * var(--cv-space, 1)) auto calc(-40px * var(--cv-space, 1));
      stroke: var(--gold);
      stroke-width: 1.2;
      opacity: 0.6;
    }
    .frame {
      box-sizing: border-box;
      min-height: calc(1123px / var(--cv-zoom, 1) - 44px);
      padding: calc(40px * var(--cv-space, 1)) 48px calc(36px * var(--cv-space, 1));
      border: 1.5px solid var(--gold);
      outline: 1px solid var(--gold);
      outline-offset: 4px;
      background: var(--paper);
    }
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .photo {
      width: 104px;
      height: 104px;
      margin-bottom: calc(14px * var(--cv-space, 1));
      border: 2px solid var(--gold);
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 0 0 5px var(--paper), 0 0 0 6px var(--gold);
    }
    .name {
      color: #15151a;
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: calc(1.05 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .chevrons {
      display: block;
      width: 200px;
      height: 10px;
      margin: calc(8px * var(--cv-space, 1)) auto;
      background: repeating-linear-gradient(
        135deg,
        var(--gold) 0 2px,
        transparent 2px 7px
      ) 0 0 / 14px 100%;
      -webkit-mask: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent);
      mask: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent);
    }
    .headline {
      color: var(--gold-deep);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: calc(4px * var(--cv-space, 1)) 10px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #4d4840;
      font-size: 11px;
    }
    .diamond {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: var(--gold);
      transform: rotate(45deg);
    }
    .qr {
      width: 60px;
      height: 60px;
      margin-top: calc(12px * var(--cv-space, 1));
      padding: 4px;
      border: 1px solid var(--gold);
      color: #15151a;
    }
    .summary {
      margin-top: calc(20px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 24px;
      border-top: 1px solid var(--gold);
      border-bottom: 1px solid var(--gold);
      font-size: 12.5px;
      font-style: italic;
      text-align: center;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: #15151a;
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h2::before,
    h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent);
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(10px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 15px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: var(--gold-deep);
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .org {
      color: #4d4840;
      font-style: italic;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li::marker {
      color: var(--gold);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row + .skill-row {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      font-weight: 700;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 400px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 6px;
    }
    .step {
      width: 8px;
      height: 8px;
      border: 1px solid var(--gold-deep);
      transform: rotate(45deg);
    }
    .step.on {
      background: var(--gold);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvArtdeco extends CvTemplateBase {
  protected readonly rays = RAYS;
}
