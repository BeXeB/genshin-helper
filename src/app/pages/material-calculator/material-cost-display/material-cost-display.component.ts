import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LevelingCost } from '../../../_models/calculator';
import { MaterialService } from '../../../_services/material.service';
import { Material } from '../../../_models/materials';

@Component({
  selector: 'app-material-cost-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './material-cost-display.component.html',
  styleUrl: './material-cost-display.component.css',
})
export class MaterialCostDisplayComponent implements OnInit {
  @Input() cost: LevelingCost | null = null;
  @Input() characterName: string = '';

  private materialMap: Map<number, Material> = new Map();

  constructor(private materialService: MaterialService) {}

  ngOnInit(): void {
    // Load all materials and build ID->Material map for fast lookups
    this.materialService.getMaterials().subscribe((materials) => {
      materials.forEach((material) => {
        this.materialMap.set(material.id, material);
      });
    });
  }

  /**
   * Format mora display
   */
  formatMora(amount: number): string {
    return amount.toLocaleString();
  }

  /**
   * Get material image path based on material type
   * Uses MaterialService lookup for optimal type-based folder mapping
   */
  getMaterialImagePath(materialId: number, materialName: string): string {
    // Try to get material from loaded materials map
    const material = this.materialMap.get(materialId);
    if (material) {
      const folder = material.type; // MaterialType enum values ARE the folder names
      const filename = material.normalizedName; // Use normalizedName (e.g., "heroswit") not filename_icon (e.g., "UI_ItemIcon_104003")
      return `assets/images/materials/${folder}/${filename}.webp`;
    }

    // Fallback: normalize name and guess folder based on ID
    const normalized = materialName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '');

    // Mora special case
    if (materialId === 202) {
      return 'assets/images/materials/xp-and-mora/mora.webp';
    }

    // Try to determine folder from ID ranges as fallback
    if (materialId >= 104100 && materialId <= 104199) {
      return `assets/images/materials/gemstone/${normalized}.webp`;
    }
    if (materialId >= 101200 && materialId <= 101299) {
      return `assets/images/materials/local-specialty/${normalized}.webp`;
    }
    if (materialId >= 106000 && materialId <= 106999) {
      return `assets/images/materials/talent/${normalized}.webp`;
    }
    if ((materialId >= 102000 && materialId <= 102999) ||
        (materialId >= 112000 && materialId <= 112999)) {
      return `assets/images/materials/generic/${normalized}.webp`;
    }
    if (materialId >= 113000 && materialId <= 113999) {
      return `assets/images/materials/boss/${normalized}.webp`;
    }

    // Default fallback
    return `assets/images/materials/generic/${normalized}.webp`;
  }

  /**
   * Check if material is an EXP book (for special styling)
   */
  isExpBook(materialId: number): boolean {
    return [104001, 104002, 104003].includes(materialId);
  }

  /**
   * Check if material is enhancement ore (for special styling)
   */
  isEnhancementOre(materialId: number): boolean {
    return [104011, 104012, 104013].includes(materialId);
  }
}
