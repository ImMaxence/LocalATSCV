import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Signale qu'une nouvelle version a été téléchargée par le service worker. */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly swUpdate = inject(SwUpdate);

  readonly updateReady = signal(false);

  constructor() {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(
        filter((event) => event.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updateReady.set(true));

    // L'onglet peut rester ouvert longtemps (PWA installée) : on revérifie régulièrement.
    interval(CHECK_INTERVAL_MS)
      .pipe(takeUntilDestroyed())
      .subscribe(() => void this.swUpdate.checkForUpdate().catch(() => undefined));

    // Cache du service worker corrompu : seul un rechargement complet permet de repartir.
    this.swUpdate.unrecoverable.pipe(takeUntilDestroyed()).subscribe(() => location.reload());
  }

  dismiss(): void {
    this.updateReady.set(false);
  }

  reload(): void {
    location.reload();
  }
}
