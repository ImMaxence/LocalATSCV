import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Origami : en-tête en papier découpé, quatre couches ondulées de la couleur d'accent avec leurs
 * ombres portées, sections en fiches blanches sur fond papier. Les couches sont un dessin placé
 * sous le texte.
 */
@Component({
  selector: 'app-cv-origami',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="hero">
        <div class="hero-main">
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
          </div>
          @if (qr(); as code) {
            <div class="qr">
              <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
            </div>
          }
        </div>
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
      </header>
      <!-- Couches de papier découpé : une bande dessinée sous le bandeau, qui ne recouvre aucun texte. -->
      <svg class="layers" viewBox="0 0 794 96" preserveAspectRatio="none" aria-hidden="true">
        <path class="l1" d="M0 0 H794 V70 C 640 104, 520 42, 380 76 S 120 104, 0 62 Z" />
        <path class="l2" d="M0 0 H794 V52 C 660 84, 540 28, 400 56 S 140 84, 0 44 Z" />
        <path class="l3" d="M0 0 H794 V34 C 650 62, 520 12, 380 38 S 130 62, 0 26 Z" />
        <path class="l4" d="M0 0 H794 V16 C 660 40, 520 -4, 390 18 S 140 40, 0 10 Z" />
      </svg>

      <div class="body">
        @if (summary()) {
          <p class="sheet summary">{{ summary() }}</p>
        }

        @if (letter(); as body) {
          <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
        }
        @for (section of cv().sections; track section.id) {
          <section class="sheet section">
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
      background: #f5f2ec;
      color: #20222a;
      font-family: var(--cv-body-font, 'DM Sans Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .layers {
      display: block;
      width: 100%;
      height: 96px;
      margin-top: -1px;
    }
    .layers path {
      filter: drop-shadow(0 3px 2px rgb(0 0 0 / 0.14));
    }
    .l1 {
      fill: color-mix(in oklab, var(--cv-accent) 30%, white);
    }
    .l2 {
      fill: color-mix(in oklab, var(--cv-accent) 55%, white);
    }
    .l3 {
      fill: color-mix(in oklab, var(--cv-accent) 80%, white);
    }
    .l4 {
      fill: var(--cv-accent);
    }
    .hero {
      padding: calc(34px * var(--cv-space, 1)) 54px calc(14px * var(--cv-space, 1));
      background: var(--cv-accent);
      color: #fff;
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
    }
    .photo {
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      border: 4px solid #fff;
      border-radius: 22px;
      object-fit: cover;
      box-shadow: 0 10px 22px -10px rgb(0 0 0 / 0.5);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 38px;
      font-weight: 800;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: rgb(255 255 255 / 0.9);
      font-size: 15px;
      font-weight: 600;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border-radius: 12px;
      background: #fff;
    }
    .qr-code {
      width: 62px;
      height: 62px;
      color: #20222a;
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      padding: calc(4px * var(--cv-space, 1)) 48px calc(40px * var(--cv-space, 1));
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 18px;
      margin-top: calc(16px * var(--cv-space, 1));
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 14px;
      height: 14px;
    }
    .sheet {
      padding: calc(13px * var(--cv-space, 1)) 18px;
      border-radius: 4px;
      background: #fff;
      box-shadow:
        0 1px 2px rgb(0 0 0 / 0.06),
        0 8px 18px -12px rgb(0 0 0 / 0.25);
    }
    .summary {
      white-space: pre-line;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      margin-bottom: calc(8px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 16px;
      font-weight: 700;
    }
    h2::before {
      content: '';
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      background: linear-gradient(
        135deg,
        var(--cv-accent) 50%,
        color-mix(in oklab, var(--cv-accent) 45%, white) 50%
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
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      font-size: 13.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: var(--cv-accent);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: #5d606b;
      font-weight: 500;
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
      gap: calc(10px * var(--cv-space, 1)) 10px;
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
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 4px;
      background: color-mix(in oklab, var(--cv-accent) 12%, white);
      font-size: 11.5px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .step {
      width: 16px;
      height: 6px;
      background: #e6e3dc;
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvOrigami extends CvTemplateBase {}
