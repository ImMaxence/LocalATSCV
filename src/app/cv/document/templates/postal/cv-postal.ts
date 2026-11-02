import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Postal : bordure « par avion » à rayures obliques, photo dans un cadre de timbre dentelé,
 * cachet de la poste (anneaux et lignes ondulées) dans l'angle, serif Lora. Une seule colonne.
 */
@Component({
  selector: 'app-cv-postal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="postmark" aria-hidden="true">
        <span class="waves"></span>
      </div>
      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
          @if (contactItems().length) {
            <ul class="contact">
              @for (item of contactItems(); track $index) {
                <li>
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="1.75" />
                  <span>{{ item.text }}</span>
                </li>
              }
            </ul>
          }
        </div>
        @if (photoUrl()) {
          <div class="stamp">
            <img class="photo" [src]="photoUrl()" alt="" />
          </div>
        } @else if (qr(); as code) {
          <div class="stamp">
            <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
          </div>
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
                <div class="skill-row">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  <ul class="chips">
                    @for (keyword of keywords(group); track $index) {
                      <li>{{ keyword }}</li>
                    }
                  </ul>
                </div>
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
              <ul class="chips">
                @for (item of interests(section); track item.id) {
                  <li>{{ item.label }}</li>
                }
              </ul>
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
      position: relative;
      isolation: isolate;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      overflow: hidden;
      padding: calc(48px * var(--cv-space, 1)) 58px calc(48px * var(--cv-space, 1));
      border: 12px solid transparent;
      background:
        linear-gradient(#fdfcf8, #fdfcf8) padding-box,
        repeating-linear-gradient(
            -45deg,
            var(--cv-accent) 0 22px,
            #fdfcf8 22px 36px,
            var(--second) 36px 58px,
            #fdfcf8 58px 72px
          )
          border-box;
      color: #2a2a2a;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.55 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --second: oklch(from var(--cv-accent) 0.5 0.15 calc(h + 180));
      --ink: oklch(from var(--cv-accent) 0.4 0.12 h);
      --tint: oklch(from var(--cv-accent) 0.94 0.03 h);
    }
    .postmark {
      position: absolute;
      z-index: -1;
      top: 30px;
      right: 190px;
      width: 96px;
      height: 96px;
      border: 2px solid var(--ink);
      border-radius: 9999px;
      box-shadow: inset 0 0 0 5px #fdfcf8, inset 0 0 0 7px var(--ink);
      opacity: 0.45;
    }
    .waves {
      position: absolute;
      top: 40px;
      left: 92px;
      width: 110px;
      height: 18px;
      background: repeating-linear-gradient(180deg, var(--ink) 0 2px, transparent 2px 6px);
      -webkit-mask: radial-gradient(circle at 10px 50%, transparent 0 7px, #000 7px) 0 0 / 20px 100%;
      mask: radial-gradient(circle at 10px 50%, transparent 0 7px, #000 7px) 0 0 / 20px 100%;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(24px * var(--cv-space, 1)) 30px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #1b1b1b;
      font-family: var(--cv-heading-font, 'Lora Variable', serif);
      font-size: 34px;
      font-weight: 700;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--ink);
      font-size: 15px;
      font-style: italic;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(14px * var(--cv-space, 1));
      color: #555;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--ink);
    }
    .stamp {
      flex-shrink: 0;
      padding: 8px;
      background: #fff;
      /* Dentelure du timbre : trous ronds sur tout le pourtour. */
      -webkit-mask:
        radial-gradient(circle at 0 0, transparent 4px, #000 4.5px) 0 0 / 14px 14px,
        linear-gradient(#000, #000);
      -webkit-mask-composite: source-in;
      mask:
        radial-gradient(circle at 0 0, transparent 4px, #000 4.5px) 0 0 / 14px 14px,
        linear-gradient(#000, #000);
      mask-composite: intersect;
      box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);
    }
    .photo {
      display: block;
      width: 112px;
      height: 136px;
      border: 1px solid #ddd;
      object-fit: cover;
    }
    .qr {
      width: 112px;
      height: 112px;
      padding: 8px;
      border: 1px solid #ddd;
      color: #1b1b1b;
    }
    .summary {
      margin-top: calc(20px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 16px;
      background: var(--tint);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Lora Variable', serif);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      flex: 1;
      height: 6px;
      background: repeating-linear-gradient(
        -45deg,
        var(--cv-accent) 0 8px,
        transparent 8px 14px,
        var(--second) 14px 22px,
        transparent 22px 28px
      );
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
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #6a6a6a;
      font-size: 11px;
      font-style: italic;
    }
    .org {
      color: var(--second);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .skill-row + .skill-row {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .skill-label {
      flex-shrink: 0;
      max-width: 40%;
      font-weight: 700;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 1px 9px;
      border: 1px solid var(--ink);
      border-radius: 2px;
      font-size: 11px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 4px;
    }
    .step {
      width: 10px;
      height: 10px;
      border: 1.5px solid var(--ink);
      border-radius: 9999px;
    }
    .step.on {
      background: var(--ink);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvPostal extends CvTemplateBase {}
