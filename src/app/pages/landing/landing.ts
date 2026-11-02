import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { CONTACT_EMAIL } from '../../core/app-info';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon, IconName } from '../../shared/icon/icon';
import {
  DEMO_BULLETS,
  DEMO_KEYWORDS,
  DEMO_NAME,
  DEMO_SCORE,
  DemoSegment,
  DemoSegmentsPipe,
} from './landing-demo';
import { DISABILITY_LABELS } from '../../cv/model/disability';
import { FAQ_ITEMS } from './faq';

interface IconItem {
  key: string;
  icon: IconName;
}

const SCORE_RADIUS = 42;

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon, DemoSegmentsPipe],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  protected readonly language = inject(LanguageService);

  protected readonly contactEmail = CONTACT_EMAIL;

  protected readonly demoName = DEMO_NAME;
  protected readonly demoBullets = DEMO_BULLETS;
  protected readonly demoKeywords = DEMO_KEYWORDS;
  protected readonly demoScore = DEMO_SCORE;
  protected readonly scoreRadius = SCORE_RADIUS;
  protected readonly scoreCircumference = 2 * Math.PI * SCORE_RADIUS;
  protected readonly scoreOffset = this.scoreCircumference * (1 - DEMO_SCORE / 100);

  protected readonly heroPoints = ['templates', 'letter', 'private'];

  protected readonly pitfalls: IconItem[] = [
    { key: 'layout', icon: 'layers' },
    { key: 'image', icon: 'eyeOff' },
    { key: 'keywords', icon: 'target' },
  ];

  protected readonly steps: IconItem[] = [
    { key: 'profile', icon: 'user' },
    { key: 'offer', icon: 'target' },
    { key: 'compose', icon: 'layers' },
    { key: 'export', icon: 'printer' },
  ];

  protected readonly storedItems = ['cvs', 'photo', 'letters', 'settings'];
  protected readonly serverAbsences = ['noDb', 'noAccount', 'noLogs'];

  protected readonly privacyPoints: IconItem[] = [
    { key: 'account', icon: 'user' },
    { key: 'trackers', icon: 'eyeOff' },
    { key: 'csp', icon: 'shield' },
    { key: 'backup', icon: 'database' },
  ];

  protected readonly features: IconItem[] = [
    { key: 'templates', icon: 'layout' },
    { key: 'letter', icon: 'mail' },
    { key: 'master', icon: 'layers' },
    { key: 'score', icon: 'target' },
    { key: 'weak', icon: 'highlighter' },
    { key: 'analyzer', icon: 'scan' },
    { key: 'import', icon: 'import' },
    { key: 'languages', icon: 'globe' },
  ];

  protected readonly faq = FAQ_ITEMS;

  protected readonly inclusivePoints: IconItem[] = [
    { key: 'disclosure', icon: 'access' },
    { key: 'display', icon: 'type' },
    { key: 'listen', icon: 'volume' },
    { key: 'guided', icon: 'footprints' },
  ];

  /** Formulation reconnue dans chaque pays, telle qu'elle s'imprime sur le CV. */
  protected readonly disabilityMentions = (['fr', 'it', 'es', 'de'] as const).map((lang) => ({
    lang,
    text: DISABILITY_LABELS[lang].suggestions[0],
  }));

  /** Une puce qui contient une phrase faible affiche la suggestion de verbe d'action. */
  protected hasWeak(segments: DemoSegment[]): boolean {
    return segments.some((segment) => segment.kind === 'weak');
  }
}
