import { Injectable } from '@angular/core';
import { CharacterProfile } from '../_models/character';
import { Weapon } from '../_models/weapons';
import { LevelingCost, MaterialTotal } from '../_models/calculator';

// ============================================================================
// CHARACTER LEVELING EXP COSTS (Level 2-90)
// ============================================================================
const CHARACTER_EXP_COSTS: Record<number, number> = {
  2: 1000, 3: 1325, 4: 1700, 5: 2150, 6: 2625, 7: 3150, 8: 3725, 9: 4350, 10: 5000,
  11: 5700, 12: 6450, 13: 7225, 14: 8050, 15: 8925, 16: 9825, 17: 10750, 18: 11725, 19: 12725, 20: 13775,
  21: 14875, 22: 16800, 23: 18000, 24: 19250, 25: 20550, 26: 21875, 27: 23250, 28: 24650, 29: 26100, 30: 27575,
  31: 29100, 32: 30650, 33: 32250, 34: 33875, 35: 35550, 36: 37250, 37: 38975, 38: 40750, 39: 42575, 40: 44425,
  41: 46300, 42: 50625, 43: 52700, 44: 54775, 45: 56900, 46: 59075, 47: 61275, 48: 63525, 49: 65800, 50: 68125,
  51: 70475, 52: 76500, 53: 79050, 54: 81650, 55: 84275, 56: 86950, 57: 89650, 58: 92400, 59: 95175, 60: 98000,
  61: 100875, 62: 108950, 63: 112050, 64: 115175, 65: 118325, 66: 121525, 67: 124775, 68: 128075, 69: 131400, 70: 134775,
  71: 138175, 72: 148700, 73: 152375, 74: 156075, 75: 159825, 76: 163600, 77: 167425, 78: 171300, 79: 175225, 80: 179175,
  81: 183175, 82: 216225, 83: 243025, 84: 273100, 85: 306800, 86: 344600, 87: 386950, 88: 434425, 89: 487625, 90: 547200,
};

// ============================================================================
// WEAPON LEVELING EXP COSTS (By Rarity: 1-5 stars)
// ============================================================================
const WEAPON_EXP_COSTS: Record<number, Record<number, number>> = {
  5: {
    2: 600, 3: 950, 4: 1350, 5: 1800, 6: 2325, 7: 2925, 8: 3525, 9: 4200, 10: 4950,
    11: 5700, 12: 6525, 13: 7400, 14: 8300, 15: 9225, 16: 10200, 17: 11250, 18: 12300, 19: 13425, 20: 14600,
    21: 15750, 22: 17850, 23: 19175, 24: 20550, 25: 21975, 26: 23450, 27: 24950, 28: 26475, 29: 28050, 30: 29675,
  },
  4: {
    2: 400, 3: 625, 4: 900, 5: 1200, 6: 1550, 7: 1950, 8: 2350, 9: 2800, 10: 3300,
    11: 3800, 12: 4350, 13: 4925, 14: 5525, 15: 6150, 16: 6800, 17: 7500, 18: 8200, 19: 8950, 20: 9725,
    21: 10500, 22: 11900, 23: 12775, 24: 13700, 25: 14650, 26: 15625, 27: 16625, 28: 17650, 29: 18700, 30: 19775,
  },
  3: {
    2: 275, 3: 425, 4: 600, 5: 800, 6: 1025, 7: 1275, 8: 1550, 9: 1850, 10: 2175,
    11: 2500, 12: 2875, 13: 3250, 14: 3650, 15: 4050, 16: 4500, 17: 4950, 18: 5400, 19: 5900, 20: 6425,
    21: 6925, 22: 7850, 23: 8425, 24: 9050, 25: 9675, 26: 10325, 27: 10975, 28: 11650, 29: 12350, 30: 13050,
  },
  2: {
    2: 175, 3: 275, 4: 400, 5: 550, 6: 700, 7: 875, 8: 1050, 9: 1250, 10: 1475,
    11: 1700, 12: 1950, 13: 2225, 14: 2475, 15: 2775, 16: 3050, 17: 3375, 18: 3700, 19: 4025, 20: 4375,
    21: 4725, 22: 5350, 23: 5750, 24: 6175, 25: 6600, 26: 7025, 27: 7475, 28: 7950, 29: 8425, 30: 8900,
  },
  1: {
    2: 125, 3: 200, 4: 275, 5: 350, 6: 475, 7: 575, 8: 700, 9: 850, 10: 1000,
    11: 1150, 12: 1300, 13: 1475, 14: 1650, 15: 1850, 16: 2050, 17: 2250, 18: 2450, 19: 2675, 20: 2925,
    21: 3150, 22: 3575, 23: 3825, 24: 4100, 25: 4400, 26: 4700, 27: 5000, 28: 5300, 29: 5600, 30: 5925,
  },
};

