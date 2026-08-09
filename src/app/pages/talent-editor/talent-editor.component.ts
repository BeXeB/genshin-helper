import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CharacterService } from '../../_services/character.service';
import { ImageService } from '../../_services/image.service';
import { ModalService } from '../../_services/modal.service';
import { HyperlinkInsertionService } from '../../_services/hyperlink-insertion.service';
import { HyperlinkService } from '../../_services/hyperlink.service';
import { EditorHistoryService } from '../../_services/editor-history.service';
import { TalentEditorStateService } from '../../_services/talent-editor-state.service';
import { ElementType, ElementTypeLabel } from '../../_models/enum';
import {
  Character,
  CharacterBriefDescriptions,
  CharacterProfile,
  CombatTalent,
  PassiveTalent,
  ConstellationDetail,
} from '../../_models/character';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormattedTextComponent } from '../../_components/formatted-text-component/formatted-text.component';
import { FormattedTextEditorComponent, HyperlinkRequest } from '../../_components/formatted-text-editor/formatted-text-editor.component';
import { HyperlinkEditorComponent } from '../../_components/hyperlink-editor/hyperlink-editor.component';

type TalentRow = {
  key: keyof CharacterBriefDescriptions;
  talent: CombatTalent | PassiveTalent | ConstellationDetail;
  section: string;
};

type ColorPreset = {
  label: string;
  color: string;
  element?: ElementType;
};

