import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Material, MaterialResolved } from '../../_models/materials';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { MaterialService } from '../../_services/material.service';
import { map, switchMap, takeUntil } from 'rxjs';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormatterService } from '../../_services/formatter.service';
import { BaseDetailComponent } from '../../_components/base-detail.component';
import { FormattedTextComponent } from "../../_components/formatted-text-component/formatted-text.component";

@Component({
  selector: 'app-material-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitleComponent, RouterLink, FormattedTextComponent],
  templateUrl: './material-details.component.html',
  styleUrl: './material-details.component.css',
})
export class MaterialDetailsComponent extends BaseDetailComponent<MaterialResolved> {
  material: MaterialResolved | null = null;
  mora: Material | null = null;
  errorMessage: string | null = null;

  constructor(
    protected override route: ActivatedRoute,
    private resolver: ResolverService,
    private materialService: MaterialService,
    protected override formatterService: FormatterService,
    private cdr: ChangeDetectorRef,
  ) {
    super(route, formatterService);
  }

  override loadDetail(slug: string): void {
    this.resolver
      .initialize()
      .pipe(
        switchMap(() => this.materialService.getMaterial(slug)),
        map((data) =>
          data ? this.resolver.resolveMaterial(data) : null,
        ),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (resolvedMaterial) => {
          this.material = resolvedMaterial;
          this.errorMessage = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = `Material "${slug}" not found`;
          this.cdr.markForCheck();
        },
      });

    this.materialService.getMaterial('mora')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.mora = data ?? null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.mora = null;
          this.cdr.markForCheck();
        },
      });
  }
}