// ============================================================================
// ASCENSION CONFIGURATION
// ============================================================================
const ASCENSION_LEVEL_THRESHOLDS = {
  1: 6,
  2: 7,
  3: 8,
  4: 9,
} as const;

const CHARACTER_ASCENSION_MATERIAL_QUANTITIES = {
  1: 1, // Ascension 1 (threshold ≤6)
  2: 1, // Ascension 2 (threshold ≤7)
  3: 2, // Ascension 3 (threshold ≤8)
  4: 2, // Ascension 4 (threshold ≤9)
} as const;

// Mora costs for character ascension at each phase
const CHARACTER_ASCENSION_MORA_COSTS = {
  1: 20000,
  2: 40000,
  3: 60000,
  4: 80000,
  5: 100000,
  6: 120000,
} as const;

// Mora costs for weapon ascension at each phase
const WEAPON_ASCENSION_MORA_COSTS = {
  1: 5000,
  2: 15000,
  3: 30000,
  4: 45000,
  5: 60000,
} as const;

// Level caps for each ascension phase (max level achievable without next ascension)
const CHARACTER_ASCENSION_LEVEL_CAPS = {
  0: 20,
  1: 40,
  2: 50,
  3: 60,
  4: 70,
  5: 80,
  6: 90,
} as const;

@Injectable({
  providedIn: 'root',
})
export class MaterialCalculationService {
  constructor() {}

  /**
   * Calculate materials needed to level a character from currentLevel to targetLevel
   * Returns total EXP cost (to be converted to material quantities by caller)
   */
  calculateCharacterLevelingCost(
    currentLevel: number,
    targetLevel: number,
  ): number {
    if (currentLevel >= targetLevel || targetLevel < 2 || currentLevel < 1) {
      return 0;
    }

    let totalExp = 0;
    // Sum EXP costs for each level from currentLevel+1 to targetLevel
    for (let level = currentLevel + 1; level <= targetLevel; level++) {
      totalExp += CHARACTER_EXP_COSTS[level] || 0;
    }
    return totalExp;
  }

  /**
   * Calculate materials needed to ascend a character from currentAscension to targetAscension
   * at a specific target level. Returns mora cost and material details.
   */
  calculateCharacterAscensionCost(
    character: CharacterProfile,
    currentLevel: number,
    targetLevel: number,
    currentAscension: number,
    targetAscension: number,
  ): LevelingCost {
    const materials: MaterialTotal[] = [];
    let totalMora = 0;

    if (currentAscension >= targetAscension || !character.costs) {
      return { materials: [], totalMora: 0 };
    }

    // For each ascension level we need to achieve
    for (
      let ascLevel = currentAscension + 1;
      ascLevel <= targetAscension;
      ascLevel++
    ) {
      // Add mora cost for this ascension
      totalMora +=
        CHARACTER_ASCENSION_MORA_COSTS[ascLevel as keyof typeof CHARACTER_ASCENSION_MORA_COSTS] || 0;

      // Get ascension materials from character profile
      const ascensionKey = `ascend${ascLevel}` as keyof typeof character.costs;
      const ascensionItems = character.costs?.[ascensionKey];

      if (ascensionItems) {
        for (const item of ascensionItems) {
          // Skip mora (it's already counted)
          if (item.id === 202) continue;

          // Check if material already exists in array
          const existingMaterial = materials.find(
            (m) => m.materialId === item.id,
          );
          if (existingMaterial) {
            existingMaterial.quantity += item.count;
          } else {
            materials.push({
              materialId: item.id,
              materialName: item.name,
              quantity: item.count,
            });
          }
        }
      }
    }

    return { materials, totalMora };
  }

  /**
   * Calculate total materials (XP books + mora) needed for character leveling
   * Converts EXP to material quantities
   */
  convertLevelingExpToMaterials(totalExp: number): MaterialTotal[] {
    const materials: MaterialTotal[] = [];

    // Character EXP materials: Hero's Wit (20000 EXP), Adventurer's Experience (5000 EXP), Wanderer's Advice (1000 EXP)
    const HEROS_WIT_ID = 104003;
    const ADVENTURERS_EXP_ID = 104002;
    const WANDERERS_ADVICE_ID = 104001;

    let remainingExp = totalExp;

    // Prioritize higher-tier books
    const herosWitCount = Math.floor(remainingExp / 20000);
    if (herosWitCount > 0) {
      materials.push({
        materialId: HEROS_WIT_ID,
        materialName: "Hero's Wit",
        quantity: herosWitCount,
      });
      remainingExp -= herosWitCount * 20000;
    }

    const adventurersExpCount = Math.floor(remainingExp / 5000);
    if (adventurersExpCount > 0) {
      materials.push({
        materialId: ADVENTURERS_EXP_ID,
        materialName: "Adventurer's Experience",
        quantity: adventurersExpCount,
      });
      remainingExp -= adventurersExpCount * 5000;
    }

    const wanderersAdviceCount = Math.floor(remainingExp / 1000);
    if (wanderersAdviceCount > 0) {
      materials.push({
        materialId: WANDERERS_ADVICE_ID,
        materialName: "Wanderer's Advice",
        quantity: wanderersAdviceCount,
      });
      remainingExp -= wanderersAdviceCount * 1000;
    }

    return materials;
  }

