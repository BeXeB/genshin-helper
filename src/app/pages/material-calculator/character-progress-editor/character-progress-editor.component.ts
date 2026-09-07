import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterProgressEntry } from '../../../_models/calculator';

@Component({
  selector: 'app-character-progress-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-progress-editor.component.html',
  styleUrl: './character-progress-editor.component.css',
})
export class CharacterProgressEditorComponent {
  @Input() characterProgress: CharacterProgressEntry | null = null;
  @Output() progressUpdated = new EventEmitter<Partial<CharacterProgressEntry>>();

  // Array of levels with ascension caps included
  // E.g. [1, 2, ..., 20, "20+", 21, 22, ..., 40, "40+", ...]
  levelOptions = this.generateLevelOptions();

  /**
   * Generate level options including ascension caps
   */
  private generateLevelOptions(): (number | string)[] {
    const options: (number | string)[] = [];
    const ascensionCaps = [20, 40, 50, 60, 70, 80];

    for (let i = 1; i <= 90; i++) {
      options.push(i);
      // Add ascension cap label after each cap level
      if (ascensionCaps.includes(i) && i < 90) {
        options.push(`${i}+`);
      }
    }
    return options;
  }

  /**
   * Parse level from dropdown value (handles "20+" format)
   */
  private parseLevel(value: string): number {
    // Remove '+' if present to get the base level
    const level = parseInt(value.replace('+', ''), 10);
    return isNaN(level) ? 1 : level;
  }

  /**
   * Get ascension phase based on level
   * Phases: 0 (1-20), 1 (21-40), 2 (41-50), 3 (51-60), 4 (61-70), 5 (71-80), 6 (81-90)
   */
  getAscensionPhase(level: number): number {
    if (level <= 20) return 0;
    if (level <= 40) return 1;
    if (level <= 50) return 2;
    if (level <= 60) return 3;
    if (level <= 70) return 4;
    if (level <= 80) return 5;
    return 6;
  }

  /**
   * Get ascension label (e.g., "20+", "40+", "50+", "60+", "70+", "80+")
   */
  getAscensionLabel(level: number): string {
    if (level <= 20) return 'Asc 0';
    if (level <= 40) return '20+';
    if (level <= 50) return '40+';
    if (level <= 60) return '50+';
    if (level <= 70) return '60+';
    if (level <= 80) return '70+';
    return '80+';
  }

  /**
   * Handle current level change from dropdown
   */
  onCurrentLevelChange(value: string): void {
    const level = this.parseLevel(value);

    let goalLevel = this.characterProgress?.goalLevel ?? level;
    if (goalLevel < level) {
      goalLevel = level;
    }
    this.progressUpdated.emit({
      currentLevel: level,
      goalLevel,
    });
  }

  /**
   * Handle goal level change from dropdown
   */
  onGoalLevelChange(value: string): void {
    const level = this.parseLevel(value);

    const currentLevel = this.characterProgress?.currentLevel ?? 1;
    const validLevel = Math.max(currentLevel, level);
    this.progressUpdated.emit({ goalLevel: validLevel });
  }
}
