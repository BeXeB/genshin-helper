import { Injectable } from '@angular/core';
import { CalculatorInventory } from '../_models/calculator';
import { StorageService } from './storage.service';

const CALCULATOR_STORAGE_KEY = 'material-calculator-inventory';

@Injectable({
  providedIn: 'root',
})
export class CalculatorStorageService {
  constructor(private storageService: StorageService) {}

  /**
   * Save the calculator inventory to localStorage
   */
  saveInventory(inventory: CalculatorInventory): void {
    const inventoryWithTimestamp: CalculatorInventory = {
      ...inventory,
      lastUpdated: Date.now(),
    };
    this.storageService.saveData(CALCULATOR_STORAGE_KEY, inventoryWithTimestamp);
  }

  /**
   * Load the calculator inventory from localStorage
   */
  loadInventory(): CalculatorInventory | null {
    const inventory = this.storageService.getData<CalculatorInventory>(
      CALCULATOR_STORAGE_KEY,
    );
    return inventory;
  }

  /**
   * Clear the calculator inventory from localStorage
   */
  clearInventory(): void {
    localStorage.removeItem(CALCULATOR_STORAGE_KEY);
  }

  /**
   * Check if an inventory exists in storage
   */
  hasInventory(): boolean {
    return this.loadInventory() !== null;
  }

  /**
   * Get the last updated timestamp of the inventory
   */
  getLastUpdatedTime(): number | null {
    const inventory = this.loadInventory();
    return inventory?.lastUpdated || null;
  }
}
