import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Stickers : titres et étiquettes en autocollants découpés (liseré blanc épais puis contour de
 * couleur), photo ronde en sticker, fond à pois discrets. Joyeux, une seule colonne.
 */
@Component({
  selector: 'app-cv-sticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
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
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2.25" />
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
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section" [attr.data-tone]="i % 4">
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
      padding: calc(44px * var(--cv-space, 1)) 52px calc(44px * var(--cv-space, 1));
      background:
        radial-gradient(oklch(from var(--cv-accent) 0.9 0.05 h) 1.6px, transparent 2px) 0 0 / 18px 18px,
        #fefefe;
      color: #23242a;
      font-family: var(--cv-body-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --t0: var(--cv-accent);
      --t1: oklch(from var(--cv-accent) 0.68 0.17 calc(h + 90));
      --t2: oklch(from var(--cv-accent) 0.7 0.16 calc(h + 200));
      --t3: oklch(from var(--cv-accent) 0.72 0.16 calc(h - 60));
      --sticker: 0 0 0 3px #fff, 0 0 0 5px var(--tone), 0 4px 10px -4px rgb(0 0 0 / 0.3);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(24px * var(--cv-space, 1)) 28px;
    }
    .photo {
      --tone: var(--t0);
      width: 118px;
      height: 118px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: var(--sticker);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      --tone: var(--t0);
      display: inline-block;
      padding: 2px 16px;
      border-radius: 9999px;
      background: #fff;
      color: var(--t0);
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.15 * var(--cv-leading, 1));
      box-shadow: var(--sticker);
    }
    .headline {
      margin-top: calc(12px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 700;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 14px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #4b4d57;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--t1);
    }
    .qr {
      --tone: var(--t2);
      width: 70px;
      height: 70px;
      flex-shrink: 0;
      padding: 6px;
      border-radius: 14px;
      background: #fff;
      color: #23242a;
      box-shadow: var(--sticker);
    }
    .summary {
      --tone: var(--t3);
      margin-top: calc(24px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 16px;
      border-radius: 16px;
      background: #fff;
      box-shadow: var(--sticker);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      --tone: var(--t0);
      margin-top: calc(22px * var(--cv-space, 1));
    }
    .section[data-tone='1'] {
      --tone: var(--t1);
    }
    .section[data-tone='2'] {
      --tone: var(--t2);
    }
    .section[data-tone='3'] {
      --tone: var(--t3);
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(12px * var(--cv-space, 1));
      padding: 2px 14px;
      border-radius: 9999px;
      background: var(--tone);
      color: #fff;
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 0 0 3px #fff, 0 0 0 4.5px var(--tone), 0 4px 10px -4px rgb(0 0 0 / 0.3);
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
      font-weight: 800;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 8px;
      border-radius: 9999px;
      background: #fff;
      color: var(--tone);
      font-size: 10.5px;
      font-weight: 800;
      box-shadow: 0 0 0 1.5px var(--tone);
    }
    .org {
      color: var(--tone);
      font-weight: 700;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--tone);
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
      margin-top: calc(8px * var(--cv-space, 1));
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
      gap: calc(7px * var(--cv-space, 1)) 8px;
    }
    .chips > li {
      padding: 0 9px;
      border-radius: 9999px;
      background: #fff;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px var(--tone);
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 6px;
    }
    .step {
      width: 11px;
      height: 11px;
      border-radius: 9999px;
      background: #fff;
      box-shadow: 0 0 0 1.5px var(--tone);
    }
    .step.on {
      background: var(--tone);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvSticker extends CvTemplateBase {}
