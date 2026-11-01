import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { CONTACT_EMAIL } from '../../core/app-info';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon, IconName } from '../../shared/icon/icon';
import { LANDING_DEMO } from './landing-demo';
import { FAQ_ITEMS } from './faq';

interface IconItem {
  key: string;
  icon: IconName;
}

const SCORE_RADIUS = 42;

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private readonly language = inject(LanguageService);

  protected readonly demo = computed(() => LANDING_DEMO[this.language.current()]);
  protected readonly contactEmail = CONTACT_EMAIL;

  protected readonly scoreRadius = SCORE_RADIUS;
  protected readonly scoreCircumference = 2 * Math.PI * SCORE_RADIUS;
  protected readonly scoreOffset = computed(
    () => this.scoreCircumference * (1 - this.demo().score.value / 100),
  );

  protected readonly heroPoints = ['noAccount', 'offline', 'atsPdf'];

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

  protected readonly storedItems = ['master', 'photo', 'versions', 'settings'];
  protected readonly serverAbsences = ['noDb', 'noAccount', 'noLogs'];

  protected readonly privacyPoints: IconItem[] = [
    { key: 'account', icon: 'user' },
    { key: 'trackers', icon: 'eyeOff' },
    { key: 'csp', icon: 'shield' },
    { key: 'backup', icon: 'database' },
  ];

  protected readonly features: IconItem[] = [
    { key: 'master', icon: 'layers' },
    { key: 'score', icon: 'target' },
    { key: 'weak', icon: 'highlighter' },
    { key: 'analyzer', icon: 'scan' },
    { key: 'linkedin', icon: 'import' },
    { key: 'languages', icon: 'globe' },
    { key: 'pdf', icon: 'printer' },
    { key: 'offline', icon: 'device' },
  ];

  protected readonly faq = FAQ_ITEMS;
}
