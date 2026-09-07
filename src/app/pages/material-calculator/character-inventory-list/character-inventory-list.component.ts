import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterProfile } from '../../../_models/character';
import { CalculatorInventory, CharacterProgressEntry } from '../../../_models/calculator';

@Component({
  selector: 'app-character-inventory-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-inventory-list.component.html',
  styleUrl: './character-inventory-list.component.css',
})
export class CharacterInventoryListComponent {
  @Input() characters: CharacterProfile[] | null = null;
  @Input() inventory: CalculatorInventory | null = null;
  @Input() selectedCharacterId: number | null = null;
  @Output() characterSelected = new EventEmitter<CharacterProgressEntry>();
  @Output() addCharacter = new EventEmitter<number>();
  @Output() removeCharacter = new EventEmitter<number>();

  showAddCharacterDropdown = false;

  /**
   * Get characters that are NOT in the inventory
   */
  getAvailableCharacters(): CharacterProfile[] {
    if (!this.characters || !this.inventory) return this.characters || [];
    const inventoryIds = new Set(this.inventory.characters.map((c) => c.characterId));
    return this.characters.filter((c) => !inventoryIds.has(c.id));
  }

  /**
   * Handle character selection
   */
  selectCharacter(progress: CharacterProgressEntry): void {
    this.characterSelected.emit(progress);
  }

  /**
   * Handle adding a new character
   */
  handleAddCharacter(characterId: number): void {
    this.addCharacter.emit(characterId);
    this.showAddCharacterDropdown = false;
  }

  /**
   * Handle removing a character
   */
  handleRemoveCharacter(characterId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Remove this character from inventory?')) {
      this.removeCharacter.emit(characterId);
    }
  }

  /**
   * Toggle the add character dropdown
   */
  toggleAddDropdown(): void {
    this.showAddCharacterDropdown = !this.showAddCharacterDropdown;
  }

  /**
   * Get character profile by ID
   */
  getCharacterProfile(characterId: number): CharacterProfile | undefined {
    return this.characters?.find((c) => c.id === characterId);
  }
}
