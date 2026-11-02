import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * BD : trame de points en demi-teinte derrière l'en-tête, titres dans des bulles de dialogue,
 * cases bordées de noir, jaune et accent. Une seule colonne. Les queues de bulle sont des
 * pseudo-éléments sans texte.
 */
@Component({
  selector: 'app-cv-comic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
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
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2.25" />
                  <span>{{ item.text }}</span>
                </li>
              }
            </ul>
          }
        </div>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        } @else if (qr(); as code) {
          <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
        }
      </header>

      @if (summary()) {
        <p class="summary">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section" [class.alt]="i % 2 === 1">
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(34px * var(--cv-space, 1)) 48px calc(40px * var(--cv-space, 1));
      background: #fff;
      color: #141414;
      font-family: var(--cv-body-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --yellow: #ffd93b;
      --dots: oklch(from var(--cv-accent) 0.7 0.17 h);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 24px;
      padding: calc(18px * var(--cv-space, 1)) 26px;
      border: 3px solid #141414;
      background-color: var(--yellow);
      background-image: radial-gradient(var(--dots) 2.2px, transparent 2.6px);
      background-size: 12px 12px;
      box-shadow: 7px 7px 0 #141414;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      display: inline-block;
      padding: 2px 12px;
      background: #fff;
      border: 3px solid #141414;
      box-shadow: 4px 4px 0 #141414;
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(12px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 800;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 14px;
      margin-top: calc(10px * var(--cv-space, 1));
      font-weight: 600;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
    }
    .photo {
      width: 124px;
      height: 124px;
      flex-shrink: 0;
      border: 3px solid #141414;
      object-fit: cover;
      box-shadow: 5px 5px 0 var(--cv-accent);
    }
    .qr {
      width: 92px;
      height: 92px;
      flex-shrink: 0;
      padding: 6px;
      border: 3px solid #141414;
      background: #fff;
      color: #141414;
      box-shadow: 5px 5px 0 var(--cv-accent);
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      padding: calc(8px * var(--cv-space, 1)) 16px;
      border: 3px solid #141414;
      border-radius: 18px;
      font-size: 12.5px;
      font-weight: 500;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 18px calc(11px * var(--cv-space, 1));
      border: 3px solid #141414;
      box-shadow: 5px 5px 0 var(--cv-accent);
    }
    .section.alt {
      box-shadow: 5px 5px 0 var(--yellow);
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(10px * var(--cv-space, 1));
      padding: 1px 14px;
      border: 3px solid #141414;
      border-radius: 9999px;
      background: var(--cv-accent);
      color: #fff;
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .section.alt h2 {
      background: var(--yellow);
      color: #141414;
    }
    h2::after {
      content: '';
      display: block;
      width: 12px;
      height: 12px;
      margin: -3px 0 -9px 18px;
      border-right: 3px solid #141414;
      border-bottom: 3px solid #141414;
      background: inherit;
      transform: skewX(30deg) rotate(45deg);
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
      font-size: 13.5px;
      font-weight: 800;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 8px;
      border: 2px solid #141414;
      background: var(--yellow);
      font-size: 10.5px;
      font-weight: 800;
    }
    .org {
      font-weight: 700;
      color: var(--cv-accent);
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
      font-weight: 800;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 6px;
    }
    .chips > li {
      padding: 0 9px;
      border: 2px solid #141414;
      background: #fff;
      box-shadow: 2px 2px 0 #141414;
      font-size: 11px;
      font-weight: 700;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(5px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 3px;
    }
    .step {
      width: 14px;
      height: 12px;
      border: 2px solid #141414;
      background: #fff;
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
      padding: calc(20px * var(--cv-space, 1)) 24px;
      border: 3px solid #141414;
      box-shadow: 5px 5px 0 var(--cv-accent);
    }
  `,
})
export class CvComic extends CvTemplateBase {}
