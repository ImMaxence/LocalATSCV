import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Colonnes : colonne latérale colorée (photo, contact, compétences, langues).
 * La colonne principale est placée en premier dans le document : les ATS qui lisent
 * le texte dans l'ordre du fichier la traitent avant la colonne latérale.
 */
@Component({
  selector: 'app-cv-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="main">
        @if (fullName()) {
          <h1 class="name">{{ fullName() }}</h1>
        }
        @if (cv().profile.title.trim()) {
          <p class="headline">{{ cv().profile.title }}</p>
        }
        @if (summary()) {
          <section class="section">
            <h2>{{ labels().sections.summary }}</h2>
            <p class="whitespace-pre-line">{{ summary() }}</p>
          </section>
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
                @if (entry.subtitle.trim() || meta(entry)) {
                  <p class="org">
                    <span class="company">{{ entry.subtitle }}</span>
                    @if (entry.subtitle.trim() && meta(entry)) {
                      <span> · </span>
                    }
                    <span>{{ meta(entry) }}</span>
                  </p>
                }
                @if (entry.bullets.length) {
                  <ul class="bullets">
                    @for (bullet of entry.bullets; track bullet.id) {
                      <li>{{ bullet.text }}</li>
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
                  <app-icon
                    class="contact-icon"
                    [name]="contactIcons[item.kind]"
                    [strokeWidth]="2"
                  />
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
                  <ul class="chips">
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
                          @for (step of levelSteps; track step) {
                            <span class="step" [class.on]="step <= level"></span>
                          }
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
      grid-template-areas: 'aside main';
      grid-template-columns: 248px minmax(0, 1fr);
      width: 794px;
      min-height: 1123px;
      background: #fff;
      color: #1f2328;
      font-family: var(--font-sans);
      font-size: 12px;
      line-height: 1.45;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    aside {
      grid-area: aside;
      padding: 46px 26px;
      background: color-mix(in srgb, var(--cv-accent) 88%, black);
      color: rgb(255 255 255 / 0.92);
    }
    .main {
      grid-area: main;
      padding: 46px 40px 46px 38px;
    }
    .photo {
      width: 136px;
      height: 136px;
      margin: 0 auto 26px;
      border: 4px solid rgb(255 255 255 / 0.25);
      border-radius: 9999px;
      object-fit: cover;
    }
    .name {
      color: #111;
      font-family: var(--font-grotesk);
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.05;
    }
    .headline {
      margin-top: 6px;
      color: var(--cv-accent);
      font-size: 15px;
      font-weight: 600;
    }
    .section {
      margin-top: 20px;
    }
    .main h2 {
      margin-bottom: 9px;
      padding-left: 10px;
      border-left: 4px solid var(--cv-accent);
      color: #111;
      font-family: var(--font-grotesk);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: 11px;
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }
    h3 {
      color: #111;
      font-size: 13px;
      font-weight: 650;
    }
    .dates {
      flex-shrink: 0;
      color: #777;
      font-size: 11px;
    }
    .org {
      color: #666;
      font-size: 11.5px;
    }
    .company {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .bullets {
      margin-top: 4px;
      padding-left: 15px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: 2px;
    }
    .side-section + .side-section {
      margin-top: 24px;
    }
    aside h2 {
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid rgb(255 255 255 / 0.25);
      color: #fff;
      font-family: var(--font-grotesk);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .side-list > li {
      overflow-wrap: anywhere;
    }
    .contact-row {
      display: flex;
      gap: 7px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      margin-top: 2px;
      opacity: 0.75;
    }
    .meter {
      display: flex;
      gap: 3px;
      margin-top: 4px;
    }
    .step {
      width: 22px;
      height: 5px;
      border-radius: 3px;
      background: rgb(255 255 255 / 0.2);
    }
    .step.on {
      background: #fff;
    }
    .side-list > li + li {
      margin-top: 5px;
    }
    .side-label {
      margin: 8px 0 5px;
      color: rgb(255 255 255 / 0.7);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .chips > li {
      padding: 2px 9px;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.14);
      font-size: 11px;
    }
  `,
})
export class CvSidebar extends CvTemplateBase {}
