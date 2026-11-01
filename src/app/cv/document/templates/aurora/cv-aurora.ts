import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { BLOBS } from '../../parts/blobs';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Aurore : l'ambiance de Signature (formes organiques, photo ronde, frise, QR code)
 * sur une seule colonne de lecture, pour une compatibilité ATS maximale.
 */
@Component({
  selector: 'app-cv-aurora',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="blob blob-a" viewBox="0 0 200 200" aria-hidden="true">
        <path [attr.d]="blobs[0]" transform="translate(100 100)" />
      </svg>
      <svg class="blob blob-b" viewBox="0 0 200 200" aria-hidden="true">
        <path [attr.d]="blobs[1]" transform="translate(100 100)" />
      </svg>
      <svg class="blob blob-c" viewBox="0 0 200 200" aria-hidden="true">
        <path [attr.d]="blobs[2]" transform="translate(100 100)" />
      </svg>

      <div class="content">
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
            @if (summary()) {
              <p class="summary">{{ summary() }}</p>
            }
          </div>
        </header>

        <div class="contact-row">
          <ul class="contact">
            @for (item of contactItems(); track $index) {
              <li>
                <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
                <span>{{ item.text }}</span>
              </li>
            }
          </ul>
          @if (qr(); as code) {
            <div class="qr">
              <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
              <p>{{ code.caption }}</p>
            </div>
          }
        </div>

        @if (letter(); as body) {
          <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
        }
        @for (section of cv().sections; track section.id) {
          <section class="section">
            <h2>
              <span class="mark" aria-hidden="true"></span>
              {{ sectionTitle(section) }}
            </h2>
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
                      <span
                        ><strong>{{ item.name }}</strong>
                        @if (item.level.trim()) {
                          <span class="level">{{ separator() }}{{ item.level }}</span>
                        }
                      </span>
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
                <div class="timeline">
                  @for (entry of entries(section); track entry.id) {
                    <div class="entry">
                      <h3>{{ entry.title }}</h3>
                      <p class="meta">
                        @if (dates(entry)) {
                          <span class="dates">{{ dates(entry) }}</span>
                        }
                        @if (entry.subtitle.trim()) {
                          <span class="org">{{ entry.subtitle }}</span>
                        }
                        @if (meta(entry)) {
                          <span class="loc">{{ meta(entry) }}</span>
                        }
                      </p>
                      @if (entry.bullets.length) {
                        <ul class="bullets">
                          @for (bullet of entry.bullets; track bullet.id) {
                            <li><app-cv-rich [text]="bullet.text" /></li>
                          }
                        </ul>
                      }
                    </div>
                  }
                </div>
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
      /* Formes décoratives sous le texte (z-index négatif) : le texte reste hors de tout calque. */
      isolation: isolate;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      overflow: hidden;
      background: #fff;
      color: #1d2433;
      font-family: var(--cv-body-font, 'Poppins', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --mint: color-mix(in oklab, var(--cv-accent) 12%, white);
      --sky: oklch(from var(--cv-accent) 0.955 0.025 calc(h + 75));
      --ink: oklch(from var(--cv-accent) 0.3 0.08 calc(h + 75));
    }
    .blob {
      position: absolute;
      z-index: -1;
      pointer-events: none;
    }
    .blob-a {
      top: -190px;
      left: -150px;
      width: 520px;
      fill: var(--mint);
    }
    .blob-b {
      top: -210px;
      right: -260px;
      width: 700px;
      fill: var(--sky);
    }
    .blob-c {
      right: -170px;
      bottom: -230px;
      width: 520px;
      fill: var(--mint);
    }
    .content {
      padding: calc(44px * var(--cv-space, 1)) 54px calc(46px * var(--cv-space, 1));
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(30px * var(--cv-space, 1)) 30px;
    }
    .photo {
      width: 150px;
      height: 150px;
      flex-shrink: 0;
      border: 5px solid #fff;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 12px 28px -14px rgb(0 0 0 / 0.4);
    }
    .identity {
      min-width: 0;
      flex: 1;
      text-align: right;
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 33px;
      font-weight: 700;
      letter-spacing: 0.05em;
      line-height: calc(1.15 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }
    .summary {
      margin-top: calc(10px * var(--cv-space, 1));
      color: #2b2f38;
      font-size: 12px;
      white-space: pre-line;
    }
    .contact-row {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 20px;
      margin-top: calc(22px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 16px;
      border-radius: 14px;
      background: rgb(255 255 255 / 0.75);
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.05);
    }
    .contact {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      gap: calc(6px * var(--cv-space, 1)) 20px;
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
    .qr {
      flex-shrink: 0;
      text-align: center;
    }
    .qr-code {
      width: 70px;
      height: 70px;
      color: #111;
    }
    .qr p {
      max-width: 90px;
      margin-top: calc(3px * var(--cv-space, 1));
      color: #6b7280;
      font-size: 9.5px;
      overflow-wrap: anywhere;
    }
    .section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: #111;
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 18px;
      font-weight: 600;
    }
    .mark {
      width: 22px;
      height: 6px;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--cv-accent), var(--ink));
    }
    .timeline {
      margin-left: 4px;
      padding-left: 22px;
      border-left: 1.5px solid #2b2f38;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(12px * var(--cv-space, 1));
    }
    /* Pastille en flottant, pas en absolu : dans le PDF, le texte garde l'ordre du document. */
    .entry::before {
      content: '';
      float: left;
      margin: 5px 0 0 -27.5px;
      width: 9px;
      height: 9px;
      border-radius: 9999px;
      background: var(--ink);
      box-shadow: 0 0 0 3px #fff;
    }
    h3 {
      color: #111;
      font-size: 13px;
      font-weight: 600;
    }
    .meta {
      color: #8a8f99;
    }
    .meta > span + span {
      margin-left: 7px;
    }
    .org {
      color: #1d2433;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 17px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: calc(12px * var(--cv-space, 1)) 12px;
    }
    .skill-row + .skill-row {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .skill-label {
      width: 92px;
      flex-shrink: 0;
      color: #111;
      font-weight: 600;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: var(--mint);
      font-size: 11.5px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 430px;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .level {
      color: #6b7280;
    }
    .meter {
      display: flex;
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .step {
      width: 9px;
      height: 9px;
      border-radius: 9999px;
      background: #e5e7eb;
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvAurora extends CvTemplateBase {
  protected readonly blobs = BLOBS;
}
