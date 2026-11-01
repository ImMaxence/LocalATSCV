import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Pulse : bandeau sombre coupé en diagonale, halos de couleur, expériences en cartes,
 * compétences en pastilles pleines. Une seule colonne de lecture, tout le texte est réel.
 */
@Component({
  selector: 'app-cv-pulse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="hero">
        <div class="hero-main">
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
          <div class="min-w-0 flex-1">
            @if (fullName()) {
              <h1 class="name">{{ fullName() }}</h1>
            }
            @if (cv().profile.title.trim()) {
              <p class="headline">{{ cv().profile.title }}</p>
            }
          </div>
          @if (qr(); as code) {
            <div class="qr">
              <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
            </div>
          }
        </div>
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
      </header>

      <div class="body">
        @if (summary()) {
          <section class="section">
            <h2>{{ labels().sections.summary }}</h2>
            <p class="summary">{{ summary() }}</p>
          </section>
        }
        @for (section of cv().sections; track section.id) {
          <section class="section">
            <h2>{{ sectionTitle(section) }}</h2>
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id; let first = $first) {
                  <div class="skill-row">
                    @if (group.label.trim()) {
                      <p class="skill-label">{{ group.label }}</p>
                    }
                    <ul class="chips" [class.solid]="first">
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
                      <span class="language">{{ languageLabel(item) }}</span>
                      @if (languageLevel(item); as level) {
                        <span class="bar" aria-hidden="true">
                          <span class="fill" [style.width.%]="level * 20"></span>
                        </span>
                      }
                    </li>
                  }
                </ul>
              }
              @case ('interests') {
                <p>{{ interestLine(interests(section)) }}</p>
              }
              @default {
                @for (entry of entries(section); track entry.id) {
                  <div class="card">
                    <div class="card-head">
                      <h3>{{ entry.title }}</h3>
                      @if (dates(entry)) {
                        <p class="dates">{{ dates(entry) }}</p>
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
      box-sizing: border-box;
      width: 794px;
      min-height: 1123px;
      background: #fff;
      color: #1c2230;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      line-height: 1.45;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --night: oklch(from var(--cv-accent) 0.22 0.04 h);
      --glow: oklch(from var(--cv-accent) 0.8 0.13 h);
    }
    .hero {
      padding: 36px 54px 50px;
      background:
        radial-gradient(
          circle at 88% 10%,
          color-mix(in oklab, var(--cv-accent) 55%, transparent),
          transparent 42%
        ),
        radial-gradient(
          circle at 8% 120%,
          color-mix(in oklab, var(--glow) 35%, transparent),
          transparent 40%
        ),
        var(--night);
      clip-path: polygon(0 0, 100% 0, 100% 84%, 0 100%);
      color: #fff;
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .photo {
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      border: 3px solid var(--glow);
      border-radius: 26px;
      object-fit: cover;
      transform: rotate(-3deg);
    }
    .name {
      font-family: var(--cv-heading-font, 'Montserrat Variable', sans-serif);
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.05;
    }
    .headline {
      margin-top: 8px;
      color: var(--glow);
      font-family: var(--cv-heading-font, 'Montserrat Variable', sans-serif);
      font-size: 15px;
      font-weight: 600;
    }
    .qr {
      flex-shrink: 0;
      padding: 7px;
      border-radius: 12px;
      background: #fff;
    }
    .qr-code {
      width: 74px;
      height: 74px;
      color: var(--night);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 16px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 11px;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.1);
      font-size: 11.5px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--glow);
    }
    .body {
      padding: 0 54px 40px;
    }
    .section {
      margin-top: 15px;
    }
    h2 {
      margin-bottom: 8px;
      color: var(--night);
      font-family: var(--cv-heading-font, 'Montserrat Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      display: block;
      width: 46px;
      height: 4px;
      margin-top: 5px;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--cv-accent), var(--glow));
    }
    .summary {
      white-space: pre-line;
    }
    .card {
      padding: 10px 14px;
      border-left: 3px solid var(--cv-accent);
      border-radius: 0 10px 10px 0;
      background: #f5f7fa;
      break-inside: avoid;
    }
    .card + .card {
      margin-top: 9px;
    }
    .card-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      color: #10141c;
      font-size: 13.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: var(--cv-accent);
      font-size: 11.5px;
      font-weight: 700;
    }
    .org {
      color: #5b6170;
      font-size: 12px;
    }
    .bullets {
      margin-top: 4px;
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: 2px;
    }
    /* Libellé en ligne, juste avant les pastilles : l'ordre de lecture reste « Libellé mot-clé… ». */
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .skill-row + .skill-row {
      margin-top: 6px;
    }
    .skill-label {
      flex-shrink: 0;
      max-width: 40%;
      color: #5b6170;
      font-size: 11px;
      font-weight: 700;
    }
    .chips {
      min-width: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .chips > li {
      padding: 1px 10px;
      border: 1.5px solid var(--cv-accent);
      border-radius: 9999px;
      color: var(--night);
      font-size: 11.5px;
      font-weight: 500;
    }
    .chips.solid > li {
      background: var(--cv-accent);
      color: #fff;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: 6px;
    }
    .bar {
      width: 120px;
      height: 7px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 9999px;
      background: #e8ebf0;
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--cv-accent), var(--glow));
    }
  `,
})
export class CvPulse extends CvTemplateBase {}
