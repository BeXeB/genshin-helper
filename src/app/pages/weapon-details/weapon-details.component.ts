import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { WeaponRefine, WeaponResolved } from '../../_models/weapons';
import { Material } from '../../_models/materials';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { WeaponService } from '../../_services/weapon.service';
import { map, switchMap, takeUntil } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { FormatterService } from '../../_services/formatter.service';
import { BaseDetailComponent } from '../../_components/base-detail.component';
import { ImageService } from '../../_services/image.service';
import { StatTypeLabel } from '../../_models/enum';
import { AstNode } from '../../_models/ast-nodes';
import { FormattedTextComponent } from "../../_components/formatted-text-component/formatted-text.component";

@Component({
  selector: 'app-weapon-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitleComponent, FormsModule, DecimalPipe, RouterLink, FormattedTextComponent],
  templateUrl: './weapon-details.component.html',
  styleUrl: './weapon-details.component.css',
})
export class WeaponDetailsComponent extends BaseDetailComponent<WeaponResolved> {
  weapon: WeaponResolved | null = null;
  mora: Material | null = null;
  errorMessage: string | null = null;

  readonly StatTypeLabel = StatTypeLabel;

  constructor(
    protected override route: ActivatedRoute,
    private resolver: ResolverService,
    private weaponService: WeaponService,
    protected override formatterService: FormatterService,
    private cdr: ChangeDetectorRef,
    private imageService: ImageService,
  ) {
    super(route, formatterService);
  }

  quickLevels = [
    '1',
    '5',
    '10',
    '15',
    '20',
    '20+',
    '25',
    '30',
    '35',
    '40+',
    '45',
    '50+',
    '55',
    '60+',
    '65',
    '70+',
    '75',
    '80+',
    '85',
    '90',
  ];

  refinements: Record<number, 'r1' | 'r2' | 'r3' | 'r4' | 'r5'> = {
    1: 'r1',
    2: 'r2',
    3: 'r3',
    4: 'r4',
    5: 'r5',
  };

  selectedRefine: number = 1;

  level: string = '1';
  levelIndex: number = this.quickLevels.indexOf(this.level);

  materials: Material[] = [];

  override loadDetail(slug: string): void {
    this.resolver
      .initialize()
      .pipe(
        switchMap(() => this.weaponService.getWeapon(slug)),
        map((data) => {
          if (!data) return null;
          return this.resolver.resolveWeapon(data);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (resolvedWeapon) => {
          if (resolvedWeapon) {
            this.weapon = resolvedWeapon;
            this.setLevel(this.weapon?.rarity > 2 ? '90' : '70');

            if (resolvedWeapon.rarity > 2) {
              resolvedWeapon.costs.ascend6?.map((i) => {
                if (i.material.id === 202) {
                  return;
                }
                this.materials.push(i.material);
              });
            } else {
              resolvedWeapon.costs.ascend4?.map((i) => {
                if (i.material.id === 202) {
                  return;
                }
                this.materials.push(i.material);
              });
            }

            this.errorMessage = null;
            this.cdr.markForCheck();
          } else {
            this.errorMessage = `Weapon "${slug}" not found`;
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.errorMessage = `Weapon "${slug}" not found`;
          this.cdr.markForCheck();
        },
      });
  }

  effectToNodes(effectRefine: WeaponRefine | undefined): AstNode[] {
    if (!effectRefine) {
      return [];
    }

    return this.formatterService.parse(effectRefine.description);
  }

  hasRefine(ref: number): boolean {
    const key = `r${ref}` as keyof typeof this.weapon;
    return !!this.weapon?.[key];
  }

  updateLevelFromIndex() {
    if (!this.weapon) return;

    let level = this.quickLevels[this.levelIndex].toString();

    if (this.weapon.rarity <= 2 && level === '70+') {
      level = '70';
    }

    this.level = level;
  }

  validateLevel() {
    if (!this.weapon) return;
    const ascensionPattern =
      this.weapon?.rarity > 2 ? /^(20|40|50|60|70|80)\+$/ : /^(20|40|50|60)\+$/;
    if (ascensionPattern.test(this.level)) {
      this.setLevel(this.level);
      return;
    }

    let num = parseInt(this.level);
    if (isNaN(num)) {
      this.setLevel('1');
    } else {
      num = Math.max(1, Math.min(90, num));
      this.setLevel(num.toString());
    }
  }

  setLevel(level: string) {
    this.level = level;

    const index = this.quickLevels.indexOf(level);

    const closestIndex = this.quickLevels.reduce((closest, current, idx) => {
      const currentNum = parseInt(current);
      const closestNum = parseInt(this.quickLevels[closest]);
      const targetNum = parseInt(level);
      if (isNaN(currentNum) || isNaN(closestNum) || isNaN(targetNum)) {
        return closest;
      }
      return Math.abs(currentNum - targetNum) < Math.abs(closestNum - targetNum)
        ? idx
        : closest;
    }, 0);

    this.levelIndex = index !== -1 ? index : closestIndex;
  }

  getMaterialImageUrl(material: Material): string {
    return this.imageService.getMaterialImage(
      material.normalizedName,
      material.type,
    );
  }
}
