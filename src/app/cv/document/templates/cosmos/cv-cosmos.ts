import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Cosmos : bandeau bleu nuit semé d'étoiles, planète cerclée d'un anneau dans l'angle, titres
 * précédés d'une orbite. Corps de page blanc, une seule colonne.
 */
@Component({
  selector: 'app-cv-cosmos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="space" aria-hidden="true"></div>
      <div class="planet" aria-hidden="true"><span class="ring"></span></div>
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
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
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

      <div class="body">
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
      background: #fff;
      color: #1c1f2e;
      font-family: var(--cv-body-font, 'Space Grotesk Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --night: #0f1430;
      --glow: oklch(from var(--cv-accent) 0.8 0.14 h);
      --tint: oklch(from var(--cv-accent) 0.95 0.03 h);
      --deep: oklch(from var(--cv-accent) 0.45 0.14 h);
    }
    .space {
      position: absolute;
      z-index: -1;
      inset: 0 0 auto;
      height: 250px;
      background-color: var(--night);
      background-image:
        radial-gradient(1.5px 1.5px at 40px 60px, #fff 100%, transparent),
        radial-gradient(1px 1px at 130px 130px, #fff 100%, transparent),
        radial-gradient(2px 2px at 260px 40px, #fff 100%, transparent),
        radial-gradient(1px 1px at 360px 170px, #fff 100%, transparent),
        radial-gradient(1.5px 1.5px at 480px 90px, #fff 100%, transparent),
        radial-gradient(1px 1px at 560px 200px, #fff 100%, transparent),
        radial-gradient(2px 2px at 640px 30px, #fff 100%, transparent),
        radial-gradient(1px 1px at 720px 140px, #fff 100%, transparent),
        radial-gradient(1.5px 1.5px at 200px 210px, #fff 100%, transparent),
        radial-gradient(1px 1px at 90px 190px, #fff 100%, transparent),
        radial-gradient(1px 1px at 600px 110px, #fff 100%, transparent),
        radial-gradient(1.5px 1.5px at 420px 20px, #fff 100%, transparent),
        radial-gradient(circle at 80% 120%, oklch(from var(--cv-accent) 0.55 0.18 h / 0.55), transparent 55%);
    }
    .planet {
      position: absolute;
      z-index: -1;
      top: 28px;
      right: 54px;
      width: 96px;
      height: 96px;
      border-radius: 9999px;
      background: radial-gradient(circle at 35% 35%, var(--glow), var(--deep) 70%);
      box-shadow: 0 0 40px oklch(from var(--cv-accent) 0.7 0.16 h / 0.5);
    }
    .ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 150px;
      height: 36px;
      margin: -18px 0 0 -75px;
      border: 4px solid rgb(255 255 255 / 0.55);
      border-radius: 9999px;
      transform: rotate(-18deg);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 24px;
      min-height: 250px;
      padding: calc(36px * var(--cv-space, 1)) 54px calc(26px * var(--cv-space, 1));
      color: #fff;
    }
    .photo {
      width: 120px;
      height: 120px;
      flex-shrink: 0;
      border: 3px solid var(--glow);
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 0 0 7px rgb(255 255 255 / 0.1);
    }
    .identity {
      min-width: 0;
      flex: 1;
      padding-right: 120px;
    }
    .name {
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--glow);
      font-size: 15px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: rgb(255 255 255 / 0.85);
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--glow);
    }
    .qr {
      width: 66px;
      height: 66px;
      flex-shrink: 0;
      padding: 5px;
      border-radius: 8px;
      background: #fff;
      color: var(--night);
    }
    .body {
      padding: calc(20px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
    }
    .summary {
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--night);
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    h2::before {
      content: '';
      width: 18px;
      height: 18px;
      border: 2px solid var(--cv-accent);
      border-radius: 9999px;
      background: radial-gradient(circle, var(--cv-accent) 3.5px, transparent 4px);
    }
    h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--cv-accent), transparent);
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
      color: var(--deep);
      font-size: 11px;
      font-weight: 600;
    }
    .org {
      color: #5b6078;
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
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
      border-radius: 9999px;
      background: var(--night);
      color: #fff;
      font-size: 10.5px;
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
      gap: 5px;
    }
    .step {
      width: 9px;
      height: 9px;
      border-radius: 9999px;
      background: var(--tint);
      box-shadow: inset 0 0 0 1px oklch(from var(--cv-accent) 0.8 0.08 h);
    }
    .step.on {
      background: var(--cv-accent);
      box-shadow: 0 0 6px oklch(from var(--cv-accent) 0.7 0.16 h / 0.7);
    }
    .letter {
      margin-top: calc(18px * var(--cv-space, 1));
    }
  `,
})
export class CvCosmos extends CvTemplateBase {}
