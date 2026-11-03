import { AvatarIcon, initials } from '../../model/avatar';
import { IconName, iconPath } from '../../../shared/icon/icon';

/** Côté de l'image : net à l'impression pour les plus grandes photos des modèles (150 px). */
const SIZE = 512;
const cache = new Map<string, string>();

/**
 * Icône (ou initiales) qui remplace la photo, dessinée en PNG sur la couleur d'accent. C'est
 * une image comme une photo : chaque modèle la recadre à sa façon (rond, cadre, polaroïd…), et
 * le PDF n'y voit aucun texte, alors que des initiales en SVG y seraient écrites et lues par
 * les ATS.
 */
export function avatarDataUrl(
  icon: AvatarIcon,
  color: string,
  firstName: string,
  lastName: string,
): string | null {
  const text = icon === 'initials' ? initials(firstName, lastName) || '?' : '';
  const key = `${icon}|${color}|${text}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = color;
  context.fillRect(0, 0, SIZE, SIZE);
  context.fillStyle = context.strokeStyle = '#fff';
  if (icon === 'initials') {
    context.font = `600 ${text.length > 1 ? 200 : 240}px system-ui, 'Segoe UI', Roboto, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, SIZE / 2, SIZE / 2 + SIZE * 0.02);
  } else {
    // Pictogramme de 24 × 24 agrandi à la moitié de l'image, centré.
    context.translate(SIZE / 4, SIZE / 4);
    context.scale(SIZE / 2 / 24, SIZE / 2 / 24);
    context.lineWidth = 1.6;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke(new Path2D(iconPath(icon as IconName)));
  }
  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}
