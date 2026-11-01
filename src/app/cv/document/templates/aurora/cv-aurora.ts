import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { BLOBS } from '../../parts/blobs';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Aurore : l'ambiance de Signature (formes organiques, photo ronde, frise, QR code)
 * sur une seule colonne de lecture, pour une compatibilité ATS maximale.
 */
@Component({
  selector: 'app-cv-aurora',
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
      box-sizing: border-box;
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
      position: relative;
      z-index: 1;
      padding: 44px 54px 46px;
    }
    header {
      display: flex;
      align-items: center;
      gap: 30px;
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
      line-height: 1.15;
    }
    .headline {
      margin-top: 4px;
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }
    .summary {
      margin-top: 10px;
      color: #2b2f38;
      font-size: 12px;
      white-space: pre-line;
    }
    .contact-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 22px;
      padding: 12px 16px;
      border-radius: 14px;
      background: rgb(255 255 255 / 0.75);
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.05);
    }
    .contact {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      gap: 6px 20px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
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
      margin-top: 3px;
      color: #6b7280;
      font-size: 9.5px;
      overflow-wrap: anywhere;
    }
    .section {
      margin-top: 20px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 9px;
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
      position: relative;
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: 12px;
    }
    .entry::before {
      content: '';
      position: absolute;
      top: 5px;
      left: -27.5px;
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
      margin-top: 3px;
      padding-left: 17px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: 1px;
    }
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .skill-row + .skill-row {
      margin-top: 6px;
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
      gap: 5px;
    }
    .chips > li {
      padding: 1px 10px;
      border-radius: 9999px;
      background: var(--mint);
      font-size: 11.5px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 430px;
      gap: 16px;
    }
    .languages > li + li {
      margin-top: 4px;
    }
    .level {
      color: #6b7280;
    }
    .meter {
      display: flex;
      gap: 4px;
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
  `,
})
export class CvAurora extends CvTemplateBase {
  protected readonly blobs = BLOBS;
}
