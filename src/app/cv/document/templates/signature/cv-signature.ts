import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { BLOBS } from '../../parts/blobs';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Signature : formes organiques pastel, grande photo ronde, frise chronologique, QR code.
 * Deux colonnes : la colonne principale est placée en premier dans le document pour que les ATS
 * qui lisent le fichier dans l'ordre la traitent avant la colonne latérale.
 */
@Component({
  selector: 'app-cv-signature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText],
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
      box-sizing: border-box;
      display: grid;
      grid-template-areas: 'side main';
      grid-template-columns: 268px minmax(0, 1fr);
      width: 794px;
      min-height: 1123px;
      overflow: hidden;
      background: #fff;
      color: #1d2433;
      font-family: var(--cv-body-font, 'Poppins', sans-serif);
      font-size: 12px;
      line-height: 1.5;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --mint: color-mix(in oklab, var(--cv-accent) 12%, white);
      --sky: oklch(from var(--cv-accent) 0.955 0.025 calc(h + 75));
      --ink: oklch(from var(--cv-accent) 0.3 0.08 calc(h + 75));
    }
    .blob {
      position: absolute;
      z-index: 0;
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
    .main,
    aside {
      position: relative;
      z-index: 1;
    }
    .main {
      grid-area: main;
      padding: 56px 52px 48px 22px;
    }
    aside {
      grid-area: side;
      padding: 52px 18px 48px 42px;
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
      line-height: 1.15;
    }
    .headline {
      margin-top: 6px;
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 19px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }
    .summary {
      margin-top: 14px;
      margin-left: 40px;
      color: #222;
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: 26px;
    }
    h2 {
      color: #111;
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 19px;
      font-weight: 600;
    }
    .timeline {
      margin-top: 10px;
      padding-left: 22px;
      border-left: 1.5px solid #2b2f38;
    }
    .entry {
      position: relative;
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: 13px;
    }
    .entry::before {
      content: '';
      position: absolute;
      top: 5px;
      left: -27.5px;
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
      margin-top: 1px;
      color: #8a8f99;
    }
    .meta > span + span {
      margin-left: 7px;
    }
    .org {
      color: #1d2433;
    }
    .bullets {
      margin-top: 4px;
      padding-left: 18px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: 1px;
    }
    .photo {
      width: 168px;
      height: 168px;
      margin: 0 auto 26px 0;
      border-radius: 9999px;
      object-fit: cover;
    }
    .contact > li {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      overflow-wrap: anywhere;
    }
    .contact > li + li {
      margin-top: 6px;
    }
    .contact-icon {
      width: 15px;
      height: 15px;
      margin-top: 1px;
      color: var(--cv-accent);
    }
    .side-section {
      margin-top: 24px;
    }
    aside h2 {
      margin-bottom: 10px;
      font-size: 17px;
    }
    .side-label {
      margin: 8px 0 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .languages > li {
      display: flex;
      flex-direction: column;
    }
    .languages > li + li {
      margin-top: 6px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
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
      margin-top: 2px;
    }
    .qr {
      margin-top: 24px;
    }
    .qr-code {
      width: 118px;
      height: 118px;
      color: #111;
    }
    .qr p {
      margin-top: 6px;
      color: #6b7280;
      font-size: 11.5px;
    }
  `,
})
export class CvSignature extends CvTemplateBase {
  protected readonly blobs = BLOBS;
}
