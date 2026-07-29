import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../_services/character.service';
import { ImageService } from '../../_services/image.service';
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
  imports: [CommonModule, FormsModule, PageTitleComponent, FormattedTextComponent],
  templateUrl: './talent-editor.component.html',
  styleUrl: './talent-editor.component.css',
})
export class TalentEditorComponent implements OnInit {
  constructor(
    private characterSerivce: CharacterService,
    private imageService: ImageService,
  ) {}

  characters: CharacterProfile[] = [];

  search: string = '';
  showDropdown = false;

  selectedCharacter: CharacterProfile | null = null;
  selectedCharacterDetails: Character | null = null;
  selectedTalentKey: keyof CharacterBriefDescriptions | null = null;
  selectedSection: string | null = null;

  briefDrafts: Partial<CharacterBriefDescriptions> = {};

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

  ngOnInit(): void {
    this.characterSerivce
      .getCharacters()
      .subscribe((data: CharacterProfile[]) => {
        this.characters = data.sort((b, a) => a.sortId - b.sortId);
      });
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
    this.selectedCharacter = profile;
    this.search = profile.name;
    this.showDropdown = false;
    this.briefDrafts = {};
    this.selectedTalentKey = null;
    this.selectedSection = null;

    this.characterSerivce
      .getCharacterDetails(profile.normalizedName)
      .subscribe((details: Character) => {
        this.selectedCharacterDetails = details;
        // Set first section and talent as selected
        const firstSection = this.talentSections[0];
        if (firstSection) {
          this.selectedSection = firstSection.label;
          const firstRow = firstSection.rows[0];
          if (firstRow) {
            this.selectedTalentKey = firstRow.key;
          }
        }
      });

    this.characterSerivce
      .getBriefDescriptions(profile.normalizedName)
      .subscribe((data) => {
        this.briefDrafts = { ...data };
      });
  }

  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }

  getCharacterIcon(apiKey: string): string {
    return this.imageService.getCharacterIcon(apiKey);
  }

  get talentSections(): { label: string; rows: TalentRow[] }[] {
    const sections: { label: string; rows: TalentRow[] }[] = [];
    const skills = this.selectedCharacterDetails?.skills;
    const constellation = this.selectedCharacterDetails?.constellation;

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
      passive1: 'Passive 1',
      passive2: 'Passive 2',
      passive3: 'Passive 3',
      passive4: 'Passive 4',
      c1: 'Constellation 1',
      c2: 'Constellation 2',
      c3: 'Constellation 3',
      c4: 'Constellation 4',
      c5: 'Constellation 5',
      c6: 'Constellation 6',
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
  }

  selectSection(sectionLabel: string) {
    this.selectedSection = sectionLabel;
    // Select first talent in the section
    const section = this.talentSections.find(s => s.label === sectionLabel);
    if (section && section.rows.length > 0) {
      this.selectedTalentKey = section.rows[0].key;
    }
  }

  getCurrentSection(): { label: string; rows: TalentRow[] } | null {
    return this.talentSections.find(s => s.label === this.selectedSection) || null;
  }

  exportBriefDescriptionJson() {
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

  wrapSelection(
    key: keyof CharacterBriefDescriptions,
    textarea: HTMLTextAreaElement,
    tag: 'bold' | 'italic' | 'color',
    color?: string,
  ) {
    const value = this.briefDrafts[key] ?? '';
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = value.substring(start, end);

    let openTag: string;
    let closeTag: string;
    switch (tag) {
      case 'bold':
        openTag = '<b>';
        closeTag = '</b>';
        break;
      case 'italic':
        openTag = '<i>';
        closeTag = '</i>';
        break;
      case 'color':
        openTag = `<color=${color}>`;
        closeTag = '</color>';
        break;
    }

    const newValue =
      value.slice(0, start) + openTag + selected + closeTag + value.slice(end);
    this.briefDrafts[key] = newValue;

    const newStart = start + openTag.length;
    const newEnd = newStart + selected.length;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    });
  }

  clearFormatting(
    key: keyof CharacterBriefDescriptions,
    textarea: HTMLTextAreaElement,
  ) {
    const value = this.briefDrafts[key] ?? '';
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = value.substring(start, end);

    // Remove all formatting tags
    const cleared = selected
      .replace(/<b>/g, '')
      .replace(/<\/b>/g, '')
      .replace(/<i>/g, '')
      .replace(/<\/i>/g, '')
      .replace(/<color=[^>]*>/g, '')
      .replace(/<\/color>/g, '');

    const newValue =
      value.slice(0, start) + cleared + value.slice(end);
    this.briefDrafts[key] = newValue;

    const newEnd = start + cleared.length;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, newEnd);
    });
  }
}
