import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { HyperlinkService } from '../../_services/hyperlink.service';
import { CharacterService } from '../../_services/character.service';
import { FormatterService } from '../../_services/formatter.service';
import { AstNode, LinkType } from '../../_models/ast-nodes';
import { AstRendererComponent } from '../ast-renderer/ast-renderer.component';

interface LinkTarget {
  name: string;
  description: string;
}

@Component({
  selector: 'app-hyperlink',
  imports: [forwardRef(() => AstRendererComponent)],
  templateUrl: './hyperlink.component.html',
  styleUrl: './hyperlink.component.css',
})
export class HyperlinkComponent implements OnInit {
  @Input({ required: true }) id!: number;
  @Input() linkType: LinkType = 'N';
  @Input() elementColor: string = 'var(--light-gray)';
  @ViewChild('tooltip') tooltip?: ElementRef<HTMLElement>;

  title?: string;

  descriptionNodes: AstNode[] = [];
  tooltipPosition: 'top' | 'bottom' = 'bottom';

  private readonly tooltipHeightEstimate = 150;
  private readonly viewportMargin = 8;

  constructor(
    private hyperlinkService: HyperlinkService,
    private characterService: CharacterService,
    private formatter: FormatterService,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.resolveTarget().subscribe((target) => {
      this.title = target?.name;

      if (!target) {
        return;
      }

      this.descriptionNodes = this.formatter.parse(target.description);
      this.updateTooltipPosition();
    });
  }

  private resolveTarget(): Observable<LinkTarget | undefined> {
    switch (this.linkType) {
      case 'S':
        return this.characterService
          .getSkill(this.id)
          .pipe(
            map((skill) => skill && { name: skill.name, description: skill.descriptionRaw }),
          );
      case 'P':
        return this.characterService
          .getPassiveTalent(this.id)
          .pipe(
            map(
              (passive) =>
                passive && { name: passive.name, description: passive.descriptionRaw },
            ),
          );
      case 'T':
        return this.characterService
          .getConstellation(this.id)
          .pipe(
            map(
              (constellation) =>
                constellation && {
                  name: constellation.name,
                  description: constellation.descriptionRaw,
                },
            ),
          );
      default:
        return this.hyperlinkService
          .getHyperlink(this.id)
          .pipe(
            map(
              (hyperlink) =>
                hyperlink && {
                  name: hyperlink.name,
                  description: hyperlink.description,
                },
            ),
          );
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.updateTooltipPosition();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateTooltipPosition();
  }

  private updateTooltipPosition(): void {
    if (!this.title || !this.tooltip) {
      return;
    }

    const link = this.elementRef.nativeElement.querySelector(
      '.game-link',
    ) as HTMLElement | null;

    if (!link) {
      return;
    }

    const linkRect = link.getBoundingClientRect();
    const tooltipEl = this.tooltip.nativeElement;
    const tooltipHeight = tooltipEl.offsetHeight;
    const tooltipWidth = tooltipEl.offsetWidth;

    const spaceBelow = window.innerHeight - linkRect.bottom;
    const spaceAbove = linkRect.top;

    this.tooltipPosition =
      spaceBelow < tooltipHeight && spaceAbove >= tooltipHeight
        ? 'top'
        : 'bottom';

    // Keep the tooltip from overflowing the left/right edges of the viewport
    // by nudging it horizontally away from its default centered position.
    const centerX = linkRect.left + linkRect.width / 2;
    const idealLeft = centerX - tooltipWidth / 2;
    const idealRight = centerX + tooltipWidth / 2;

    let shift = 0;
    if (idealLeft < this.viewportMargin) {
      shift = this.viewportMargin - idealLeft;
    } else if (idealRight > window.innerWidth - this.viewportMargin) {
      shift = window.innerWidth - this.viewportMargin - idealRight;
    }

    tooltipEl.style.setProperty('--tooltip-shift', `${shift}px`);
  }
}
