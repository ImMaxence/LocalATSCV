import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Exécutif : bandeau bleu nuit (dérivé de la couleur d'accent), filet doré, nom en serif.
 * Sobre et statutaire, pour les fonctions de direction, la finance ou le droit.
 */
@Component({
  selector: 'app-cv-executive',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="band">
        <div class="identity">
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
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
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
                  <p class="skill">
                    @if (group.label.trim()) {
                      <span class="skill-label">{{ group.label }}</span>
                    }
                    {{ keywords(group).join(' · ') }}
                  </p>
                }
              }
              @case ('languages') {
                <p>{{ languageLine(languages(section)) }}</p>
              }
              @case ('interests') {
                <p>{{ interestLine(interests(section)) }}</p>
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      background: #fff;
      color: #1d2230;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.55 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --navy: oklch(from var(--cv-accent) 0.27 0.06 h);
      --gold: #b8955a;
      --serif: 'Playfair Display Variable', serif;
    }
    .band {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
      padding: calc(40px * var(--cv-space, 1)) 56px calc(32px * var(--cv-space, 1));
      border-bottom: 5px solid var(--gold);
      background: var(--navy);
      color: #fff;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 38px;
      font-weight: 600;
      line-height: calc(1.05 * var(--cv-leading, 1));
      letter-spacing: 0.01em;
    }
    .headline {
      margin-top: calc(8px * var(--cv-space, 1));
      color: var(--gold);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(5px * var(--cv-space, 1)) 5px;
      background: #fff;
    }
    .qr-code {
      width: 60px;
      height: 60px;
      color: var(--navy);
    }
    .photo {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      border: 3px solid var(--gold);
      border-radius: 9999px;
      object-fit: cover;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 22px;
      padding: calc(12px * var(--cv-space, 1)) 56px;
      border-bottom: 1px solid #e5e2da;
      background: #f8f6f1;
      color: #3a3f4d;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--gold);
    }
    .body {
      padding: calc(6px * var(--cv-space, 1)) 56px calc(44px * var(--cv-space, 1));
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 13.5px;
      font-style: italic;
      line-height: calc(1.5 * var(--cv-leading, 1));
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(9px * var(--cv-space, 1));
      padding-bottom: calc(5px * var(--cv-space, 1));
      border-bottom: 1.5px solid var(--gold);
      color: var(--navy);
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(11px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      color: var(--navy);
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #6a6f7c;
      font-size: 11px;
      font-weight: 600;
    }
    .org {
      color: #4a4f5c;
      font-style: italic;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--gold);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill + .skill {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      margin-right: 6px;
      color: var(--navy);
      font-weight: 700;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvExecutive extends CvTemplateBase {}
