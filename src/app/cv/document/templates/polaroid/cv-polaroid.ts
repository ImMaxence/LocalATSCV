import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Polaroid : photo dans un cadre instantané légèrement penché, sections sur des fiches
 * blanches tenues par du ruban adhésif coloré, fond papier crème. Une seule colonne.
 * Seules la photo et les rubans (décor sans texte) sont inclinés.
 */
@Component({
  selector: 'app-cv-polaroid',
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
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
                  <span>{{ item.text }}</span>
                </li>
              }
            </ul>
          }
        </div>
        @if (photoUrl()) {
          <div class="frame">
            <span class="tape tape-top" aria-hidden="true"></span>
            <img class="photo" [src]="photoUrl()" alt="" />
          </div>
        } @else if (qr(); as code) {
          <div class="frame">
            <span class="tape tape-top" aria-hidden="true"></span>
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
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section">
          <span class="tape" [class.tape-alt]="i % 2 === 1" aria-hidden="true"></span>
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
      padding: calc(40px * var(--cv-space, 1)) 50px;
      background:
        radial-gradient(circle at 10% 0%, rgb(255 255 255 / 0.6), transparent 40%),
        #f4efe4;
      color: #2b2620;
      font-family: var(--cv-body-font, 'DM Sans Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --tape: oklch(from var(--cv-accent) 0.82 0.1 h / 0.75);
      --tape-alt: oklch(from var(--cv-accent) 0.84 0.1 calc(h + 150) / 0.75);
      --ink: oklch(from var(--cv-accent) 0.4 0.1 h);
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(24px * var(--cv-space, 1)) 28px;
    }
    .identity {
      min-width: 0;
      flex: 1;
      padding-top: calc(10px * var(--cv-space, 1));
    }
    .name {
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 36px;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 16px;
      font-style: italic;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(14px * var(--cv-space, 1));
      color: #5a5248;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--ink);
    }
    .frame {
      position: relative;
      flex-shrink: 0;
      padding: 10px 10px 34px;
      background: #fff;
      transform: rotate(-3deg);
      box-shadow:
        0 1px 2px rgb(0 0 0 / 0.1),
        0 14px 28px -14px rgb(60 40 10 / 0.45);
    }
    .photo {
      display: block;
      width: 128px;
      height: 128px;
      object-fit: cover;
      background: #ddd;
    }
    .qr {
      width: 128px;
      height: 128px;
      color: #2b2620;
    }
    .tape {
      display: block;
      width: 74px;
      height: 16px;
      margin: 0 auto calc(-10px * var(--cv-space, 1));
      background: var(--tape);
      transform: rotate(-2deg);
      box-shadow: 0 1px 1px rgb(0 0 0 / 0.08);
    }
    .tape-alt {
      background: var(--tape-alt);
      transform: rotate(2deg);
    }
    .tape-top {
      position: absolute;
      top: -10px;
      left: 50%;
      margin: 0 0 0 -37px;
      transform: rotate(4deg);
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      padding: calc(8px * var(--cv-space, 1)) 16px;
      border-left: 3px solid var(--cv-accent);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 13px;
      font-style: italic;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 22px calc(12px * var(--cv-space, 1));
      background: #fff;
      box-shadow:
        0 1px 2px rgb(0 0 0 / 0.08),
        0 10px 24px -16px rgb(60 40 10 / 0.4);
    }
    h2 {
      margin-bottom: calc(8px * var(--cv-space, 1));
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 17px;
      font-weight: 600;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(10px * var(--cv-space, 1));
      padding-top: calc(10px * var(--cv-space, 1));
      border-top: 1px dashed #d9d2c4;
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
      color: #7a7064;
      font-size: 11px;
    }
    .org {
      color: var(--cv-accent);
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
      border-radius: 3px;
      background: #f4efe4;
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
      border-radius: 9999px;
      border: 1.5px solid var(--ink);
    }
    .step.on {
      background: var(--ink);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
      padding: calc(20px * var(--cv-space, 1)) 24px;
      background: #fff;
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
    }
  `,
})
export class CvPolaroid extends CvTemplateBase {}