  /**
   * Calculate weapons leveling cost
   */
  calculateWeaponLevelingCost(
    weapon: Weapon,
    currentLevel: number,
    targetLevel: number,
  ): number {
    if (currentLevel >= targetLevel || targetLevel < 2 || currentLevel < 1) {
      return 0;
    }

    const weaponRarity = weapon.rarity;
    const rarityExpTable = WEAPON_EXP_COSTS[weaponRarity];

    if (!rarityExpTable) {
      console.warn(`No EXP table for weapon rarity ${weaponRarity}`);
      return 0;
    }

    let totalExp = 0;
    for (let level = currentLevel + 1; level <= targetLevel; level++) {
      totalExp += rarityExpTable[level] || 0;
    }
    return totalExp;
  }

  /**
   * Calculate weapon ascension cost
   */
  calculateWeaponAscensionCost(
    weapon: Weapon,
    currentAscension: number,
    targetAscension: number,
  ): LevelingCost {
    const materials: MaterialTotal[] = [];
    let totalMora = 0;

    if (currentAscension >= targetAscension) {
      return { materials: [], totalMora: 0 };
    }

    // For each ascension level we need to achieve
    for (
      let ascLevel = currentAscension + 1;
      ascLevel <= targetAscension;
      ascLevel++
    ) {
      // Add mora cost for this ascension
      totalMora +=
        WEAPON_ASCENSION_MORA_COSTS[ascLevel as keyof typeof WEAPON_ASCENSION_MORA_COSTS] || 0;

      // Get ascension materials from weapon profile
      const ascensionKey = `ascend${ascLevel}` as keyof typeof weapon.costs;
      const ascensionItems = weapon.costs[ascensionKey];

      if (ascensionItems) {
        for (const item of ascensionItems) {
          // Skip mora (it's already counted)
          if (item.id === 202) continue;

          // Check if material already exists in array
          const existingMaterial = materials.find(
            (m) => m.materialId === item.id,
          );
          if (existingMaterial) {
            existingMaterial.quantity += item.count;
          } else {
            materials.push({
              materialId: item.id,
              materialName: item.name,
              quantity: item.count,
            });
          }
        }
      }
    }

    return { materials, totalMora };
  }

  /**
   * Convert weapon leveling EXP to material quantities
   */
  convertWeaponLevelingExpToMaterials(totalExp: number): MaterialTotal[] {
    const materials: MaterialTotal[] = [];

    // Weapon EXP materials: Mystic Enhancement Ore (10000 EXP), Fine Enhancement Ore (2000 EXP), Enhancement Ore (400 EXP)
    const MYSTIC_ORE_ID = 104013;
    const FINE_ORE_ID = 104012;
    const ENHANCEMENT_ORE_ID = 104011;

    let remainingExp = totalExp;

    // Prioritize higher-tier ores
    const mysticOreCount = Math.floor(remainingExp / 10000);
    if (mysticOreCount > 0) {
      materials.push({
        materialId: MYSTIC_ORE_ID,
        materialName: 'Mystic Enhancement Ore',
        quantity: mysticOreCount,
      });
      remainingExp -= mysticOreCount * 10000;
    }

    const fineOreCount = Math.floor(remainingExp / 2000);
    if (fineOreCount > 0) {
      materials.push({
        materialId: FINE_ORE_ID,
        materialName: 'Fine Enhancement Ore',
        quantity: fineOreCount,
      });
      remainingExp -= fineOreCount * 2000;
    }

    const enhancementOreCount = Math.floor(remainingExp / 400);
    if (enhancementOreCount > 0) {
      materials.push({
        materialId: ENHANCEMENT_ORE_ID,
        materialName: 'Enhancement Ore',
        quantity: enhancementOreCount,
      });
      remainingExp -= enhancementOreCount * 400;
    }

    return materials;
  }