@Component({
  selector: 'app-talent-editor',
  imports: [CommonModule, FormsModule, PageTitleComponent, FormattedTextComponent, FormattedTextEditorComponent],
  templateUrl: './talent-editor.component.html',
  styleUrl: './talent-editor.component.css',
})
export class TalentEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private characterSerivce: CharacterService,
    private imageService: ImageService,
    private modalService: ModalService,
    private insertionService: HyperlinkInsertionService,
    private hyperlinkService: HyperlinkService,
    private historyService: EditorHistoryService,
    private stateService: TalentEditorStateService,
    private router: Router,
  ) {}

  @ViewChildren('sectionBtnEl') sectionBtnEls!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChildren('talentBtnEl') talentBtnEls!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('hyperlink-editor') hyperlinkEditor?: HyperlinkEditorComponent;

  characters: CharacterProfile[] = [];

  search: string = '';
  showDropdown = false;

  selectedCharacter: CharacterProfile | null = null;
  selectedCharacterDetails: Character | null = null;
  selectedTalentKey: keyof CharacterBriefDescriptions | null = null;
  selectedSection: string | null = null;
  selectedElement: ElementType | null = null;

  briefDrafts: Partial<CharacterBriefDescriptions> = {};

  // Debounce timer for editor changes
  private editorChangeDebounceTimer: any = null;

  colorPresets: ColorPreset[] = [
    { label: 'Kiemelés', color: '#FFD780FF' },
    { label: 'Anemo', color: '#80FFD7FF', element: ElementType.ANEMO },
    { label: 'Cryo', color: '#99FFFFFF', element: ElementType.CRYO },
    { label: 'Dendro', color: '#99FF88FF', element: ElementType.DENDRO },
    { label: 'Electro', color: '#FFACFFFF', element: ElementType.ELECTRO },
    { label: 'Geo', color: '#FFE699FF', element: ElementType.GEO },
    { label: 'Hydro', color: '#80C0FFFF', element: ElementType.HYDRO },
    { label: 'Pyro', color: '#FF9999FF', element: ElementType.PYRO },
  ];

  // Hyperlink insertion tracking
  private currentTalentKey: keyof CharacterBriefDescriptions | null = null;
  private currentHyperlinkRequest: HyperlinkRequest | null = null;
  private insertionSubscription?: Subscription;

  ngOnInit(): void {
    try {
      this.characterSerivce
        .getCharacters()
        .subscribe((data: CharacterProfile[]) => {
          this.characters = data.sort((b, a) => a.sortId - b.sortId);

          // Try to restore state after characters are loaded
          this.restoreState();
        });

      // Subscribe to hyperlink insertions
      this.insertionSubscription = this.insertionService.insertion$.subscribe((event) => {
        this.insertHyperlink(event.id, event.displayText, event.type);
      });
    } catch (error) {
      console.error('Error in talent editor ngOnInit:', error);
      this.handleError();
    }
  }

  private restoreState(): void {
    const state = this.stateService.getState();

    // Validate the stored character still exists
    if (!this.stateService.validateState(this.characters.map(c => c.normalizedName))) {
      // Invalid state, clear and proceed with defaults
      this.stateService.clearAll();
      return;
    }

    // Restore character selection
    if (state.selectedCharacterId) {
      const character = this.characters.find(c => c.normalizedName === state.selectedCharacterId);
      if (character) {
        // Load character details
        this.selectedCharacter = character;
        this.search = character.name;

        this.characterSerivce
          .getCharacterDetails(character.normalizedName)
          .subscribe((details: Character) => {
            this.selectedCharacterDetails = details;

            // Restore element selection if available
            if (state.selectedElement) {
              const variantElements = this.getVariantElements();
              if (variantElements.includes(state.selectedElement)) {
                this.selectedElement = state.selectedElement;
              }
            } else {
              const variantElements = this.getVariantElements();
              if (variantElements.length > 0) {
                this.selectedElement = variantElements[0];
              }
            }
          });

        // Restore draft descriptions
        this.characterSerivce
          .getBriefDescriptions(character.normalizedName)
          .subscribe((data) => {
            this.briefDrafts = { ...data };

            // Overlay edited descriptions from storage
            if (state.selectedCharacterId) {
              const allKeys: (keyof CharacterBriefDescriptions)[] = [
                'combat1', 'combat2', 'combat3',
                'passive1', 'passive2', 'passive3', 'passive4',
                'c1', 'c2', 'c3', 'c4', 'c5', 'c6'
              ];
              for (const key of allKeys) {
                const edited = this.stateService.getEditedDescription(key);
                if (edited !== undefined) {
                  this.briefDrafts[key] = edited;
                }
              }
            }

            this.historyService.clearAll();
          });

        // Restore section and talent selection
        if (state.selectedSection) {
          this.selectedSection = state.selectedSection;
          if (state.selectedTalentKey) {
            this.selectedTalentKey = state.selectedTalentKey;
          }
        } else {
          // Set defaults
          const firstSection = this.talentSections[0];
          if (firstSection) {
            this.selectedSection = firstSection.label;
            const firstRow = firstSection.rows[0];
            if (firstRow) {
              this.selectedTalentKey = firstRow.key;
            }
          }
        }
      }
    }
  }

  private handleError(): void {
    console.error('Talent editor encountered an error, clearing state and redirecting');
    this.stateService.clearAll();
    this.router.navigate(['/']);
  }

  ngAfterViewInit(): void {
    this.sectionBtnEls.changes.subscribe(() => this.equalizeButtonWidths(this.sectionBtnEls));
    this.talentBtnEls.changes.subscribe(() => this.equalizeButtonWidths(this.talentBtnEls));
  }

  ngOnDestroy(): void {
    this.insertionSubscription?.unsubscribe();
  }

  // Makes every button in the given group as wide as the widest one, so the
  // buttons stay compact when short (e.g. "C1") but grow when needed (e.g.
  // "Elemental Skill"), while remaining uniform within their own group.
  private equalizeButtonWidths(list: QueryList<ElementRef<HTMLButtonElement>>): void {
    const buttons = list.map((ref) => ref.nativeElement);
    if (buttons.length === 0) return;

    for (const btn of buttons) {
      btn.style.width = 'auto';
    }

    const maxWidth = Math.max(...buttons.map((btn) => btn.offsetWidth));

    for (const btn of buttons) {
      btn.style.width = `${maxWidth}px`;
    }
  }

  get filteredCharacters(): CharacterProfile[] {
    const search = this.search.trim().toLowerCase();

    if (!search) return this.characters;

    return this.characters.filter((char) => {
      const name = char.name.toLowerCase();
      const normalizedName = char.normalizedName.toLowerCase();

      return name.includes(search) || normalizedName.includes(search);
    });
  }

  selectCharacter(profile: CharacterProfile) {
    try {
      this.selectedCharacter = profile;
      this.search = profile.name;
      this.showDropdown = false;
      this.briefDrafts = {};
      this.selectedTalentKey = null;
      this.selectedSection = null;
      this.selectedElement = null;

      // Clear any debounce timer
      if (this.editorChangeDebounceTimer) {
        clearTimeout(this.editorChangeDebounceTimer);
      }

      // Clear previous character's state and start fresh
      this.stateService.clearAll();

      this.characterSerivce
        .getCharacterDetails(profile.normalizedName)
        .subscribe((details: Character) => {
          this.selectedCharacterDetails = details;

          // Initialize element selection for characters with variants
          const variantElements = this.getVariantElements();
          if (variantElements.length > 0) {
            this.selectedElement = variantElements[0];
          }

          // Set first section and talent as selected
          const firstSection = this.talentSections[0];
          if (firstSection) {
            this.selectedSection = firstSection.label;
            const firstRow = firstSection.rows[0];
            if (firstRow) {
              this.selectedTalentKey = firstRow.key;
            }
          }

          // Save state
          this.saveState();
        });

      this.characterSerivce
        .getBriefDescriptions(profile.normalizedName)
        .subscribe((data) => {
          this.briefDrafts = { ...data };
          // Clear history for all fields when loading new character
          this.historyService.clearAll();
        });
    } catch (error) {
      console.error('Error selecting character:', error);
      this.handleError();
    }
  }

  private saveState(): void {
    if (this.selectedCharacter) {
      this.stateService.saveCharacterSelection(
        this.selectedCharacter.normalizedName,
        this.selectedSection,
        this.selectedTalentKey,
        this.selectedElement,
      );
    }
  }

  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }

  getCharacterIcon(apiKey: string): string {
    return this.imageService.getCharacterIcon(apiKey);
  }

  getElementIcon(element: ElementType): string {
    return this.imageService.getElementIcon(element);
  }

  // Mask-based coloring (like the toolbar color presets) so the icon itself is tinted.
  getElementIconStyle(element: ElementType): Record<string, string> {
    const iconUrl = this.imageService.getElementIcon(element);
    const elementName = ElementTypeLabel[element].toLowerCase();
    const backgroundColor = `var(--${elementName})`;

    return {
      'background-color': backgroundColor,
      'mask-image': `url(${iconUrl})`,
      '-webkit-mask-image': `url(${iconUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }

  getVariantElements(): ElementType[] {
    if (!this.selectedCharacterDetails?.variants) {
      return [];
    }
    return Object.keys(this.selectedCharacterDetails.variants) as ElementType[];
  }

  selectElement(element: ElementType) {
    this.selectedElement = element;
    this.selectedTalentKey = null;
    this.selectedSection = null;

    // Set first section and talent as selected for new element
    const firstSection = this.talentSections[0];
    if (firstSection) {
      this.selectedSection = firstSection.label;
      const firstRow = firstSection.rows[0];
      if (firstRow) {
        this.selectedTalentKey = firstRow.key;
      }
    }

    // Save state
    this.saveState();
  }

  get talentSections(): { label: string; rows: TalentRow[] }[] {
    const sections: { label: string; rows: TalentRow[] }[] = [];

    // Use variant data if available and selected
    let skills = this.selectedCharacterDetails?.skills;
    let constellation = this.selectedCharacterDetails?.constellation;

    if (this.selectedElement && this.selectedCharacterDetails?.variants) {
      const variant = this.selectedCharacterDetails.variants[this.selectedElement];
      if (variant) {
        skills = variant.skills;
        constellation = variant.constellation;
      }
    }

    if (skills) {
      sections.push({
        label: 'Skillek',
        rows: [
          { key: 'combat1', talent: skills.combat1, section: 'Skillek' },
          { key: 'combat2', talent: skills.combat2, section: 'Skillek' },
          { key: 'combat3', talent: skills.combat3, section: 'Skillek' },
        ],
      });

      const passiveRows: TalentRow[] = [
        { key: 'passive1', talent: skills.passive1, section: 'Passzívok' },
        { key: 'passive2', talent: skills.passive2, section: 'Passzívok' },
      ];
      if (skills.passive3)
        passiveRows.push({ key: 'passive3', talent: skills.passive3, section: 'Passzívok' });
      if (skills.passive4)
        passiveRows.push({ key: 'passive4', talent: skills.passive4, section: 'Passzívok' });

      sections.push({ label: 'Passzívok', rows: passiveRows });
    }

    if (constellation) {
      sections.push({
        label: 'Konstellációk',
        rows: [
          { key: 'c1', talent: constellation.c1, section: 'Konstellációk' },
          { key: 'c2', talent: constellation.c2, section: 'Konstellációk' },
          { key: 'c3', talent: constellation.c3, section: 'Konstellációk' },
          { key: 'c4', talent: constellation.c4, section: 'Konstellációk' },
          { key: 'c5', talent: constellation.c5, section: 'Konstellációk' },
          { key: 'c6', talent: constellation.c6, section: 'Konstellációk' },
        ],
      });
    }

    return sections;
  }

  getAllTalentRows(): TalentRow[] {
    const rows: TalentRow[] = [];
    for (const section of this.talentSections) {
      rows.push(...section.rows);
    }
    return rows;
  }

  getTalentTabLabel(row: TalentRow): string {
    const labelMap: Record<keyof CharacterBriefDescriptions, string> = {
      combat1: 'Normal Attack',
      combat2: 'Elemental Skill',
      combat3: 'Elemental Burst',
      passive1: 'P1',
      passive2: 'P2',
      passive3: 'P3',
      passive4: 'P4',
      c1: 'C1',
      c2: 'C2',
      c3: 'C3',
      c4: 'C4',
      c5: 'C5',
      c6: 'C6',
    };
    return labelMap[row.key] || row.talent.name;
  }

  getSelectedTalent(): TalentRow | null {
    if (!this.selectedTalentKey) return null;
    return this.getAllTalentRows().find(row => row.key === this.selectedTalentKey) || null;
  }

  selectTalent(key: keyof CharacterBriefDescriptions) {
    this.selectedTalentKey = key;
    // Update selected section based on talent
    for (const section of this.talentSections) {
      if (section.rows.some(row => row.key === key)) {
        this.selectedSection = section.label;
        break;
      }
    }
    // Save state
    this.saveState();
  }

  selectSection(sectionLabel: string) {
    this.selectedSection = sectionLabel;
    // Select first talent in the section
    const section = this.talentSections.find(s => s.label === sectionLabel);
    if (section && section.rows.length > 0) {
      this.selectedTalentKey = section.rows[0].key;
    }
    // Save state
    this.saveState();
  }

  getCurrentSection(): { label: string; rows: TalentRow[] } | null {
    return this.talentSections.find(s => s.label === this.selectedSection) || null;
  }

  exportBriefDescriptionJson() {
    try {
      if (!this.selectedCharacter) return;

      const result: Partial<CharacterBriefDescriptions> = {};

      for (const section of this.talentSections) {
        for (const row of section.rows) {
          const value = this.briefDrafts[row.key]?.trim();
          if (value) {
            result[row.key] = value;
          }
        }
      }

      // Download brief descriptions
      const json = JSON.stringify(result, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.selectedCharacter.normalizedName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Download custom hyperlinks
      this.hyperlinkService.getHyperlinksMap().subscribe((map) => {
        const hyperlinks: any[] = [];
        map.forEach((link) => {
          if (link.isCustom) {
            hyperlinks.push(link);
          }
        });

        const json = JSON.stringify(hyperlinks, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-hyperlinks.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });

      // Clear state after successful download (signal: done with this character)
      this.stateService.clearAll();
    } catch (error) {
      console.error('Error exporting brief descriptions:', error);
      this.handleError();
    }
  }

  getPresetIconStyle(preset: ColorPreset): Record<string, string> {
    if (!preset.element) {
      return {};
    }

    const iconUrl = this.imageService.getElementIcon(preset.element);
    const elementName = ElementTypeLabel[preset.element].toLowerCase();
    const backgroundColor = `var(--${elementName})`;

    return {
      'background-color': backgroundColor,
      'mask-image': `url(${iconUrl})`,
      '-webkit-mask-image': `url(${iconUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }

  openHyperlinkModal(
    key: keyof CharacterBriefDescriptions,
  ) {
    this.currentTalentKey = key;
    this.modalService.open('hyperlink-editor');
  }

  onEditorTextChange(key: keyof CharacterBriefDescriptions, newText: string): void {
    this.briefDrafts[key] = newText;

    // Debounce saving edited description to state service (300ms)
    if (this.editorChangeDebounceTimer) {
      clearTimeout(this.editorChangeDebounceTimer);
    }

    this.editorChangeDebounceTimer = setTimeout(() => {
      // Only save if this is actually edited (not using original from JSON)
      // Delta approach: only store if edited
      if (newText && newText.trim().length > 0) {
        this.stateService.saveEditedDescription(key, newText);
      } else {
        // If empty, remove from storage (use original from JSON)
        this.stateService.saveEditedDescription(key, '');
      }
    }, 300);
  }

  onEditorHyperlinkRequested(key: keyof CharacterBriefDescriptions, request: HyperlinkRequest): void {
    this.currentTalentKey = key;
    this.currentHyperlinkRequest = request;
    // Set the current character in the insertion service for quick links
    if (this.selectedCharacter) {
      this.insertionService.setCurrentCharacter(this.selectedCharacter.normalizedName);
    }
    this.modalService.open('hyperlink-editor');
  }

  insertHyperlink(hyperlinkId: string | number, displayText?: string, linkType?: 'C' | 'Z') {
    if (!this.currentTalentKey || !this.currentHyperlinkRequest) return;

    const key = this.currentTalentKey;
    const selection = this.currentHyperlinkRequest;
    const value = this.briefDrafts[key] ?? '';
    const start = selection.selectionStart;
    const end = selection.selectionEnd;
    const selected = selection.selectedText || 'Link';

    // Determine link type based on explicit type parameter or ID format
    let linkMarkup: string;
    if (linkType === 'Z') {
      // Type Z link (brief field reference)
      linkMarkup = `{LINK#Z${hyperlinkId}}${selected}{/LINK}`;
    } else {
      // Type C or N link (custom concept or game hyperlink)
      linkMarkup = `{LINK#${hyperlinkId}}${selected}{/LINK}`;
    }

    const newValue = value.slice(0, start) + linkMarkup + value.slice(end);
    this.briefDrafts[key] = newValue;

    // Capture the state change in history
    this.historyService.captureSnapshot(key, newValue, start, start + linkMarkup.length);

    this.modalService.close();
  }
}
