import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { encode } from 'uqr';
import { IconName, iconPath, isFilledIcon } from '../../../shared/icon/icon';

/**
 * QR code vectoriel (SVG), généré dans le navigateur. Pour un ATS c'est une image : l'adresse
 * doit aussi figurer en texte dans le CV (c'est le cas, dans les coordonnées).
 * Avec un logo au centre, la correction d'erreur maximale garde le code lisible.
 */
@Component({
  selector: 'app-qr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + qr().size + ' ' + qr().size"
      shape-rendering="crispEdges"
      class="block size-full"
      aria-hidden="true"
    >
      <path [attr.d]="qr().path" fill="currentColor" />
      @if (logo(); as name) {
        <rect
          [attr.x]="qr().size * 0.36"
          [attr.y]="qr().size * 0.36"
          [attr.width]="qr().size * 0.28"
          [attr.height]="qr().size * 0.28"
          rx="1"
          fill="#fff"
        />
        <g [attr.transform]="logoTransform()">
          <path
            [attr.d]="logoPath()"
            [attr.fill]="filled() ? 'currentColor' : 'none'"
            [attr.stroke]="filled() ? 'none' : 'currentColor'"
            stroke-width="2"
          />
        </g>
      }
    </svg>
  `,
})
export class QrCode {
  readonly value = input.required<string>();
  readonly logo = input<IconName | null>(null);

  protected readonly qr = computed(() => {
    const { size, data } = encode(this.value(), { ecc: this.logo() ? 'H' : 'M', border: 0 });
    let path = '';
    data.forEach((row, y) => row.forEach((dark, x) => dark && (path += `M${x} ${y}h1v1h-1z`)));
    return { size, path };
  });

  protected readonly logoPath = computed(() => iconPath(this.logo() ?? 'globe'));
  protected readonly filled = computed(() => isFilledIcon(this.logo() ?? 'globe'));
  /** Le logo (dessiné sur 24 unités) occupe 20 % du code, centré. */
  protected readonly logoTransform = computed(() => {
    const size = this.qr().size;
    const box = size * 0.2;
    const offset = (size - box) / 2;
    return `translate(${offset} ${offset}) scale(${box / 24})`;
  });
}
