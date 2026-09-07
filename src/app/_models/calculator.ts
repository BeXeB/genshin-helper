/**
 * Material Calculator Models
 * Phase 1: Leveling and Ascension tracking
 */

export type CharacterProgressEntry = {
  characterId: number;
  currentLevel: number; // 1-90
  currentAscension: number; // 0-6
  goalLevel: number; // 1-90
  goalAscension: number; // 0-6
};

export type WeaponProgressEntry = {
  weaponId: number;
  currentLevel: number; // 1-90
  currentAscension: number; // 0-5 (weapons only go to 5)
  goalLevel: number; // 1-90
  goalAscension: number; // 0-5
};

export type CalculatorInventory = {
  characters: CharacterProgressEntry[];
  weapons: WeaponProgressEntry[];
  lastUpdated?: number; // timestamp
};

export type MaterialTotal = {
  materialId: number;
  materialName: string;
  quantity: number;
};

export type LevelingCost = {
  materials: MaterialTotal[];
  totalMora: number;
};
