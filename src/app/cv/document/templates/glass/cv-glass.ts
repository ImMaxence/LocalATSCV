import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { BLOBS } from '../../parts/blobs';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Verre : taches de couleur floutées sous des cartes translucides à liseré blanc (effet verre
 * dépoli, sans filtre sur le texte : seules les formes du fond sont floutées). Une seule colonne.
 */
@Component({
  selector: 'app-cv-glass',
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
      <header class="card">
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

      @if (summary()) {
        <p class="summary card">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter card" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section card">
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
      padding: calc(36px * var(--cv-space, 1)) 44px calc(40px * var(--cv-space, 1));
      background: linear-gradient(160deg, #f3f5fb, #eef2f8 50%, #f6f3fa);
      color: #1f2433;
      font-family: var(--cv-body-font, 'DM Sans Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --c1: oklch(from var(--cv-accent) 0.75 0.16 h);
      --c2: oklch(from var(--cv-accent) 0.78 0.14 calc(h + 80));
      --c3: oklch(from var(--cv-accent) 0.8 0.13 calc(h - 70));
      --ink: oklch(from var(--cv-accent) 0.42 0.13 h);
    }
    .blob {
      position: absolute;
      z-index: -1;
      filter: blur(28px);
    }
    .blob-a {
      top: -120px;
      right: -60px;
      width: 460px;
      height: 460px;
      fill: var(--c1);
    }
    .blob-b {
      top: 380px;
      left: -160px;
      width: 420px;
      height: 420px;
      fill: var(--c2);
    }
    .blob-c {
      bottom: -140px;
      right: 40px;
      width: 400px;
      height: 400px;
      fill: var(--c3);
    }
    .card {
      padding: calc(16px * var(--cv-space, 1)) 22px;
      border: 1px solid rgb(255 255 255 / 0.85);
      border-radius: 16px;
      background: rgb(255 255 255 / 0.58);
      box-shadow:
        0 1px 0 rgb(255 255 255 / 0.9) inset,
        0 12px 30px -18px rgb(30 40 80 / 0.35);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 22px;
      padding: calc(22px * var(--cv-space, 1)) 26px;
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border: 3px solid rgb(255 255 255 / 0.9);
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 8px 20px -10px rgb(30 40 80 / 0.4);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #141a2b;
      font-family: var(--cv-heading-font, 'DM Sans Variable', sans-serif);
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(5px * var(--cv-space, 1));
      color: var(--ink);
      font-size: 15px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #4b5368;
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
    .qr {
      width: 66px;
      height: 66px;
      flex-shrink: 0;
      padding: 5px;
      border-radius: 10px;
      background: #fff;
      color: #141a2b;
    }
    .summary {
      margin-top: calc(14px * var(--cv-space, 1));
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(14px * var(--cv-space, 1));
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(9px * var(--cv-space, 1));
      padding: 2px 12px;
      border: 1px solid rgb(255 255 255 / 0.9);
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--c1), var(--c2));
      color: #fff;
      font-family: var(--cv-heading-font, 'DM Sans Variable', sans-serif);
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
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
      color: var(--ink);
      font-size: 11px;
      font-weight: 600;
    }
    .org {
      color: #4b5368;
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--c1);
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
      border: 1px solid rgb(255 255 255 / 0.9);
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.7);
      font-size: 11px;
      font-weight: 500;
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
      height: 8px;
      overflow: hidden;
      border: 1px solid rgb(255 255 255 / 0.9);
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.6);
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--c1), var(--c2));
    }
    .letter {
      margin-top: calc(14px * var(--cv-space, 1));
    }
  `,
})
export class CvGlass extends CvTemplateBase {
  protected readonly blobs = BLOBS;
}
