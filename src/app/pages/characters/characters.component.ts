import { Component } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { ImageService } from '../../_services/image.service';
import { CharacterProfile } from '../../_models/character';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { PageFilters, FilterGroup } from '../../_models/filters';
import { FilterService } from '../../_services/filter.service';
import { FiltersComponent } from '../../_components/filters/filters.component';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';
import { BaseListComponent } from '../../_components/base-list.component';
import { Observable } from 'rxjs';
import { ElementType, ElementTypeLabel, WeaponTypeLabel } from '../../_models/enum';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    FormsModule,
    PageTitleComponent,
    FiltersComponent,
    ItemCardComponent,
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css',
})
export class CharactersComponent extends BaseListComponent<CharacterProfile> {
  private readonly _storageKey = 'characterFilters';
  readonly ElementType = ElementType;

  data: CharacterProfile[] = [];
  filtered: CharacterProfile[] = [];

  searchTerm = '';
  filters: PageFilters = {};

  filterGroups: FilterGroup[] = [
    {
      label: 'Elemek',
      key: 'elements',
      options: ['Anemo', 'Geo', 'Electro', 'Dendro', 'Hydro', 'Pyro', 'Cryo'],
    },
    {
      label: 'Fegyverek',
      key: 'weapons',
      options: ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'],
    },
    {
      label: 'Ritkaság',
      key: 'rarity',
      options: ['5', '4'],
    },
  ];

  filterFns = {
    elements: (c: CharacterProfile, values: string[]) =>
      values.includes(ElementTypeLabel[c.elementType]),

    weapons: (c: CharacterProfile, values: string[]) =>
      values.includes(WeaponTypeLabel[c.weaponType]),

    rarity: (c: CharacterProfile, values: string[]) =>
      values.includes(c.rarity.toString()),
  };

  get storageKey(): string {
    return this._storageKey;
  }

  constructor(
    private characterService: CharacterService,
    protected override filterService: FilterService,
    private imageService: ImageService,
  ) {
    super(filterService);
  }

  loadData(): Observable<CharacterProfile[]> {
    return this.characterService.getCharacters();
  }

  transformData(data: CharacterProfile[]): CharacterProfile[] {
    return data
      .filter((char) => char.name !== 'Manekin' && char.name !== 'Manekina')
      .sort((a, b) => a.elementType.localeCompare(b.elementType))
      .sort((a, b) => b.rarity - a.rarity)
      .sort((a, b) => b.sortId - a.sortId);
  }

  getIcons(char: CharacterProfile) {
    return {
      iconUrl: this.imageService.getCharacterIcon(char.normalizedName),
      elementUrl: this.imageService.getElementIcon(char.elementType),
      weaponUrl: this.imageService.getWeaponTypeIcon(char.weaponType),
    };
  }

  getElementStyle(char: CharacterProfile): Record<string, string> {
    if (char?.elementType === ElementType.NONE) {
      return {};
    }

    const elementColors: Record<ElementType, string> = {
      [ElementType.PYRO]: 'var(--pyro)',
      [ElementType.HYDRO]: 'var(--hydro)',
      [ElementType.ANEMO]: 'var(--anemo)',
      [ElementType.ELECTRO]: 'var(--electro)',
      [ElementType.DENDRO]: 'var(--dendro)',
      [ElementType.CRYO]: 'var(--cryo)',
      [ElementType.GEO]: 'var(--geo)',
      [ElementType.NONE]: 'transparent',
    };

    const color = char?.elementType
      ? (elementColors[char.elementType] ?? 'transparent')
      : 'transparent';

    return {
      'background-color': color,
      'mask-image': `url(${this.getIcons(char).elementUrl})`,
      '-webkit-mask-image': `url(${this.getIcons(char).elementUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }
}
