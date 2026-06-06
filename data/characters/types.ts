export type CharacterType = "consonant" | "vowel";
export type FontMode = "traditional" | "modern" | "both";
export type ConfidenceState = "new" | "fresh" | "due" | "rusty";
export type ContentFrequency = "common" | "uncommon" | "rare";
export type ConsonantClass = "low" | "mid" | "high";
export type VowelLengthCategory = "short" | "long" | "standalone";

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
  consonantClass?: ConsonantClass;
  vowelLengthCategory?: VowelLengthCategory;
  visualSimilarities: CharacterComparison[];
  soundSimilarities: CharacterComparison[];
  enabled: boolean;
};
