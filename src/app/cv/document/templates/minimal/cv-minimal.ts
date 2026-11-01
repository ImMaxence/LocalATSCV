import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Minimal : style suisse, nom très grand, titres de sections dans une marge à gauche. */
@Component({
  selector: 'app-cv-minimal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="min-w-0 flex-1">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (contact().length) {
          <ul class="contact">
            @for (item of contact(); track $index) {
              <li>{{ item }}</li>
            }
          </ul>
        }
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
      </header>

      @if (summary()) {
        <section class="row">
          <h2>{{ labels().sections.summary }}</h2>
          <p class="whitespace-pre-line">{{ summary() }}</p>
        </section>
      }
      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="row">
          <h2>{{ sectionTitle(section) }}</h2>
          <div class="min-w-0">
            @switch (section.kind) {
              @case ('skills') {
                <ul class="plain">
                  @for (group of skills(section); track group.id) {
                    <li>
                      @if (group.label.trim()) {
                        <strong>{{ group.label }}{{ separator() }}</strong>
                      }
                      {{ group.keywords }}
                    </li>
                  }
                </ul>
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
                    <h3>{{ entry.title }}</h3>
                    @if (entry.subtitle.trim() || dates(entry)) {
                      <p class="org">
                        {{ entry.subtitle }}
                        @if (entry.subtitle.trim() && dates(entry)) {
                          <span class="sep"> — </span>
                        }
                        <span class="dates">{{ dates(entry) }}</span>
                      </p>
                    }
                    @if (meta(entry)) {
                      <p class="meta">{{ meta(entry) }}</p>
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
          </div>
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
      padding: calc(62px * var(--cv-space, 1)) 64px;
      background: #fff;
      color: #161616;
      font-family: var(--cv-body-font, var(--font-sans));
      font-size: 12px;
      line-height: calc(1.55 * var(--cv-leading, 1));
    }
    header {
      display: flex;
      align-items: flex-end;
      gap: calc(24px * var(--cv-space, 1)) 24px;
      margin-bottom: calc(34px * var(--cv-space, 1));
    }
    .name {
      font-family: var(--cv-heading-font, inherit);
      font-size: 44px;
      font-weight: 800;
      letter-spacing: -0.045em;
      line-height: calc(0.95 * var(--cv-leading, 1));
    }
    .name::after {
      content: '';
      display: inline-block;
      width: 9px;
      height: 9px;
      margin-left: 4px;
      background: var(--cv-accent);
    }
    .headline {
      margin-top: calc(10px * var(--cv-space, 1));
      color: #6b6b6b;
      font-size: 16px;
    }
    .contact {
      color: #444;
      font-size: 11px;
      line-height: calc(1.6 * var(--cv-leading, 1));
      text-align: right;
    }
    .photo {
      width: 84px;
      height: 84px;
      flex-shrink: 0;
      object-fit: cover;
      filter: grayscale(0.15);
    }
    .row {
      display: grid;
      grid-template-columns: 124px minmax(0, 1fr);
      gap: calc(26px * var(--cv-space, 1)) 26px;
      padding-top: calc(16px * var(--cv-space, 1));
      margin-top: calc(16px * var(--cv-space, 1));
      border-top: 1px solid #ececec;
    }
    h2 {
      padding-top: calc(2px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    /* Le contenu démarre sous le titre de marge : à l'extraction, le titre reste seul sur sa ligne. */
    .row > :last-child {
      padding-top: calc(20px * var(--cv-space, 1));
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(13px * var(--cv-space, 1));
    }
    h3 {
      font-size: 13px;
      font-weight: 700;
    }
    .org {
      color: #444;
    }
    .sep,
    .dates,
    .meta {
      color: #8a8a8a;
    }
    .meta {
      font-size: 11px;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 14px;
      list-style: '·  ';
    }
    .bullets > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    .plain > li + li {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    strong {
      font-weight: 650;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvMinimal extends CvTemplateBase {}
