import type { ThaiCharacter } from "./types";

// Phase 1 treats common written vowel signs and combinations as recognition units.
// Thai vowel analysis varies by course because some forms depend on live/dead syllables
// and implicit vowels; this near-complete starter set is intentionally documented for review.
const base = [
  ["vow_sara_a","ะ","sara a","a","A small stop-like mark for short a.","short a"],
  ["vow_mai_han_akat","ั","mai han-akat","a","A small cap above the consonant.","above a"],
  ["vow_sara_aa","า","sara aa","aa/a","A long trailing arm after the consonant.","long a"],
  ["vow_sara_i","ิ","sara i","i","A small roof above the consonant.","short i"],
  ["vow_sara_ii","ี","sara ii","ii/ee","Roof plus a longer tail for long i.","long i"],
  ["vow_sara_ue","ึ","sara ue","ue","Short ue adds a small nub under the roof.","short ue"],
  ["vow_sara_uee","ื","sara uee","uee","Long ue stretches the roof with paired marks.","long ue"],
  ["vow_sara_u","ุ","sara u","u","A small mark below the consonant.","short u"],
  ["vow_sara_uu","ู","sara uu","uu/oo","Long u hangs lower with a looped tail.","long u"],
  ["vow_sara_e","เ","sara e","e/ay","A leading vertical mark before the consonant.","e"],
  ["vow_sara_ae","แ","sara ae","ae","Double leading marks widen the vowel.","ae"],
  ["vow_sara_o","โ","sara o","o","Leading mark with a top loop.","o"],
  ["vow_sara_ai_mai_muan","ใ","sara ai mai muan","ai","Leading ai mark has an inward curl.","ai curl"],
  ["vow_sara_ai_mai_malai","ไ","sara ai mai malai","ai","Leading ai mark has a tall open shape.","ai tall"],
  ["vow_sara_am","ำ","sara am","am","Circle-above plus long a tail.","am"],
  ["vow_sara_ao","เา","sara ao","ao","Leading e plus long-a tail.","ao"],
  ["vow_sara_ia","เียะ","sara ia","ia","A combined leading and above short ia form.","short ia"],
  ["vow_sara_iia","เีย","sara iia","iia","A leading mark with long i-style sign.","long ia"],
  ["vow_sara_uea","เือะ","sara uea","uea","Short uea combines leading and above signs.","short uea"],
  ["vow_sara_ueea","เือ","sara ueea","ueea","Long uea combines leading and long ue sign.","long uea"],
  ["vow_sara_ua","ัวะ","sara ua","ua","Short ua uses above-a plus wa-like tail.","short ua"],
  ["vow_sara_uua","ัว","sara uua","uua","Long ua keeps the above-a and wa-like tail.","long ua"],
  ["vow_sara_oe","เอะ","sara oe","oe","Short oe uses leading e plus final stop.","short oe"],
  ["vow_sara_oee","เอ","sara oee","oe/er","Long oe resembles e in simplified learning notation.","long oe"],
  ["vow_sara_aw","อ","sara aw","aw/or","Basin-like vowel carrier sound.","aw"],
  ["vow_ru","ฤ","ru","rue/ri","Special vocalic r sign.","vocalic r"],
  ["vow_lu","ฦ","lu","lue","Special vocalic l sign, rare.","vocalic l"]
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
