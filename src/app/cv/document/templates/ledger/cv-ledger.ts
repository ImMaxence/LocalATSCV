import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Registre : chaque entrée sur une grille « dates à gauche, contenu à droite », filets fins
 * entre les entrées, titres en petites capitales. Sobre, une colonne, lu dans l'ordre
 * (les dates précèdent chaque entrée dans le document).
 */
@Component({
  selector: 'app-cv-ledger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
      </header>
      @if (contact().length) {
        <p class="contact">
          @for (item of contact(); track $index) {
            @if (!$first) {
              <span class="dot" aria-hidden="true"> · </span>
            }
            <span>{{ item }}</span>
          }
        </p>
      }

      @if (summary()) {
        <div class="row">
          <h2 class="row-title">{{ labels().sections.summary }}</h2>
          <p class="summary">{{ summary() }}</p>
        </div>
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
                <div class="row">
                  <span class="row-label">{{ group.label }}</span>
                  <p>{{ keywords(group).join(' · ') }}</p>
                </div>
              }
            }
            @case ('languages') {
              @for (item of languages(section); track item.id) {
                <div class="row">
                  <span class="row-label">{{ item.level }}</span>
                  <p>{{ item.name }}</p>
                </div>
              }
            }
            @case ('interests') {
              <div class="row">
                <span class="row-label"></span>
                <p>{{ interestLine(interests(section)) }}</p>
              </div>
            }
            @default {
              @for (entry of entries(section); track entry.id) {
                <div class="row entry">
                  <span class="row-label">{{ dates(entry) }}</span>
                  <div class="min-w-0">
                    <h3>{{ entry.title }}</h3>
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
      padding: calc(54px * var(--cv-space, 1)) 60px;
      background: #fff;
      color: #1f2328;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --col: 128px;
      --line: #e3e5e8;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 24px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #111;
      font-family: var(--cv-heading-font, inherit);
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 14px;
      font-weight: 600;
    }
    .photo {
      width: 92px;
      height: 92px;
      flex-shrink: 0;
      border-radius: 6px;
      object-fit: cover;
    }
    .contact {
      margin-top: calc(10px * var(--cv-space, 1));
      padding-bottom: calc(14px * var(--cv-space, 1));
      border-bottom: 2px solid #111;
      color: #4b5159;
      font-size: 11px;
    }
    .dot {
      color: #aaa;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(6px * var(--cv-space, 1));
      color: #111;
      font-family: var(--cv-heading-font, inherit);
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .row {
      display: grid;
      grid-template-columns: var(--col) minmax(0, 1fr);
      gap: 0 18px;
      padding: calc(7px * var(--cv-space, 1)) 0;
      border-top: 1px solid var(--line);
    }
    .row-title {
      margin: 0;
      padding-top: 2px;
    }
    .summary {
      white-space: pre-line;
    }
    .row-label {
      padding-top: 1px;
      color: var(--cv-accent);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      overflow-wrap: anywhere;
    }
    .entry {
      break-inside: avoid;
    }
    h3 {
      color: #111;
      font-size: 12.5px;
      font-weight: 650;
    }
    .org {
      color: #4b5159;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 15px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvLedger extends CvTemplateBase {}
