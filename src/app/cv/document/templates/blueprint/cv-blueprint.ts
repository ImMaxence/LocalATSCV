import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Blueprint : plan technique. Papier quadrillé, cadre à repères d'angle, ligne de cote sous le
 * nom, libellés en chasse fixe et pointillés. Le quadrillage est un fond CSS : rien de ce décor
 * n'apparaît dans le texte lu par un ATS.
 */
@Component({
  selector: 'app-cv-blueprint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="frame" aria-hidden="true">
        <span class="corner tl"></span><span class="corner tr"></span>
        <span class="corner bl"></span><span class="corner br"></span>
      </div>

      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          <svg class="dimension" viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden="true">
            <line x1="1" y1="1" x2="1" y2="11" />
            <line x1="399" y1="1" x2="399" y2="11" />
            <line x1="1" y1="6" x2="399" y2="6" />
            <path d="M1 6 L9 3 L9 9 Z M399 6 L391 3 L391 9 Z" />
          </svg>
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        @if (qr(); as code) {
          <div class="qr">
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          </div>
        }
      </header>

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

      @if (summary()) {
        <p class="summary">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section">
          <h2><span class="box" aria-hidden="true"></span>{{ sectionTitle(section) }}</h2>
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(50px * var(--cv-space, 1)) 56px calc(48px * var(--cv-space, 1));
      background-color: var(--paper);
      background-image:
        linear-gradient(var(--major) 1px, transparent 1px),
        linear-gradient(90deg, var(--major) 1px, transparent 1px),
        linear-gradient(var(--minor) 1px, transparent 1px),
        linear-gradient(90deg, var(--minor) 1px, transparent 1px);
      background-size:
        100px 100px,
        100px 100px,
        20px 20px,
        20px 20px;
      color: #1d2330;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --paper: color-mix(in oklab, var(--cv-accent) 4%, white);
      --major: color-mix(in oklab, var(--cv-accent) 15%, transparent);
      --minor: color-mix(in oklab, var(--cv-accent) 7%, transparent);
      --ink: oklch(from var(--cv-accent) 0.3 0.08 h);
      --mono: 'JetBrains Mono Variable', monospace;
    }
    .frame {
      position: absolute;
      inset: 22px;
      border: 1.5px solid var(--ink);
      pointer-events: none;
    }
    .corner {
      position: absolute;
      width: 14px;
      height: 14px;
      border-color: var(--cv-accent);
      border-style: solid;
    }
    .corner.tl {
      top: 5px;
      left: 5px;
      border-width: 2px 0 0 2px;
    }
    .corner.tr {
      top: 5px;
      right: 5px;
      border-width: 2px 2px 0 0;
    }
    .corner.bl {
      bottom: 5px;
      left: 5px;
      border-width: 0 0 2px 2px;
    }
    .corner.br {
      right: 5px;
      bottom: 5px;
      border-width: 0 2px 2px 0;
    }
    header {
      position: relative;
      display: flex;
      align-items: center;
      gap: calc(18px * var(--cv-space, 1)) 18px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 38px;
      font-weight: 700;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .dimension {
      display: block;
      width: 100%;
      max-width: 420px;
      height: 12px;
      margin-top: calc(8px * var(--cv-space, 1));
      fill: var(--cv-accent);
      stroke: var(--cv-accent);
      stroke-width: 1;
    }
    .headline {
      margin-top: calc(8px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      padding: calc(4px * var(--cv-space, 1)) 4px;
      border: 1.5px solid var(--ink);
      background: #fff;
      object-fit: cover;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border: 1.5px dashed var(--ink);
      background: #fff;
    }
    .qr-code {
      width: 66px;
      height: 66px;
      color: var(--ink);
    }
    .contact {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: calc(6px * var(--cv-space, 1)) 20px;
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(9px * var(--cv-space, 1)) 14px;
      border: 1.5px dashed var(--ink);
      background: rgb(255 255 255 / 0.75);
      font-size: 11.5px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 14px;
      height: 14px;
      color: var(--cv-accent);
    }
    .summary {
      position: relative;
      margin-top: calc(14px * var(--cv-space, 1));
      white-space: pre-line;
    }
    .section {
      position: relative;
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--ink);
      font-family: var(--mono);
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      flex: 1;
      border-top: 1.5px dashed var(--cv-accent);
    }
    .box {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
      border: 2px solid var(--cv-accent);
    }
    .entry {
      padding-left: 14px;
      border-left: 1.5px dashed color-mix(in oklab, var(--cv-accent) 55%, white);
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(11px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 14px;
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 7px;
      border: 1px solid var(--cv-accent);
      border-radius: 3px;
      background: #fff;
      color: var(--cv-accent);
      font-family: var(--mono);
      font-size: 10.5px;
      font-weight: 600;
    }
    .org {
      color: #4a5263;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
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
      gap: calc(10px * var(--cv-space, 1)) 10px;
    }
    .skill-row + .skill-row {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .skill-label {
      flex-shrink: 0;
      max-width: 40%;
      color: var(--ink);
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 700;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 0 8px;
      border: 1px dashed var(--ink);
      border-radius: 3px;
      background: rgb(255 255 255 / 0.8);
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
      gap: calc(3px * var(--cv-space, 1)) 3px;
    }
    .step {
      width: 9px;
      height: 9px;
      border: 1.5px solid var(--ink);
      background: #fff;
    }
    .step.on {
      background: var(--cv-accent);
      border-color: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvBlueprint extends CvTemplateBase {}
