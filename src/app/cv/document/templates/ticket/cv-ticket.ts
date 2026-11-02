import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Ticket : en-tête en forme de billet avec bords crantés, talon détachable (photo, QR code)
 * séparé par un pointillé, code-barres décoratif. Corps sur une seule colonne, titres en
 * capitales condensées. Le talon est placé après le nom dans le document.
 */
@Component({
  selector: 'app-cv-ticket',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="ticket">
        <div class="main-part">
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
          <span class="barcode" aria-hidden="true"></span>
        </div>
        <div class="stub">
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
          @if (qr(); as code) {
            <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
          }
          @if (!photoUrl() && !qr()) {
            <span class="stamp" aria-hidden="true"></span>
          }
        </div>
      </header>

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
      padding: calc(40px * var(--cv-space, 1)) 50px calc(44px * var(--cv-space, 1));
      background: #f3f1ec;
      color: #23211d;
      font-family: var(--cv-body-font, 'Archivo Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --paper: #fff;
      --ink: oklch(from var(--cv-accent) 0.38 0.12 h);
      --tint: oklch(from var(--cv-accent) 0.93 0.04 h);
    }
    .ticket {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 176px;
      background: var(--paper);
      border-radius: 10px;
    }
    .main-part {
      padding: calc(26px * var(--cv-space, 1)) 26px calc(22px * var(--cv-space, 1)) 34px;
      border-top: 10px solid var(--cv-accent);
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.02 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #514d45;
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
    .barcode {
      display: block;
      width: 150px;
      height: 22px;
      margin-top: calc(16px * var(--cv-space, 1));
      background: repeating-linear-gradient(
        90deg,
        #23211d 0 2px,
        transparent 2px 4px,
        #23211d 4px 5px,
        transparent 5px 8px,
        #23211d 8px 11px,
        transparent 11px 13px
      );
    }
    /* Le talon ne contient aucun texte : il peut être positionné pour porter les deux crans
       (cercles de la couleur du fond) aux extrémités de la ligne de déchirure. */
    .stub {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: calc(12px * var(--cv-space, 1));
      padding: calc(20px * var(--cv-space, 1)) 20px;
      border-top: 10px solid var(--ink);
      border-left: 2px dashed #c9c4b8;
      background: var(--tint);
    }
    .stub::before,
    .stub::after {
      content: '';
      position: absolute;
      left: -11px;
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: #f3f1ec;
    }
    .stub::before {
      top: -20px;
    }
    .stub::after {
      bottom: -10px;
    }
    .photo {
      width: 120px;
      height: 120px;
      border: 4px solid #fff;
      object-fit: cover;
    }
    .qr {
      width: 72px;
      height: 72px;
      padding: 5px;
      background: #fff;
      color: #23211d;
    }
    .stamp {
      width: 100px;
      height: 100px;
      border: 3px solid var(--cv-accent);
      border-radius: 9999px;
      background: radial-gradient(circle, var(--cv-accent) 22px, transparent 23px);
      opacity: 0.35;
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 20px;
      background: var(--paper);
      border-left: 6px solid var(--cv-accent);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
      padding: calc(14px * var(--cv-space, 1)) 20px calc(14px * var(--cv-space, 1));
      background: var(--paper);
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      flex: 1;
      height: 2px;
      background: repeating-linear-gradient(90deg, #c9c4b8 0 6px, transparent 6px 10px);
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
      padding: 0 8px;
      background: var(--tint);
      color: var(--ink);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
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
      gap: calc(4px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 1px 9px;
      border: 1.5px solid var(--ink);
      border-radius: 3px;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
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
      gap: 3px;
    }
    .step {
      width: 6px;
      height: 14px;
      background: var(--tint);
    }
    .step.on {
      background: var(--ink);
    }
    .letter {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(20px * var(--cv-space, 1)) 24px;
      background: var(--paper);
    }
  `,
})
export class CvTicket extends CvTemplateBase {}
