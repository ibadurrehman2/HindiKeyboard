
import { KeyboardKey } from './types';

export const HINDI_KEYBOARD_LAYOUT: KeyboardKey[][] = [
  // Numbers & Special
  [
    { label: '१', value: '१', type: 'character' }, { label: '२', value: '२', type: 'character' },
    { label: '३', value: '३', type: 'character' }, { label: '४', value: '४', type: 'character' },
    { label: '५', value: '५', type: 'character' }, { label: '६', value: '६', type: 'character' },
    { label: '७', value: '७', type: 'character' }, { label: '८', value: '८', type: 'character' },
    { label: '९', value: '९', type: 'character' }, { label: '०', value: '०', type: 'character' },
    { label: 'Bksp', value: 'BACKSPACE', type: 'action' }
  ],
  // Vowels (Swar)
  [
    { label: 'अ', value: 'अ', type: 'character' }, { label: 'आ', value: 'आ', type: 'character' },
    { label: 'इ', value: 'इ', type: 'character' }, { label: 'ई', value: 'ई', type: 'character' },
    { label: 'उ', value: 'उ', type: 'character' }, { label: 'ऊ', value: 'ऊ', type: 'character' },
    { label: 'ऋ', value: 'ऋ', type: 'character' }, { label: 'ए', value: 'ए', type: 'character' },
    { label: 'ऐ', value: 'ऐ', type: 'character' }, { label: 'ओ', value: 'ओ', type: 'character' },
    { label: 'औ', value: 'औ', type: 'character' }
  ],
  // Consonants (Vyanjan) - Ka-varg
  [
    { label: 'क', value: 'क', type: 'character' }, { label: 'ख', value: 'ख', type: 'character' },
    { label: 'ग', value: 'ग', type: 'character' }, { label: 'घ', value: 'घ', type: 'character' },
    { label: 'ङ', value: 'ङ', type: 'character' }, { label: 'च', value: 'च', type: 'character' },
    { label: 'छ', value: 'छ', type: 'character' }, { label: 'ज', value: 'ज', type: 'character' },
    { label: 'झ', value: 'झ', type: 'character' }, { label: 'ञ', value: 'ञ', type: 'character' }
  ],
  // Ta-varg & Ta-varg (retroflex)
  [
    { label: 'ट', value: 'ट', type: 'character' }, { label: 'ठ', value: 'ठ', type: 'character' },
    { label: 'ड', value: 'ड', type: 'character' }, { label: 'ढ', value: 'ढ', type: 'character' },
    { label: 'ण', value: 'ण', type: 'character' }, { label: 'त', value: 'त', type: 'character' },
    { label: 'थ', value: 'थ', type: 'character' }, { label: 'द', value: 'द', type: 'character' },
    { label: 'ध', value: 'ध', type: 'character' }, { label: 'न', value: 'न', type: 'character' }
  ],
  // Pa-varg & Others
  [
    { label: 'प', value: 'प', type: 'character' }, { label: 'फ', value: 'फ', type: 'character' },
    { label: 'ब', value: 'ब', type: 'character' }, { label: 'भ', value: 'भ', type: 'character' },
    { label: 'म', value: 'म', type: 'character' }, { label: 'य', value: 'य', type: 'character' },
    { label: 'र', value: 'र', type: 'character' }, { label: 'ल', value: 'ल', type: 'character' },
    { label: 'व', value: 'व', type: 'character' }, { label: 'श', value: 'श', type: 'character' }
  ],
  // Matras & Modifiers
  [
    { label: 'ष', value: 'ष', type: 'character' }, { label: 'स', value: 'स', type: 'character' },
    { label: 'ह', value: 'ह', type: 'character' }, { label: 'ा', value: 'ा', type: 'character' },
    { label: 'ि', value: 'ि', type: 'character' }, { label: 'ी', value: 'ी', type: 'character' },
    { label: 'ु', value: 'ु', type: 'character' }, { label: 'ू', value: 'ू', type: 'character' },
    { label: 'े', value: 'े', type: 'character' }, { label: 'ै', value: 'ै', type: 'character' },
    { label: 'ो', value: 'ो', type: 'character' }, { label: 'ौ', value: 'ौ', type: 'character' }
  ],
  // Bottom Row
  [
    { label: 'ं', value: 'ं', type: 'character' }, { label: 'ः', value: 'ः', type: 'character' },
    { label: '्', value: '्', type: 'character' }, { label: 'SPACE', value: ' ', type: 'action' },
    { label: 'Enter', value: 'ENTER', type: 'action' }
  ]
];
