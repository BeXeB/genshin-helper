import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-item-card',
  imports: [RouterLink],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.css',
})
export class ItemCardComponent implements AfterViewInit {
  @Input() imageUrl!: string;
  @Input() itemName!: string;
  @Input() rarity!: number;
  @Input() routeUrl?: string | string[];
  @ViewChild('iconsContainer') iconsContainer!: ElementRef;
  @ViewChild('itemNameElement') itemNameElement!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  rarityColor: Record<number, string> = {
    1: 'var(--rar-1)',
    2: 'var(--rar-2)',
    3: 'var(--rar-3)',
    4: 'var(--rar-4)',
    5: 'var(--rar-5)',
  };

  getColor(): string {
    return this.rarityColor[this.rarity];
  }

  hasIcons = false;

  ngAfterViewInit(): void {
    this.hasIcons = this.iconsContainer.nativeElement.children.length > 0;
    this.cdr.detectChanges();
  }
}
