import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HyperlinkService } from '../../_services/hyperlink.service';
import { HyperlinkInsertionService } from '../../_services/hyperlink-insertion.service';
import { ModalService } from '../../_services/modal.service';
import { Hyperlink } from '../../_models/hyperlinks';

interface HyperlinkWithType extends Hyperlink {
  type: 'game' | 'custom';
}

@Component({
  selector: 'app-hyperlink-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hyperlink-editor.component.html',
  styleUrl: './hyperlink-editor.component.css',
})
export class HyperlinkEditorComponent implements OnInit {
  activeTab: 'browse' | 'create' = 'browse';

  // Browse tab
  searchQuery: string = '';
  hyperlinks: HyperlinkWithType[] = [];
  filteredHyperlinks: HyperlinkWithType[] = [];
  selectedHyperlink: HyperlinkWithType | null = null;

  // Create tab
  newHyperlinkId: string = '';
  newHyperlinkName: string = '';
  newHyperlinkDescription: string = '';
  createError: string = '';

  selectedForInsert: HyperlinkWithType | null = null;

  constructor(
    private hyperlinkService: HyperlinkService,
    private insertionService: HyperlinkInsertionService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.loadHyperlinks();
  }

  loadHyperlinks(): void {
    this.hyperlinkService.getHyperlinksMap().subscribe((map) => {
      const links: HyperlinkWithType[] = [];

      map.forEach((link, key) => {
        // Only show custom hyperlinks, not game ones
        if (link.isCustom) {
          links.push({ ...link, type: 'custom' });
        }
      });

      this.hyperlinks = links.sort((a, b) => {
        // Alphabetical by name
        return (a.name || '').localeCompare(b.name || '');
      });

      this.filterHyperlinks();
    });
  }

  filterHyperlinks(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredHyperlinks = this.hyperlinks.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        String(h.id).includes(query)
    );
  }

  onSearchChange(): void {
    this.filterHyperlinks();
    this.selectedHyperlink = null;
  }

  selectHyperlink(hyperlink: HyperlinkWithType): void {
    this.selectedHyperlink = hyperlink;
  }

  onCreateTabClick(): void {
    this.activeTab = 'create';
    this.newHyperlinkId = '';
    this.newHyperlinkName = '';
    this.newHyperlinkDescription = '';
    this.createError = '';
  }

  validateNewHyperlink(): boolean {
    this.createError = '';

    if (!this.newHyperlinkId.trim()) {
      this.createError = 'ID is required';
      return false;
    }

    if (!this.newHyperlinkId.match(/^[a-z0-9\-]+$/)) {
      this.createError = 'ID must contain only lowercase letters, numbers, and hyphens';
      return false;
    }

    if (!this.newHyperlinkName.trim()) {
      this.createError = 'Name is required';
      return false;
    }

    if (!this.newHyperlinkDescription.trim()) {
      this.createError = 'Description is required';
      return false;
    }

    // Check if ID already exists
    if (this.hyperlinks.some((h) => h.id === this.newHyperlinkId)) {
      this.createError = 'This ID already exists';
      return false;
    }

    return true;
  }

  createNewHyperlink(): void {
    if (!this.validateNewHyperlink()) {
      return;
    }

    const newHyperlink: HyperlinkWithType = {
      id: this.newHyperlinkId,
      name: this.newHyperlinkName,
      description: this.newHyperlinkDescription,
      isCustom: true,
      type: 'custom',
    };

    // Add to service (makes it available for search and export)
    this.hyperlinkService.addCustomHyperlink(newHyperlink);

    // Add to local list and reload
    this.hyperlinks.push(newHyperlink);
    this.hyperlinks.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'custom' ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    this.filterHyperlinks();

    this.selectedForInsert = newHyperlink;
    this.insertionService.insertHyperlink(newHyperlink.id, undefined, 'C');

    // Clear form for next entry
    this.newHyperlinkId = '';
    this.newHyperlinkName = '';
    this.newHyperlinkDescription = '';
    this.createError = '';
  }

  insertLink(hyperlink: HyperlinkWithType): void {
    this.selectedForInsert = hyperlink;
    this.insertionService.insertHyperlink(hyperlink.id, undefined, 'C');
  }

  insertQuickLink(talentKey: string): void {
    // Insert type 'Z' link for talent field with character name
    // Format: character-field (e.g., 'mavuika-combat1')
    const characterName = this.insertionService.currentCharacterName;
    if (!characterName) {
      console.warn('No character context for quick link');
      return;
    }
    const linkId = `${characterName}-${talentKey}`;
    this.insertionService.insertHyperlink(linkId, undefined, 'Z');
  }

  getDisplayId(hyperlink: HyperlinkWithType): string {
    if (typeof hyperlink.id === 'number') {
      return `${hyperlink.id}`;
    }
    return hyperlink.id as string;
  }

  getTypeLabel(type: 'game' | 'custom'): string {
    return type === 'game' ? 'Game' : 'Custom';
  }
}
