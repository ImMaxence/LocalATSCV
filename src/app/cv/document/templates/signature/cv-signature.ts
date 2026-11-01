import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { BLOBS } from '../../parts/blobs';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Signature : formes organiques pastel, grande photo ronde, frise chronologique, QR code.
 * Deux colonnes : la colonne principale est placée en premier dans le document pour que les ATS
 * qui lisent le fichier dans l'ordre la traitent avant la colonne latérale.
 */
@Component({
  selector: 'app-cv-signature',
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

      <div class="main">
        <header>
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
          @if (summary()) {
            <p class="summary">{{ summary() }}</p>
          }
        </header>

        @if (letter(); as body) {
          <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
        }
        @for (section of mainSections(); track section.id) {
          <section class="section">
            <h2>{{ sectionTitle(section) }}</h2>
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
          </section>
        }
      </div>

      <aside>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        @if (contactItems().length) {
          <ul class="contact">
            @for (item of contactItems(); track $index) {
              <li>
                <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
                <span class="min-w-0">{{ item.text }}</span>
              </li>
            }
          </ul>
        }
        @for (section of sideSections(); track section.id) {
          <section class="side-section">
            <h2>{{ sectionTitle(section) }}</h2>
            @switch (section.kind) {
              @case ('languages') {
                <ul class="languages">
                  @for (item of languages(section); track item.id) {
                    <li>
                      <strong>{{ item.name }}</strong>
                      @if (item.level.trim()) {
                        <span>{{ item.level }}</span>
                      }
                    </li>
                  }
                </ul>
              }
              @case ('skills') {
                @for (group of skills(section); track group.id) {
                  @if (group.label.trim()) {
                    <h3 class="side-label">{{ group.label }}</h3>
                  }
                  <ul class="chips">
                    @for (keyword of keywords(group); track $index) {
                      <li>{{ keyword }}</li>
                    }
                  </ul>
                }
              }
              @default {
                <ul class="dots">
                  @for (item of interests(section); track item.id) {
                    <li>{{ item.label }}</li>
                  }
                </ul>
              }
            }
          </section>
        }
        @if (qr(); as code) {
          <div class="qr">
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
            <p>{{ code.caption }}</p>
          </div>
        }
      </aside>
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
      display: grid;
      grid-template-areas: 'side main';
      grid-template-columns: 268px minmax(0, 1fr);
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
      top: -150px;
      left: -170px;
      width: 560px;
      fill: var(--mint);
    }
    .blob-b {
      top: -170px;
      right: -230px;
      width: 720px;
      fill: var(--sky);
    }
    .blob-c {
      bottom: -230px;
      left: -60px;
      width: 520px;
      fill: var(--mint);
    }
    .main {
      grid-area: main;
      padding: calc(56px * var(--cv-space, 1)) 52px calc(48px * var(--cv-space, 1)) 22px;
    }
    aside {
      grid-area: side;
      padding: calc(52px * var(--cv-space, 1)) 18px calc(48px * var(--cv-space, 1)) 42px;
    }
    header {
      text-align: right;
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 34px;
      font-weight: 700;
      letter-spacing: 0.05em;
      line-height: calc(1.15 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 19px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }
    .summary {
      margin-top: calc(14px * var(--cv-space, 1));
      margin-left: 40px;
      color: #222;
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(26px * var(--cv-space, 1));
    }
    h2 {
      color: #111;
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 19px;
      font-weight: 600;
    }
    .timeline {
      margin-top: calc(10px * var(--cv-space, 1));
      padding-left: 22px;
      border-left: 1.5px solid #2b2f38;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(13px * var(--cv-space, 1));
    }
    /* Pastille en flottant, pas en absolu : dans le PDF, le texte garde l'ordre du document. */
    .entry::before {
      content: '';
      float: left;
      margin: 5px 0 0 -27.5px;
      width: 9px;
      height: 9px;
      border-radius: 9999px;
      background: #1d2433;
    }
    h3 {
      color: #111;
      font-size: 13px;
      font-weight: 600;
    }
    .meta {
      margin-top: calc(1px * var(--cv-space, 1));
      color: #8a8f99;
    }
    .meta > span + span {
      margin-left: 7px;
    }
    .org {
      color: #1d2433;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 18px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .photo {
      width: 168px;
      height: 168px;
      margin: 0 auto calc(26px * var(--cv-space, 1)) 0;
      border-radius: 9999px;
      object-fit: cover;
    }
    .contact > li {
      display: flex;
      align-items: flex-start;
      gap: calc(9px * var(--cv-space, 1)) 9px;
      overflow-wrap: anywhere;
    }
    .contact > li + li {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .contact-icon {
      width: 15px;
      height: 15px;
      margin-top: calc(1px * var(--cv-space, 1));
      color: var(--cv-accent);
    }
    .side-section {
      margin-top: calc(24px * var(--cv-space, 1));
    }
    aside h2 {
      margin-bottom: calc(10px * var(--cv-space, 1));
      font-size: 17px;
    }
    .side-label {
      margin: calc(8px * var(--cv-space, 1)) 0 calc(4px * var(--cv-space, 1));
      font-size: 12px;
      font-weight: 600;
    }
    .languages > li {
      display: flex;
      flex-direction: column;
    }
    .languages > li + li {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .chips > li {
      padding: 0 8px;
      border: 1px solid color-mix(in oklab, var(--cv-accent) 30%, white);
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.7);
      font-size: 11px;
    }
    .dots {
      padding-left: 18px;
      list-style: disc;
    }
    .dots > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    .qr {
      margin-top: calc(24px * var(--cv-space, 1));
    }
    .qr-code {
      width: 118px;
      height: 118px;
      color: #111;
    }
    .qr p {
      margin-top: calc(6px * var(--cv-space, 1));
      color: #6b7280;
      font-size: 11.5px;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvSignature extends CvTemplateBase {
  protected readonly blobs = BLOBS;
}
