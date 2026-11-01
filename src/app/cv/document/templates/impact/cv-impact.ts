import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon, IconName } from '../../../../shared/icon/icon';
import { SectionKind } from '../../../model/cv.model';
import { CvTemplateBase } from '../cv-template-base';

const SECTION_ICONS: Record<SectionKind | 'summary', IconName> = {
  summary: 'user',
  experience: 'briefcase',
  education: 'graduation',
  projects: 'folder',
  certifications: 'award',
  custom: 'list',
  skills: 'zap',
  languages: 'globe',
  interests: 'heart',
};

/**
 * Impact : le plus visuel des modèles, sans rien sacrifier pour les ATS. Bandeau avec photo,
 * icônes, frise chronologique et jauges de langue sont des dessins (SVG, CSS) ; tout le texte
 * reste réel et suit une seule colonne de lecture.
 */
@Component({
  selector: 'app-cv-impact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="hero">
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        <div class="min-w-0">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
      </header>

      @if (contactItems().length) {
        <ul class="contact">
          @for (item of contactItems(); track $index) {
            <li>
              <app-icon class="contact-icon" [name]="contactIcons[item.kind]" [strokeWidth]="2" />
              <span>{{ item.text }}</span>
            </li>
          }
        </ul>
      }

      <div class="body">
        @if (summary()) {
          <section class="section">
            <h2>
              <span class="badge"><app-icon [name]="icons.summary" [strokeWidth]="2" /></span>
              {{ labels().sections.summary }}
            </h2>
            <p class="summary">{{ summary() }}</p>
          </section>
        }

        @for (section of cv().sections; track section.id) {
          <section class="section">
            <h2>
              <span class="badge"><app-icon [name]="icons[section.kind]" [strokeWidth]="2" /></span>
              {{ sectionTitle(section) }}
            </h2>
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id) {
                  <div class="skill-row">
                    @if (group.label.trim()) {
                      <p class="skill-label">{{ group.label }}</p>
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
                      <span class="language">{{ languageLabel(item) }}</span>
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
                            <span class="sep"> · </span>
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
      box-sizing: border-box;
      width: 794px;
      min-height: 1123px;
      background: #fff;
      color: #1f2328;
      font-family: var(--font-sans);
      font-size: 12.5px;
      line-height: 1.45;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .hero {
      display: flex;
      align-items: center;
      gap: 26px;
      padding: 34px 56px 28px;
      background:
        radial-gradient(circle at 92% 0%, rgb(255 255 255 / 0.18), transparent 45%),
        linear-gradient(135deg, var(--cv-accent), color-mix(in srgb, var(--cv-accent) 70%, black));
      color: #fff;
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border: 4px solid rgb(255 255 255 / 0.85);
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 10px 24px -8px rgb(0 0 0 / 0.45);
    }
    .name {
      font-family: var(--font-grotesk);
      font-size: 38px;
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.02;
    }
    .headline {
      display: inline-block;
      margin-top: 10px;
      padding: 3px 12px;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.16);
      font-size: 14px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 22px;
      padding: 12px 56px;
      background: color-mix(in srgb, var(--cv-accent) 8%, white);
      color: #333;
      font-size: 11.5px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--cv-accent);
    }
    .body {
      padding: 4px 56px 40px;
    }
    .section {
      margin-top: 17px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 11px;
      color: #111;
      font-family: var(--font-grotesk);
      font-size: 16px;
      font-weight: 700;
    }
    .badge {
      display: grid;
      width: 26px;
      height: 26px;
      flex-shrink: 0;
      place-items: center;
      border-radius: 8px;
      background: var(--cv-accent);
      color: #fff;
    }
    .badge > * {
      width: 14px;
      height: 14px;
    }
    .summary {
      padding: 10px 14px;
      border-left: 3px solid var(--cv-accent);
      border-radius: 0 8px 8px 0;
      background: #f7f7f8;
      white-space: pre-line;
    }
    .timeline {
      margin-left: 12px;
      padding-left: 22px;
      border-left: 2px solid color-mix(in srgb, var(--cv-accent) 25%, white);
    }
    .entry {
      position: relative;
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: 11px;
    }
    .entry::before {
      content: '';
      position: absolute;
      top: 4px;
      left: -29px;
      width: 12px;
      height: 12px;
      box-sizing: border-box;
      border: 3px solid var(--cv-accent);
      border-radius: 9999px;
      background: #fff;
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      color: #111;
      font-size: 13.5px;
      font-weight: 650;
    }
    .dates {
      flex-shrink: 0;
      padding: 1px 10px;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--cv-accent) 11%, white);
      color: var(--cv-accent);
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .org {
      color: #666;
      font-size: 12px;
    }
    .company {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .bullets {
      margin-top: 4px;
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: 2px;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .skill-row + .skill-row {
      margin-top: 8px;
    }
    .skill-label {
      margin-bottom: 4px;
      color: #666;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .chips > li {
      padding: 2px 10px;
      border: 1px solid color-mix(in srgb, var(--cv-accent) 22%, white);
      border-radius: 9999px;
      background: color-mix(in srgb, var(--cv-accent) 6%, white);
      font-size: 11.5px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: 5px;
    }
    .meter {
      display: flex;
      gap: 3px;
    }
    .step {
      width: 18px;
      height: 6px;
      border-radius: 3px;
      background: #e5e7eb;
    }
    .step.on {
      background: var(--cv-accent);
    }
  `,
})
export class CvImpact extends CvTemplateBase {
  protected readonly icons = SECTION_ICONS;
}
