import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  CalculatorInventory,
  CharacterProgressEntry,
  WeaponProgressEntry,
} from '../_models/calculator';
import { CalculatorStorageService } from './calculator-storage.service';

const EMPTY_INVENTORY: CalculatorInventory = {
  characters: [],
  weapons: [],
};

@Injectable({
  providedIn: 'root',
})
export class CalculatorStateService {
  private inventorySubject = new BehaviorSubject<CalculatorInventory>(
    EMPTY_INVENTORY,
  );
  public inventory$ = this.inventorySubject.asObservable();

  constructor(private storageService: CalculatorStorageService) {
    this.loadInventory();
  }

  /**
   * Load inventory from storage
   */
  private loadInventory(): void {
    const stored = this.storageService.loadInventory();
    if (stored) {
      this.inventorySubject.next(stored);
    }
  }

  /**
   * Get current inventory synchronously
   */
  getCurrentInventory(): CalculatorInventory {
    return this.inventorySubject.value;
  }

  /**
   * Calculate ascension phase from level
   * Phases: 0 (1-20), 1 (21-40), 2 (41-50), 3 (51-60), 4 (61-70), 5 (71-80), 6 (81-90)
   * Ascension caps at: 20, 40, 50, 60, 70, 80, 90
   */
  private getAscensionFromLevel(level: number): number {
    if (level <= 20) return 0;
    if (level <= 40) return 1;
    if (level <= 50) return 2;
    if (level <= 60) return 3;
    if (level <= 70) return 4;
    if (level <= 80) return 5;
    return 6;
  }

  /**
   * Add a character to the inventory
   */
  addCharacter(characterEntry: CharacterProgressEntry): void {
    const current = this.getCurrentInventory();
    // Avoid duplicates
    if (
      current.characters.some((c) => c.characterId === characterEntry.characterId)
    ) {
      console.warn(
        `Character with ID ${characterEntry.characterId} already in inventory`,
      );
      return;
    }
    // Automatically calculate ascensions based on levels
    const entryWithAscensions: CharacterProgressEntry = {
      ...characterEntry,
      currentAscension: this.getAscensionFromLevel(characterEntry.currentLevel),
      goalAscension: this.getAscensionFromLevel(characterEntry.goalLevel),
    };
    const updated: CalculatorInventory = {
      ...current,
      characters: [...current.characters, entryWithAscensions],
    };
    this.updateInventory(updated);
  }

  /**
   * Remove a character from inventory
   */
  removeCharacter(characterId: number): void {
    const current = this.getCurrentInventory();
    const updated: CalculatorInventory = {
      ...current,
      characters: current.characters.filter(
        (c) => c.characterId !== characterId,
      ),
    };
    this.updateInventory(updated);
  }

  /**
   * Update a character's progress
   */
  updateCharacterProgress(
    characterId: number,
    updates: Partial<CharacterProgressEntry>,
  ): void {
    const current = this.getCurrentInventory();
    const updated: CalculatorInventory = {
      ...current,
      characters: current.characters.map((c) => {
        if (c.characterId === characterId) {
          const merged = { ...c, ...updates };
          // Automatically calculate ascensions from levels
          return {
            ...merged,
            currentAscension: this.getAscensionFromLevel(merged.currentLevel),
            goalAscension: this.getAscensionFromLevel(merged.goalLevel),
          };
        }
        return c;
      }),
    };
    this.updateInventory(updated);
  }

  /**
   * Get a specific character from inventory
   */
  getCharacter(characterId: number): CharacterProgressEntry | undefined {
    return this.getCurrentInventory().characters.find(
      (c) => c.characterId === characterId,
    );
  }

  /**
   * Add a weapon to the inventory
   */
  addWeapon(weaponEntry: WeaponProgressEntry): void {
    const current = this.getCurrentInventory();
    // Avoid duplicates
    if (
      current.weapons.some((w) => w.weaponId === weaponEntry.weaponId)
    ) {
      console.warn(
        `Weapon with ID ${weaponEntry.weaponId} already in inventory`,
      );
      return;
    }
    const updated: CalculatorInventory = {
      ...current,
      weapons: [...current.weapons, weaponEntry],
    };
    this.updateInventory(updated);
  }

  /**
   * Remove a weapon from inventory
   */
  removeWeapon(weaponId: number): void {
    const current = this.getCurrentInventory();
    const updated: CalculatorInventory = {
      ...current,
      weapons: current.weapons.filter((w) => w.weaponId !== weaponId),
    };
    this.updateInventory(updated);
  }

  /**
   * Update a weapon's progress
   */
  updateWeaponProgress(
    weaponId: number,
    updates: Partial<WeaponProgressEntry>,
  ): void {
    const current = this.getCurrentInventory();
    const updated: CalculatorInventory = {
      ...current,
      weapons: current.weapons.map((w) =>
        w.weaponId === weaponId ? { ...w, ...updates } : w,
      ),
    };
    this.updateInventory(updated);
  }

  /**
   * Get a specific weapon from inventory
   */
  getWeapon(weaponId: number): WeaponProgressEntry | undefined {
    return this.getCurrentInventory().weapons.find(
      (w) => w.weaponId === weaponId,
    );
  }

  /**
   * Clear entire inventory
   */
  clearInventory(): void {
    this.updateInventory(EMPTY_INVENTORY);
    this.storageService.clearInventory();
  }

  /**
   * Internal method to update inventory and persist
   */
  private updateInventory(inventory: CalculatorInventory): void {
    this.inventorySubject.next(inventory);
    this.storageService.saveInventory(inventory);
  }
}