  /**
   * Get all materials needed (XP + Ascension) for a character
   * Optimized to avoid XP overflow across ascension boundaries
   *
   * Strategy: For each ascension phase, level up to that phase's cap,
   * then ascend. This prevents wasting XP that would overflow.
   */
  calculateCharacterTotalCost(
    character: CharacterProfile,
    currentLevel: number,
    targetLevel: number,
    currentAscension: number,
    targetAscension: number,
  ): LevelingCost {
    const allMaterials: MaterialTotal[] = [];
    let totalMora = 0;

    // Validate inputs
    if (currentAscension >= targetAscension && currentLevel >= targetLevel) {
      return { materials: [], totalMora: 0 };
    }

    let currentLvl = currentLevel;
    let currentAsc = currentAscension;

    // Process each ascension phase from current to target
    for (let asc = currentAscension; asc <= targetAscension; asc++) {
      // Get the max level for this ascension phase
      const phaseCap: number = CHARACTER_ASCENSION_LEVEL_CAPS[asc as keyof typeof CHARACTER_ASCENSION_LEVEL_CAPS] || 90;

      // Determine target level for this phase
      let phaseTargetLevel: number = phaseCap;
      if (asc === targetAscension) {
        // Last phase - use the actual target level
        phaseTargetLevel = Math.min(targetLevel, phaseCap);
      }

      // Calculate XP needed for this phase
      if (currentLvl < phaseTargetLevel) {
        const phaseExp = this.calculateCharacterLevelingCost(currentLvl, phaseTargetLevel);
        const phaseMaterials = this.convertLevelingExpToMaterials(phaseExp);
        allMaterials.push(...phaseMaterials);

        // Add mora for leveling (not required in Genshin, but including for completeness)
        // totalMora += phaseExp * 0; // Leveling doesn't cost mora

        currentLvl = phaseTargetLevel;
      }

      // If we need to ascend to the next phase, calculate ascension cost
      if (asc < targetAscension) {
        const nextAsc = asc + 1;

        // Get ascension materials for this ascension
        const ascensionKey = `ascend${nextAsc}` as keyof typeof character.costs;
        const ascensionItems = character.costs?.[ascensionKey];

        if (ascensionItems) {
          for (const item of ascensionItems) {
            // Skip mora ID (202) - we'll add it separately
            if (item.id === 202) continue;

            const existingMaterial = allMaterials.find(
              (m) => m.materialId === item.id,
            );
            if (existingMaterial) {
              existingMaterial.quantity += item.count;
            } else {
              allMaterials.push({
                materialId: item.id,
                materialName: item.name,
                quantity: item.count,
              });
            }
          }
        }

        // Add mora cost for this ascension
        totalMora += CHARACTER_ASCENSION_MORA_COSTS[nextAsc as keyof typeof CHARACTER_ASCENSION_MORA_COSTS] || 0;

        currentAsc = nextAsc;
      }
    }

    // Consolidate materials (combine duplicates)
    const consolidatedMaterials = this.consolidateMaterials(allMaterials);

    return { materials: consolidatedMaterials, totalMora };
  }

  /**
   * Get all materials needed (XP + Ascension) for a weapon
   */
  calculateWeaponTotalCost(
    weapon: Weapon,
    currentLevel: number,
    targetLevel: number,
    currentAscension: number,
    targetAscension: number,
  ): LevelingCost {
    const allMaterials: MaterialTotal[] = [];
    let totalMora = 0;

    // Leveling cost (Enhancement Ore)
    const levelingExp = this.calculateWeaponLevelingCost(
      weapon,
      currentLevel,
      targetLevel,
    );
    const levelingMaterials = this.convertWeaponLevelingExpToMaterials(
      levelingExp,
    );
    allMaterials.push(...levelingMaterials);

    // Ascension cost
    const ascensionCost = this.calculateWeaponAscensionCost(
      weapon,
      currentAscension,
      targetAscension,
    );
    allMaterials.push(...ascensionCost.materials);
    totalMora += ascensionCost.totalMora;

    // Consolidate materials
    const consolidatedMaterials = this.consolidateMaterials(allMaterials);

    return { materials: consolidatedMaterials, totalMora };
  }

  /**
   * Combine duplicate materials (same materialId) into single entries
   */
  private consolidateMaterials(materials: MaterialTotal[]): MaterialTotal[] {
    const consolidated = new Map<number, MaterialTotal>();

    for (const material of materials) {
      const existing = consolidated.get(material.materialId);
      if (existing) {
        existing.quantity += material.quantity;
      } else {
        consolidated.set(material.materialId, { ...material });
      }
    }

    return Array.from(consolidated.values());
  }
}
