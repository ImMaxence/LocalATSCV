import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Tracés au format 24×24, dessinés au trait (stroke). */
const ICONS = {
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41',
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z',
  monitor:
    'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z M8 21h8 M12 17v4',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z M7 11V7a5 5 0 0 1 10 0v4',
  shield:
    'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z M9 12l2 2 4-4',
  file: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M16 13H8 M16 17H8 M10 9H8',
  target:
    'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0Z M18 12a6 6 0 1 1-12 0 6 6 0 1 1 12 0Z M14 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0Z',
  layers: 'M12 2 2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
  highlighter: 'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
  scan: 'M3 7V5a2 2 0 0 1 2-2h2 M17 3h2a2 2 0 0 1 2 2v2 M21 17v2a2 2 0 0 1-2 2h-2 M7 21H5a2 2 0 0 1-2-2v-2 M15 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0Z M17 17l-2.1-2.1',
  import: 'M12 3v12 M7 10l5 5 5-5 M5 21h14',
  globe:
    'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0Z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z',
  device: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z M12 18h.01',
  printer:
    'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6Z',
  database:
    'M21 5c0 1.66-4.03 3-9 3S3 6.66 3 5s4.03-3 9-3 9 1.34 9 3Z M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5 M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3',
  server:
    'M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z M4 14h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z M6 6h.01 M6 18h.01',
  bot: 'M12 8V4H8 M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z M2 14h2 M20 14h2 M15 13v2 M9 13v2',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M15 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0Z',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 1-8 0 4 4 0 1 1 8 0Z',
  eyeOff:
    'M10.73 5.08A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68 M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61 M14.12 14.12a3 3 0 1 1-4.24-4.24 M2 2l20 20',
  check: 'M20 6 9 17l-5-5',
  plus: 'M12 5v14 M5 12h14',
  x: 'M18 6 6 18 M6 6l12 12',
  arrowRight: 'M5 12h14 M12 5l7 7-7 7',
  arrowLeft: 'M19 12H5 M12 19l-7-7 7-7',
  code: 'M16 18l6-6-6-6 M8 6l-6 6 6 6',
  flag: 'M4 22V3 M4 3h13l-2.5 4.5L17 12H4',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z M19 17v4 M17 19h4',
  refresh: 'M21 12a9 9 0 1 1-2.64-6.36L21 8 M21 3v5h-5',
  hammer:
    'M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9 M17.64 15 22 10.64 M20.91 11.7l-1.25-1.25a2 2 0 0 1-.59-1.41V7.5L15.5 4H9l1.5 1.5 3 3v1.46a2 2 0 0 0 .59 1.41l1.25 1.25',
} as const;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-full"
      [attr.stroke-width]="strokeWidth()"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly strokeWidth = input(1.75);

  protected readonly path = computed(() => ICONS[this.name()]);
}
