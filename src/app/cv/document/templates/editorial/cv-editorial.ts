import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Éditorial : mise en page de magazine. Grand nom en serif, chapô en italique, filets doubles,
 * rubriques numérotées et portrait décalé sur un aplat de couleur. Tout est typographique :
 * aucune icône, aucune jauge, une seule colonne.
 */
@Component({
  selector: 'app-cv-editorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="cover">
          <div class="identity">
            @if (fullName()) {
              <h1 class="name">{{ fullName() }}</h1>
            }
            @if (cv().profile.title.trim()) {
              <p class="headline">{{ cv().profile.title }}</p>
            }
          </div>
          @if (photoUrl()) {
            <div class="portrait"><img [src]="photoUrl()" alt="" /></div>
          }
        </div>
        @if (contact().length) {
          <ul class="contact">
            @for (item of contact(); track $index) {
              <li>{{ item }}</li>
            }
          </ul>
        }
      </header>

      @if (summary() || qr()) {
        <div class="lead-row">
          @if (summary()) {
            <p class="lead">{{ summary() }}</p>
          }
          @if (qr(); as code) {
            <div class="qr">
              <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
            </div>
          }
        </div>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section">
          <h2>
            <span class="num">{{ number(i) }}</span>
            <span>{{ sectionTitle(section) }}</span>
          </h2>
          @switch (section.kind) {
            @case ('skills') {
              @for (group of skills(section); track group.id) {
                <p class="skill">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  {{ keywords(group).join(' · ') }}
                </p>
              }
            }
            @case ('languages') {
              <p>{{ languageLine(languages(section)) }}</p>
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
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .cv {
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(34px * var(--cv-space, 1)) 60px calc(40px * var(--cv-space, 1));
      background: #fff;
      color: #1c1a17;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 12px;
      line-height: calc(1.55 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --label: 'Inter Variable', sans-serif;
    }
    /* Double filet de une : un trait épais et un trait fin, dessinés en fond. */
    header {
      padding-top: calc(26px * var(--cv-space, 1));
      background:
        linear-gradient(#1c1a17, #1c1a17) 0 0 / 100% 4px no-repeat,
        linear-gradient(#1c1a17, #1c1a17) 0 7px / 100% 1px no-repeat;
    }
    .cover {
      display: flex;
      align-items: flex-end;
      gap: calc(32px * var(--cv-space, 1)) 32px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 50px;
      font-weight: 600;
      line-height: calc(0.98 * var(--cv-leading, 1));
      letter-spacing: -0.02em;
    }
    .headline {
      margin-top: calc(10px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 21px;
      font-style: italic;
    }
    /* L'aplat décalé est sur le cadre : le filtre noir et blanc ne touche que la photo. */
    .portrait {
      width: 112px;
      height: 136px;
      flex-shrink: 0;
      margin: 0 12px calc(12px * var(--cv-space, 1)) 0;
      box-shadow: 12px 12px 0 var(--cv-accent);
    }
    .portrait > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(1) contrast(1.05);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 0;
      margin-top: calc(16px * var(--cv-space, 1));
      padding: calc(6px * var(--cv-space, 1)) 0;
      border-top: 1px solid #1c1a17;
      border-bottom: 1px solid #1c1a17;
      font-family: var(--label);
      font-size: 10.5px;
      letter-spacing: 0.02em;
    }
    .contact > li {
      padding: 0 12px;
    }
    .contact > li:first-child {
      padding-left: 0;
    }
    .contact > li + li {
      border-left: 1px solid #c9c4bb;
    }
    .lead-row {
      display: flex;
      align-items: flex-start;
      gap: calc(28px * var(--cv-space, 1)) 28px;
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .lead {
      min-width: 0;
      flex: 1;
      padding-left: 16px;
      border-left: 3px solid var(--cv-accent);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 15px;
      font-style: italic;
      line-height: calc(1.45 * var(--cv-leading, 1));
      white-space: pre-line;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border: 1px solid #1c1a17;
    }
    .qr-code {
      width: 64px;
      height: 64px;
      color: #1c1a17;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: baseline;
      gap: calc(12px * var(--cv-space, 1)) 12px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      padding-top: calc(6px * var(--cv-space, 1));
      border-top: 1px solid #1c1a17;
      font-family: var(--label);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .num {
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 22px;
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(12px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 15.5px;
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      font-style: italic;
    }
    .org {
      margin-top: calc(1px * var(--cv-space, 1));
      color: #5b564d;
      font-family: var(--label);
      font-size: 10.5px;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill + .skill {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      margin-right: 6px;
      font-family: var(--label);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvEditorial extends CvTemplateBase {
  /** Numéro de rubrique, façon magazine : 01, 02… (les ATS ignorent les chiffres des titres). */
  protected number(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
