export type CharacterType = "consonant" | "vowel";
export type FontMode = "traditional" | "modern" | "both";
export type ConfidenceState = "new" | "fresh" | "due" | "rusty";
export type ContentFrequency = "common" | "uncommon" | "rare";

export type CharacterComparison = {
  characterId: string;
  explanation: string;
};

export type ThaiCharacter = {
  id: string;
  type: CharacterType;
  thaiTraditional: string;
  thaiModern: string;
  romanisedName: string;
  roughSound: string;
  mnemonic: string;
  exampleCue?: string;
  learningOrder: number;
  difficultyGroup: number;
  contentFrequency: ContentFrequency;
  visualSimilarities: CharacterComparison[];
  soundSimilarities: CharacterComparison[];
  enabled: boolean;
};
