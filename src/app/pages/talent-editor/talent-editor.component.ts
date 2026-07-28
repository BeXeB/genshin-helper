import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../_services/character.service';
import { ImageService } from '../../_services/image.service';
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
};

type ColorPreset = {
  label: string;
  color: string;
};

@Component({
  selector: 'app-talent-editor',
  imports: [FormsModule, PageTitleComponent, FormattedTextComponent],
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

  briefDrafts: Partial<CharacterBriefDescriptions> = {};

  colorPresets: ColorPreset[] = [
    { label: 'Kiemelés', color: '#FFD780FF' },
    { label: 'Anemo', color: '#80FFD7FF' },
    { label: 'Cryo', color: '#99FFFFFF' },
    { label: 'Dendro', color: '#99FF88FF' },
    { label: 'Electro', color: '#FFACFFFF' },
    { label: 'Geo', color: '#FFE699FF' },
    { label: 'Hydro', color: '#80C0FFFF' },
    { label: 'Pyro', color: '#FF9999FF' },
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

    this.characterSerivce
      .getCharacterDetails(profile.normalizedName)
      .subscribe((details: Character) => {
        this.selectedCharacterDetails = details;
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
          { key: 'combat1', talent: skills.combat1 },
          { key: 'combat2', talent: skills.combat2 },
          { key: 'combat3', talent: skills.combat3 },
        ],
      });

      const passiveRows: TalentRow[] = [
        { key: 'passive1', talent: skills.passive1 },
        { key: 'passive2', talent: skills.passive2 },
      ];
      if (skills.passive3)
        passiveRows.push({ key: 'passive3', talent: skills.passive3 });
      if (skills.passive4)
        passiveRows.push({ key: 'passive4', talent: skills.passive4 });

      sections.push({ label: 'Passzívok', rows: passiveRows });
    }

    if (constellation) {
      sections.push({
        label: 'Konstellációk',
        rows: [
          { key: 'c1', talent: constellation.c1 },
          { key: 'c2', talent: constellation.c2 },
          { key: 'c3', talent: constellation.c3 },
          { key: 'c4', talent: constellation.c4 },
          { key: 'c5', talent: constellation.c5 },
          { key: 'c6', talent: constellation.c6 },
        ],
      });
    }

    return sections;
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
}
