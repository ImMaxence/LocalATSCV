import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Horizon : grand dégradé en diagonale (accent vers une teinte voisine) en tête de page, carte
 * blanche qui remonte sur le dégradé, photo ronde à cheval sur les deux. Une seule colonne.
 */
@Component({
  selector: 'app-cv-horizon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="sky" aria-hidden="true"></div>
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
        </div>
        @if (qr(); as code) {
          <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
        }
      </header>

      <div class="card">
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
                          <span class="fill" [style.width.%]="level * 20"></span>
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
      overflow: hidden;
      padding: calc(40px * var(--cv-space, 1)) 46px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #1e2230;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --warm: oklch(from var(--cv-accent) 0.72 0.17 calc(h + 45));
      --deep: oklch(from var(--cv-accent) 0.42 0.14 calc(h - 20));
      --tint: oklch(from var(--cv-accent) 0.95 0.03 h);
    }
    .sky {
      position: absolute;
      z-index: -1;
      inset: 0 0 auto;
      height: 300px;
      background: linear-gradient(118deg, var(--deep) 0%, var(--cv-accent) 55%, var(--warm) 100%);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
      color: #fff;
    }
    .photo {
      width: 124px;
      height: 124px;
      flex-shrink: 0;
      border: 5px solid rgb(255 255 255 / 0.9);
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 10px 24px -10px rgb(0 0 0 / 0.5);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 600;
      color: rgb(255 255 255 / 0.9);
    }
    .qr {
      width: 68px;
      height: 68px;
      flex-shrink: 0;
      padding: 6px;
      border-radius: 10px;
      background: #fff;
      color: var(--deep);
    }
    .card {
      margin-top: calc(26px * var(--cv-space, 1));
      padding: calc(22px * var(--cv-space, 1)) 28px calc(10px * var(--cv-space, 1));
      border-radius: 18px;
      background: #fff;
      box-shadow:
        0 2px 6px rgb(20 30 60 / 0.08),
        0 18px 40px -20px rgb(20 30 60 / 0.35);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 18px;
      color: #4a5064;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--cv-accent);
    }
    .summary {
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 14px;
      border-radius: 10px;
      background: var(--tint);
      font-size: 12px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: calc(8px * var(--cv-space, 1));
      color: var(--deep);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      flex: 1;
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--cv-accent), var(--warm) 60%, transparent);
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
      padding: 1px 9px;
      border-radius: 9999px;
      background: var(--tint);
      color: var(--deep);
      font-size: 10.5px;
      font-weight: 700;
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
      padding: 1px 10px;
      border: 1px solid oklch(from var(--cv-accent) 0.85 0.06 h);
      border-radius: 9999px;
      background: var(--tint);
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
      display: block;
      width: 110px;
      height: 7px;
      overflow: hidden;
      border-radius: 9999px;
      background: var(--tint);
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--cv-accent), var(--warm));
    }
    .letter {
      margin-top: calc(18px * var(--cv-space, 1));
    }
  `,
})
export class CvHorizon extends CvTemplateBase {}
