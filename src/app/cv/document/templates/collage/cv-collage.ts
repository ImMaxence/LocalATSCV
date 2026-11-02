import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Collage : morceaux de papier aux bords irréguliers (rayons de coin inégaux), ruban adhésif,
 * photo penchée, mélange d'une serif italique et d'une grotesque en capitales. Une seule colonne.
 * Seules la photo et les rubans (sans texte) sont inclinés.
 */
@Component({
  selector: 'app-cv-collage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="identity scrap scrap-a">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (photoUrl()) {
          <div class="photo-wrap">
            <span class="tape" aria-hidden="true"></span>
            <img class="photo" [src]="photoUrl()" alt="" />
          </div>
        } @else if (qr(); as code) {
          <div class="photo-wrap">
            <span class="tape" aria-hidden="true"></span>
            <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
          </div>
        }
      </header>
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

      @if (summary()) {
        <p class="summary scrap scrap-b">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter scrap scrap-c" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section scrap" [attr.data-scrap]="i % 3">
          <span class="tape tape-section" [class.tape-alt]="i % 2 === 1" aria-hidden="true"></span>
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
      padding: calc(36px * var(--cv-space, 1)) 50px calc(40px * var(--cv-space, 1));
      background:
        repeating-linear-gradient(0deg, transparent 0 27px, rgb(0 0 0 / 0.035) 27px 28px),
        #e9e4da;
      color: #2a2722;
      font-family: var(--cv-body-font, 'Archivo Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --p1: oklch(from var(--cv-accent) 0.9 0.07 h);
      --p2: oklch(from var(--cv-accent) 0.92 0.06 calc(h + 120));
      --p3: #fffdf7;
      --tape: oklch(from var(--cv-accent) 0.8 0.12 calc(h + 60) / 0.7);
      --tape-alt: oklch(from var(--cv-accent) 0.78 0.13 calc(h - 90) / 0.7);
      --ink: oklch(from var(--cv-accent) 0.4 0.12 h);
    }
    /* Bords irréguliers : rayons de coin inégaux, comme du papier découpé à la main. */
    .scrap {
      background: var(--p3);
      border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      box-shadow:
        0 1px 2px rgb(0 0 0 / 0.1),
        0 8px 18px -12px rgb(40 30 10 / 0.5);
    }
    .scrap-a {
      background: var(--p1);
      border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px;
    }
    .scrap-b {
      background: var(--p2);
    }
    .scrap-c {
      border-radius: 225px 15px 255px 15px / 15px 255px 15px 225px;
    }
    .section[data-scrap='1'] {
      background: var(--p1);
      border-radius: 15px 255px 15px 225px / 225px 15px 255px 15px;
    }
    .section[data-scrap='2'] {
      background: var(--p2);
      border-radius: 225px 15px 255px 15px / 15px 255px 15px 225px;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 28px;
    }
    .identity {
      min-width: 0;
      flex: 1;
      padding: calc(20px * var(--cv-space, 1)) 26px;
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 38px;
      font-weight: 700;
      font-style: italic;
      line-height: calc(1.02 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(8px * var(--cv-space, 1));
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .photo-wrap {
      flex-shrink: 0;
      padding: 8px;
      background: #fff;
      transform: rotate(3deg);
      box-shadow: 0 6px 16px -8px rgb(40 30 10 / 0.5);
    }
    .photo {
      display: block;
      width: 118px;
      height: 138px;
      object-fit: cover;
      filter: saturate(0.85);
    }
    .qr {
      width: 118px;
      height: 118px;
      color: #2a2722;
    }
    .tape {
      display: block;
      width: 70px;
      height: 18px;
      margin: -16px auto 0;
      background: var(--tape);
      transform: rotate(-3deg);
      box-shadow: 0 1px 1px rgb(0 0 0 / 0.08);
    }
    .tape-alt {
      background: var(--tape-alt);
      transform: rotate(2deg);
    }
    .tape-section {
      margin: calc(-6px * var(--cv-space, 1)) 0 0 24px;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(14px * var(--cv-space, 1));
      padding: 0 8px;
      color: #4f4a42;
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
    .summary {
      margin-top: calc(12px * var(--cv-space, 1));
      padding: calc(9px * var(--cv-space, 1)) 22px;
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 13px;
      font-style: italic;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(12px * var(--cv-space, 1));
      padding: calc(6px * var(--cv-space, 1)) 22px calc(10px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(8px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 18px;
      font-weight: 700;
      font-style: italic;
      color: var(--ink);
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
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .dates {
      flex-shrink: 0;
      color: #6a645a;
      font-size: 11px;
      font-weight: 600;
    }
    .org {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 12.5px;
      font-style: italic;
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
      padding: 1px 9px;
      background: #fff;
      border-radius: 40px 8px 40px 8px / 8px 40px 8px 40px;
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
      font-size: 11px;
      font-weight: 600;
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
      width: 11px;
      height: 11px;
      border-radius: 50% 40% 55% 45%;
      background: #fff;
      box-shadow: inset 0 0 0 1.5px var(--ink);
    }
    .step.on {
      background: var(--ink);
    }
    .letter {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(18px * var(--cv-space, 1)) 24px;
    }
  `,
})
export class CvCollage extends CvTemplateBase {}
