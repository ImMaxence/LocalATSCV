import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Partagé : colonne principale large à gauche, colonne étroite gris clair à droite (contact,
 * compétences, langues, intérêts). La colonne principale précède la colonne latérale dans le
 * document, pour les ATS qui lisent le fichier dans l'ordre.
 */
@Component({
  selector: 'app-cv-split',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, Icon, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="main">
        <header>
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </header>
        @if (summary()) {
          <section class="section">
            <h2>{{ labels().sections.summary }}</h2>
            <p class="whitespace-pre-line">{{ summary() }}</p>
          </section>
        }
        @if (letter(); as body) {
          <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
        }
        @for (section of mainSections(); track section.id) {
          <section class="section">
            <h2>{{ sectionTitle(section) }}</h2>
            @for (entry of entries(section); track entry.id) {
              <div class="entry">
                <div class="entry-head">
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
          </section>
        }
      </div>

      <aside>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        @if (contact().length) {
          <section class="side-section">
            <h2>{{ labels().contact }}</h2>
            <ul class="side-list">
              @for (item of contactItems(); track $index) {
                <li class="contact-row">
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
                  <span class="min-w-0">{{ item.text }}</span>
                </li>
              }
            </ul>
          </section>
        }
        @for (section of sideSections(); track section.id) {
          <section class="side-section">
            <h2>{{ sectionTitle(section) }}</h2>
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id) {
                  @if (group.label.trim()) {
                    <p class="side-label">{{ group.label }}</p>
                  }
                  <ul class="side-list">
                    @for (keyword of keywords(group); track $index) {
                      <li>{{ keyword }}</li>
                    }
                  </ul>
                }
              }
              @case ('languages') {
                <ul class="side-list">
                  @for (item of languages(section); track item.id) {
                    <li>
                      {{ languageLabel(item) }}
                      @if (languageLevel(item); as level) {
                        <span class="meter" aria-hidden="true">
                          <span class="fill" [style.width.%]="level * 20"></span>
                        </span>
                      }
                    </li>
                  }
                </ul>
              }
              @default {
                <ul class="side-list">
                  @for (item of interests(section); track item.id) {
                    <li>{{ item.label }}</li>
                  }
                </ul>
              }
            }
          </section>
        }
      </aside>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .cv {
      box-sizing: border-box;
      display: grid;
      grid-template-areas: 'main aside';
      grid-template-columns: minmax(0, 1fr) 222px;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      background: #fff;
      color: #1f2328;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .main {
      grid-area: main;
      padding: calc(48px * var(--cv-space, 1)) 34px calc(46px * var(--cv-space, 1)) 50px;
    }
    aside {
      grid-area: aside;
      padding: calc(48px * var(--cv-space, 1)) 28px calc(46px * var(--cv-space, 1)) 26px;
      background: #f3f4f6;
    }
    .name {
      color: #111;
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.08 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(5px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 14px;
      font-weight: 600;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .main h2 {
      margin-bottom: calc(8px * var(--cv-space, 1));
      padding-bottom: calc(3px * var(--cv-space, 1));
      border-bottom: 2px solid var(--cv-accent);
      color: #111;
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
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
      gap: 12px;
    }
    h3 {
      color: #111;
      font-size: 12.5px;
      font-weight: 650;
    }
    .dates {
      flex-shrink: 0;
      color: #6b7280;
      font-size: 10.5px;
    }
    .org {
      color: #4b5563;
      font-size: 11.5px;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 15px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    .photo {
      width: 120px;
      height: 120px;
      margin: 0 auto calc(20px * var(--cv-space, 1));
      border-radius: 8px;
      object-fit: cover;
    }
    .side-section + .side-section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    aside h2 {
      margin-bottom: calc(8px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .side-list {
      font-size: 11px;
    }
    .side-list > li {
      overflow-wrap: anywhere;
    }
    .side-list > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .contact-row {
      display: flex;
      gap: 7px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      margin-top: 2px;
      flex-shrink: 0;
      color: #6b7280;
    }
    .side-label {
      margin: calc(8px * var(--cv-space, 1)) 0 calc(3px * var(--cv-space, 1));
      color: #111;
      font-size: 11px;
      font-weight: 700;
    }
    .meter {
      display: block;
      height: 4px;
      margin-top: calc(3px * var(--cv-space, 1));
      border-radius: 2px;
      background: #dfe2e7;
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 2px;
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvSplit extends CvTemplateBase {}
