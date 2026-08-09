import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CharacterTabStateService {
  private readonly STORAGE_KEY = 'characterTabState';

  /**
   * Get the saved tab for a character, or return default 'profile'
   */
  getTabForCharacter(characterId: string): 'profile' | 'talents' | 'constellations' {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (!stored) return 'profile';

    try {
      const tabState = JSON.parse(stored) as Record<string, string>;
      return (tabState[characterId] ?? 'profile') as 'profile' | 'talents' | 'constellations';
    } catch {
      return 'profile';
    }
  }

  /**
   * Save the selected tab for a character
   */
  setTabForCharacter(
    characterId: string,
    tab: 'profile' | 'talents' | 'constellations',
  ): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      const tabState = stored ? JSON.parse(stored) : {};
      tabState[characterId] = tab;
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(tabState));
    } catch (error) {
      console.error('Error saving character tab state:', error);
    }
  }

  /**
   * Clear all stored tab states
   */
  clearAll(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing character tab state:', error);
    }
  }
}
