import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Bonbon : rayures de sucre d'orge, billes brillantes dans l'angle, tout en arrondis, teintes
 * acidulées dérivées de l'accent. Une seule colonne, ton gourmand.
 */
@Component({
  selector: 'app-cv-candy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="gumballs" aria-hidden="true">
        <span class="ball b1"></span><span class="ball b2"></span><span class="ball b3"></span>
        <span class="ball b4"></span>
      </div>
      <span class="stripe" aria-hidden="true"></span>
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
        <section class="section" [attr.data-tone]="i % 3">
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
      padding: calc(44px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fffafc;
      color: #2d2330;
      font-family: var(--cv-body-font, 'Poppins', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --c0: oklch(from var(--cv-accent) 0.72 0.17 h);
      --c1: oklch(from var(--cv-accent) 0.78 0.15 calc(h + 100));
      --c2: oklch(from var(--cv-accent) 0.76 0.16 calc(h - 110));
      --soft0: oklch(from var(--cv-accent) 0.93 0.05 h);
      --soft1: oklch(from var(--cv-accent) 0.94 0.05 calc(h + 100));
      --soft2: oklch(from var(--cv-accent) 0.94 0.05 calc(h - 110));
    }
    .gumballs {
      position: absolute;
      z-index: -1;
      top: 20px;
      right: 24px;
      width: 150px;
      height: 120px;
    }
    .ball {
      position: absolute;
      border-radius: 9999px;
      background: radial-gradient(circle at 32% 28%, #fff 0 6%, var(--ball) 40%, oklch(from var(--ball) calc(l - 0.18) c h) 100%);
      box-shadow: 0 6px 10px -6px rgb(0 0 0 / 0.35);
    }
    .b1 {
      --ball: var(--c0);
      top: 0;
      right: 0;
      width: 56px;
      height: 56px;
    }
    .b2 {
      --ball: var(--c1);
      top: 40px;
      right: 60px;
      width: 44px;
      height: 44px;
    }
    .b3 {
      --ball: var(--c2);
      top: 70px;
      right: 10px;
      width: 38px;
      height: 38px;
    }
    .b4 {
      --ball: var(--c0);
      top: 92px;
      right: 104px;
      width: 26px;
      height: 26px;
    }
    .stripe {
      display: block;
      height: 14px;
      margin: calc(-44px * var(--cv-space, 1)) -54px calc(30px * var(--cv-space, 1));
      background: repeating-linear-gradient(-45deg, var(--c0) 0 14px, #fff 14px 28px);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 24px;
      padding-right: 150px;
    }
    .photo {
      width: 116px;
      height: 116px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 0 0 5px #fff, 0 0 0 10px var(--c1);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--c0);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 14px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #5c4f60;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--c2);
    }
    .qr {
      width: 66px;
      height: 66px;
      flex-shrink: 0;
      padding: 6px;
      border-radius: 16px;
      background: #fff;
      color: #2d2330;
      box-shadow: 0 0 0 3px var(--c2);
    }
    .summary {
      margin-top: calc(20px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 18px;
      border-radius: 20px;
      background: var(--soft1);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      --tone: var(--c0);
      --soft: var(--soft0);
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .section[data-tone='1'] {
      --tone: var(--c1);
      --soft: var(--soft1);
    }
    .section[data-tone='2'] {
      --tone: var(--c2);
      --soft: var(--soft2);
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--tone);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 15px;
      font-weight: 700;
    }
    h2::after {
      content: '';
      flex: 1;
      height: 8px;
      border-radius: 9999px;
      background: repeating-linear-gradient(-45deg, var(--tone) 0 8px, #fff 8px 16px);
      box-shadow: inset 0 0 0 1px var(--tone);
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
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 10px;
      border-radius: 9999px;
      background: var(--soft);
      color: var(--tone);
      font-size: 10.5px;
      font-weight: 600;
    }
    .org {
      color: var(--tone);
      font-weight: 600;
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
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .skill-label {
      flex-shrink: 0;
      max-width: 40%;
      font-weight: 600;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 1px 10px;
      border-radius: 9999px;
      background: var(--soft);
      font-size: 11px;
      font-weight: 500;
      box-shadow: inset 0 -2px 0 rgb(0 0 0 / 0.06);
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
      border-radius: 9999px;
      background: var(--soft);
    }
    .step.on {
      background: radial-gradient(circle at 32% 28%, #fff 0 8%, var(--tone) 45%);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvCandy extends CvTemplateBase {}
