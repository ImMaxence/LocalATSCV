import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { BLOBS } from '../../parts/blobs';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Aquarelle : taches de couleur diluée et floutées (formes organiques sans texte, le flou ne
 * s'applique qu'à elles), titres en Cormorant avec un coup de pinceau. Une seule colonne.
 */
@Component({
  selector: 'app-cv-watercolor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="wash wash-a" viewBox="0 0 200 200" aria-hidden="true">
        <path [attr.d]="blobs[0]" transform="translate(100 100)" />
      </svg>
      <svg class="wash wash-b" viewBox="0 0 200 200" aria-hidden="true">
        <path [attr.d]="blobs[2]" transform="translate(100 100)" />
      </svg>
      <svg class="wash wash-c" viewBox="0 0 200 200" aria-hidden="true">
        <path [attr.d]="blobs[1]" transform="translate(100 100)" />
      </svg>
      <header>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
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
          <h2><span class="brush">{{ sectionTitle(section) }}</span></h2>
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
      padding: calc(50px * var(--cv-space, 1)) 58px calc(46px * var(--cv-space, 1));
      background: #fdfcfa;
      color: #2e2b2f;
      font-family: var(--cv-body-font, 'DM Sans Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --w1: oklch(from var(--cv-accent) 0.8 0.12 h / 0.55);
      --w2: oklch(from var(--cv-accent) 0.82 0.11 calc(h + 70) / 0.45);
      --w3: oklch(from var(--cv-accent) 0.85 0.1 calc(h - 60) / 0.45);
      --ink: oklch(from var(--cv-accent) 0.42 0.12 h);
    }
    .wash {
      position: absolute;
      z-index: -1;
      filter: blur(14px);
    }
    .wash-a {
      top: -120px;
      right: -80px;
      width: 420px;
      height: 420px;
      fill: var(--w1);
    }
    .wash-b {
      top: 40px;
      right: 160px;
      width: 260px;
      height: 260px;
      fill: var(--w2);
    }
    .wash-c {
      bottom: -140px;
      left: -120px;
      width: 380px;
      height: 380px;
      fill: var(--w3);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 24px;
    }
    .photo {
      width: 120px;
      height: 120px;
      flex-shrink: 0;
      border: 4px solid #fff;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 6px 18px -8px rgb(0 0 0 / 0.3);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #1f1c22;
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 42px;
      font-weight: 600;
      line-height: calc(1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--ink);
      font-size: 15px;
      font-weight: 500;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #5f5a62;
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
    .qr {
      width: 66px;
      height: 66px;
      flex-shrink: 0;
      padding: 5px;
      border-radius: 10px;
      background: #fff;
      color: #1f1c22;
      box-shadow: 0 6px 18px -8px rgb(0 0 0 / 0.3);
    }
    .summary {
      margin-top: calc(20px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 15px;
      line-height: calc(1.4 * var(--cv-leading, 1));
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(9px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 22px;
      font-weight: 600;
    }
    .brush {
      padding: 0 10px 0 6px;
      background: linear-gradient(100deg, var(--w1) 0%, var(--w1) 80%, transparent 100%);
      border-radius: 40% 60% 55% 45% / 60% 40% 60% 40%;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
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
      color: #7a7480;
      font-size: 11px;
    }
    .org {
      color: var(--ink);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--ink);
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
      gap: calc(5px * var(--cv-space, 1)) 6px;
    }
    .chips > li {
      padding: 1px 10px;
      border-radius: 9999px;
      background: var(--w2);
      font-size: 11px;
    }
    .chips > li:nth-child(3n + 2) {
      background: var(--w3);
    }
    .chips > li:nth-child(3n) {
      background: var(--w1);
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
      width: 12px;
      height: 12px;
      border-radius: 45% 55% 50% 50% / 55% 45% 55% 45%;
      background: #ebe7ea;
    }
    .step.on {
      background: var(--w1);
      box-shadow: inset 0 0 0 1px var(--ink);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvWatercolor extends CvTemplateBase {
  protected readonly blobs = BLOBS;
}
