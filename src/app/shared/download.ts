/** Propose le téléchargement d'un fichier généré dans le navigateur (aucun aller-retour serveur). */
export function downloadFile(content: string, filename: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** `Développeuse Front` → `developpeuse-front` */
export function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'cv'
  );
}

export const today = (): string => new Date().toISOString().slice(0, 10);
