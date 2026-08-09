import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CharacterResolved } from '../../../_models/character';
import { FormsModule } from '@angular/forms';
import { OverviewProfileComponent } from './profile/profile.component';
import { OverviewConstellationsComponent } from './constellations/constellations.component';
import { OverviewTalentsComponent } from './talents/talents.component';
import { ElementType, ElementTypeLabel } from '../../../_models/enum';
import { CharacterTabStateService } from '../../../_services/character-tab-state.service';

@Component({
  selector: 'app-character-overview',
  imports: [
    FormsModule,
    OverviewProfileComponent,
    OverviewConstellationsComponent,
    OverviewTalentsComponent,
  ],
  templateUrl: './character-overview.component.html',
  styleUrl: './character-overview.component.css',
})
export class CharacterOverviewComponent implements OnInit, OnChanges {
  @Input() char: CharacterResolved | null = null;
  @Input() apikey: string | null = null;
  @Input() elementColor: string | null = null;
  @Input() selectedElement: ElementType = ElementType.ANEMO;
  @Output() elementChange = new EventEmitter<ElementType>();

  selectedMenu: 'profile' | 'talents' | 'constellations' | null = null;

  constructor(private tabStateService: CharacterTabStateService) {}

  ngOnInit(): void {
    this.restoreTabState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When character changes, restore its tab preference
    if (changes['char'] && !changes['char'].firstChange) {
      this.restoreTabState();
    }
  }

  private restoreTabState(): void {
    if (this.char?.profile?.id) {
      this.selectedMenu = this.tabStateService.getTabForCharacter(String(this.char.profile.id));
    }
  }

  selectMenu(menu: 'profile' | 'talents' | 'constellations'): void {
    this.selectedMenu = menu;
    if (this.char?.profile?.id) {
      this.tabStateService.setTabForCharacter(String(this.char.profile.id), menu);
    }
  }

  get imageUrls() {
    return {
      icon: `assets/images/characters/${this.apikey}/icon.webp`,
      iconCard: `assets/images/characters/${this.apikey}/card.webp`,
      sideIcon: `assets/images/characters/${this.apikey}/side.webp`,
      gachaSplash: `assets/images/characters/${this.apikey}/gacha-splash.webp`,
      gachaSlice: `assets/images/characters/${this.apikey}/gacha-icon.webp`,
    };
  }

  // --------------------------
  // |  TRAVELLER SPECIFIC    |
  // --------------------------

  elements = Object.values(ElementType).filter(
    (e) => e != ElementType.NONE && e != ElementType.CRYO,
  );

  selectElement(element: ElementType) {
    this.elementChange.emit(element);
  }

  isTraveller(): boolean {
    return (
      this.char?.profile.normalizedName === 'aether' ||
      this.char?.profile.normalizedName === 'lumine'
    );
  }

  elementColors: Record<ElementType, string> = {
    ELEMENT_PYRO: 'var(--pyro)',
    ELEMENT_HYDRO: 'var(--hydro)',
    ELEMENT_ANEMO: 'var(--anemo)',
    ELEMENT_ELECTRO: 'var(--electro)',
    ELEMENT_DENDRO: 'var(--dendro)',
    ELEMENT_CRYO: 'var(--cryo)',
    ELEMENT_GEO: 'var(--geo)',
    ELEMENT_NONE: 'var(--black)',
  };

  elementTypeLabel = ElementTypeLabel;

  getElementStyle(
    element: ElementType,
    imageUrl: string,
  ): Record<string, string> {
    const color = this.elementColors[element] ?? 'transparent';

    return {
      'background-color': color,
      'mask-image': `url(${imageUrl})`,
      '-webkit-mask-image': `url(${imageUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }
}
