import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HyperlinkService } from '../../_services/hyperlink.service';
import { FormatterService } from '../../_services/formatter.service';
import { Hyperlink } from '../../_models/hyperlinks';
import { AstNode } from '../../_models/ast-nodes';
import { AstRendererComponent } from '../ast-renderer/ast-renderer.component';

@Component({
  selector: 'app-hyperlink',
  imports: [forwardRef(() => AstRendererComponent)],
  templateUrl: './hyperlink.component.html',
  styleUrl: './hyperlink.component.css',
})
export class HyperlinkComponent implements OnInit {
  @Input({ required: true }) id!: number;
  @Input() elementColor: string = 'var(--light-gray)';
  @ViewChild('tooltip') tooltip?: ElementRef<HTMLElement>;

  hyperlink?: Hyperlink;

  descriptionNodes: AstNode[] = [];
  tooltipPosition: 'top' | 'bottom' = 'bottom';

  private readonly tooltipHeightEstimate = 150;

  constructor(
    private hyperlinkService: HyperlinkService,
    private formatter: FormatterService,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.hyperlinkService.getHyperlink(this.id).subscribe((hyperlink) => {
      this.hyperlink = hyperlink;

      if (!hyperlink) {
        return;
      }

      this.descriptionNodes = this.formatter.parse(hyperlink.description);
      this.updateTooltipPosition();
    });
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
    if (!this.hyperlink || !this.tooltip) {
      return;
    }

    const link = this.elementRef.nativeElement.querySelector(
      '.game-link',
    ) as HTMLElement | null;

    if (!link) {
      return;
    }

    const linkRect = link.getBoundingClientRect();
    const tooltipHeight = this.tooltip.nativeElement.offsetHeight;

    const spaceBelow = window.innerHeight - linkRect.bottom;
    const spaceAbove = linkRect.top;

    this.tooltipPosition =
      spaceBelow < tooltipHeight && spaceAbove >= tooltipHeight
        ? 'top'
        : 'bottom';
  }
}
