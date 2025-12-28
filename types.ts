
export enum KeyboardMode {
  HINDI = 'HINDI',
  ENGLISH = 'ENGLISH'
}

export interface KeyboardKey {
  label: string;
  value: string;
  type: 'character' | 'special' | 'action';
}

export interface TypingSession {
  id: string;
  text: string;
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
