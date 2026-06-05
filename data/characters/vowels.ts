import type { ThaiCharacter } from "./types";

// Phase 1 treats common written vowel signs and combinations as recognition units.
// A dotted circle (◌) marks where the consonant sits when a vowel wraps around it.
const base = [
  ["vow_sara_a", "◌ะ", "sara a", "a", "Short a uses a small final stop mark after the consonant.", "short a"],
  ["vow_mai_han_akat", "◌ั", "mai han-akat", "a", "The short-a cap sits above the consonant, so look upward first.", "above short a"],
  ["vow_sara_aa", "◌า", "sara aa", "aa", "Long aa is the open arm trailing to the right of the consonant.", "long aa"],
  ["vow_sara_am", "◌ำ", "sara am", "am", "Am combines the little circle above with the long-aa arm on the right.", "am"],
  ["vow_sara_i", "◌ิ", "sara i", "i", "Short i is a compact roof directly above the consonant.", "short i"],
  ["vow_sara_ii", "◌ี", "sara ii", "ii", "Long ii keeps the roof but adds a clear upward tail.", "long ii"],
  ["vow_sara_ue", "◌ึ", "sara ue", "ue", "Short ue is the i-roof with a small extra nub beneath it.", "short ue"],
  ["vow_sara_uee", "◌ื", "sara uee", "uee", "Long uee stretches across the top with two small posts.", "long uee"],
  ["vow_sara_u", "◌ุ", "sara u", "u", "Short u is a small hook tucked below the consonant.", "short u"],
  ["vow_sara_uu", "◌ู", "sara uu", "uu", "Long uu hangs below with a longer looped tail.", "long uu"],
  ["vow_sara_e", "เ◌", "sara e", "e", "E stands before the consonant as one leading vertical stroke.", "long e"],
  ["vow_sara_e_short", "เ◌ะ", "sara e short", "e", "Short e adds the final ะ stop after the single leading เ.", "short e"],
  ["vow_sara_ae", "แ◌", "sara ae", "ae", "Ae doubles the leading stroke, so two rails appear before the consonant.", "long ae"],
  ["vow_sara_ae_short", "แ◌ะ", "sara ae short", "ae", "Short ae keeps the double leading rails and adds the final ะ stop.", "short ae"],
  ["vow_sara_o", "โ◌", "sara o", "o", "O is a leading stroke with a rounded loop sitting on top.", "long o"],
  ["vow_sara_o_short", "โ◌ะ", "sara o short", "o", "Short o keeps the looped โ in front and closes with ะ after the consonant.", "short o"],
  ["vow_sara_ai_mai_muan", "ใ◌", "sara ai mai muan", "ai", "Mai muan curls inward at the top before dropping down.", "ai curl"],
  ["vow_sara_ai_mai_malai", "ไ◌", "sara ai mai malai", "ai", "Mai malai rises taller and opens outward before dropping down.", "ai tall"],
  ["vow_sara_ao", "เ◌า", "sara ao", "ao", "Ao wraps the consonant with เ before it and า after it.", "ao"],
  ["vow_sara_aw_short", "เ◌าะ", "sara aw short", "aw", "Short aw starts with เ and closes with the rounded าะ ending.", "short aw"],
  ["vow_sara_aw", "◌อ", "sara aw", "aw", "Long aw uses the basin-like อ after the consonant.", "long aw"],
  ["vow_sara_oe", "เ◌อะ", "sara oe short", "oe", "Short oe has เ before the consonant and อะ after it.", "short oe"],
  ["vow_sara_oee", "เ◌อ", "sara oe", "oe", "Long oe keeps เ before the consonant and อ after it without ะ.", "long oe"],
  ["vow_sara_ia", "เ◌ียะ", "sara ia short", "ia", "Short ia wraps around: เ before, ี above, ย then ะ after.", "short ia"],
  ["vow_sara_iia", "เ◌ีย", "sara ia", "ia", "Long ia keeps เ before, ี above, and ย after without the ะ stop.", "long ia"],
  ["vow_sara_uea", "เ◌ือะ", "sara uea short", "uea", "Short uea uses เ before, ื above, then อะ after.", "short uea"],
  ["vow_sara_ueea", "เ◌ือ", "sara uea", "uea", "Long uea keeps เ before, ื above, and อ after without ะ.", "long uea"],
  ["vow_sara_ua", "◌ัวะ", "sara ua short", "ua", "Short ua has the above cap, ว to the right, and a final ะ stop.", "short ua"],
  ["vow_sara_uua", "◌ัว", "sara ua", "ua", "Long ua keeps the above cap plus ว, but drops the final ะ stop.", "long ua"],
  ["vow_ru", "ฤ", "ru", "rue/ri", "The special vocalic-r sign is a standalone rare vowel-like character.", "vocalic r"],
  ["vow_ruu", "ฤๅ", "ruu", "rue", "The long vocalic-r form adds the trailing length mark ๅ.", "long vocalic r"],
  ["vow_lu", "ฦ", "lu", "lue", "The special vocalic-l sign is rare but part of the traditional set.", "vocalic l"],
  ["vow_luu", "ฦๅ", "luu", "lue", "The long vocalic-l form adds the trailing length mark ๅ and is extremely rare.", "long vocalic l"]
] as const;

export const vowels: ThaiCharacter[] = base.map((item, index) => ({
  id: item[0],
  type: "vowel",
  thaiTraditional: item[1],
  thaiModern: item[1],
  romanisedName: item[2],
  roughSound: item[3],
  mnemonic: item[4],
  exampleCue: item[5],
  learningOrder: 100 + index + 1,
  difficultyGroup: Math.floor(index / 6) + 1,
  visualSimilarities: [],
  soundSimilarities: [],
  enabled: true
}));
