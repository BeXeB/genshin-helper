import { ElementType, QualityType, StatType, WeaponType } from './enum';
import { Item, ResolvedItem } from './items';

export type CharacterProfile = {
  id: number;
  name: string;
  normalizedName: string;

  title: string;
  description: string;

  weaponType: WeaponType;

  qualityType: QualityType;
  rarity: 1 | 2 | 3 | 4 | 5;

  birthdaymmdd: string;

  elementType: ElementType;

  affiliation: string;

  substatType: StatType;

  constellation: string;

  costs: Record<`ascend${1 | 2 | 3 | 4 | 5 | 6}`, Item[]>;

  images: {
    filename_icon?: string;
    filename_iconCard?: string;
    filename_sideIcon?: string;
    filename_gachaSplash?: string;
    filename_gachaSlice?: string;
  };

  sortId: number;

  isTraveler?: boolean;
};

export type CharacterTalents = {
  combat1: CombatTalent;
  combat2: CombatTalent;
  combat3: CombatTalent;

  passive1: PassiveTalent;
  passive2: PassiveTalent;
  passive3?: PassiveTalent;
  passive4?: PassiveTalent;

  costs: Record<`lvl${2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`, Item[]>;

  images?: {
    filename_combat1?: string;
    filename_combat2?: string;
    filename_combat3?: string;
    filename_passive1?: string;
    filename_passive2?: string;
    filename_passive3?: string;
    filename_passive4?: string;
  };
};

export type CombatTalent = {
  id: number;
  name: string;
  descriptionRaw: string;
  attributes: {
    labels: string[];
    parameters: Record<string, number[]>;
  };
};

export type PassiveTalent = {
  id: number;
  name: string;
  descriptionRaw: string;
};

export type CharacterStat = {
  level: number;
  ascension: number;
  hp?: number;
  attack?: number;
  defense?: number;
  specialized?: number;
};

export type CharacterStats = Record<string, CharacterStat>;

export type CharacterConstellation = {
  c1: ConstellationDetail;
  c2: ConstellationDetail;
  c3: ConstellationDetail;
  c4: ConstellationDetail;
  c5: ConstellationDetail;
  c6: ConstellationDetail;

  images: {
    filename_c1: string;
    filename_c2: string;
    filename_c3: string;
    filename_c4: string;
    filename_c5: string;
    filename_c6: string;
  };
};

export type ConstellationDetail = {
  id: number;
  name: string;
  descriptionRaw: string;
};

export type Character = {
  profile: CharacterProfile;
  skills?: CharacterTalents;
  stats: CharacterStats;
  constellation?: CharacterConstellation;

  variants?: Partial<Record<ElementType, CharacterVariant>>;
};

export type CharacterVariant = {
  skills: CharacterTalents;
  constellation: CharacterConstellation;
};

export type CharacterBriefDescriptions = {
  combat1: string;
  combat2: string;
  combat3: string;

  passive1: string;
  passive2: string;
  passive3?: string;
  passive4?: string;

  c1: string;
  c2: string;
  c3: string;
  c4: string;
  c5: string;
  c6: string;
};

export type CharacterProfileResolved = Omit<CharacterProfile, 'costs'> & {
  costs: Record<`ascend${1 | 2 | 3 | 4 | 5 | 6}`, ResolvedItem[]>;
};

export type CharacterTalentsResolved = Omit<CharacterTalents, 'costs'> & {
  costs: Record<`lvl${2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`, ResolvedItem[]>;
};

export type CharacterResolved = Omit<
  Character,
  'profile' | 'skills' | 'variants'
> & {
  profile: CharacterProfileResolved;
  skills?: CharacterTalentsResolved;
  brief?: CharacterBriefDescriptions;

  variants?: Partial<Record<ElementType, CharacterVariantResolved>>;
};

export type CharacterVariantResolved = {
  skills: CharacterTalentsResolved;
  constellation: CharacterConstellation;
  brief?: CharacterBriefDescriptions;
};
