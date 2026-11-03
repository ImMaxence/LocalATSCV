import { initials, isAvatarIcon } from './avatar';

describe('icône à la place de la photo', () => {
  it('forme les initiales du prénom et du nom', () => {
    expect(initials('Camille', 'Martin')).toBe('CM');
    expect(initials(' élodie ', '')).toBe('É');
    expect(initials('Jean-Luc', "d'Arc")).toBe('JD');
    expect(initials('', '')).toBe('');
  });

  it('ne reconnaît que les icônes proposées', () => {
    expect(isAvatarIcon('rocket')).toBe(true);
    expect(isAvatarIcon('initials')).toBe(true);
    expect(isAvatarIcon('linkedin')).toBe(false);
    expect(isAvatarIcon(null)).toBe(false);
  });
});
