import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormattedTextComponent } from '../formatted-text-component/formatted-text.component';
import { EditorHistoryService } from '../../_services/editor-history.service';
import { ElementType, ElementTypeLabel } from '../../_models/enum';
import { ImageService } from '../../_services/image.service';

export type ColorPreset = {
  label: string;
  color: string;
  element?: ElementType;
};

export interface HyperlinkRequest {
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Reusable rich text editor component with formatting toolbar and live preview.
 * Manages its own history through EditorHistoryService.
 * Emits textChange on input and hyperlinkRequested when link button is clicked.
 */
@Component({
  selector: 'app-formatted-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, FormattedTextComponent],
  templateUrl: './formatted-text-editor.component.html',
  styleUrl: './formatted-text-editor.component.css',
})
export class FormattedTextEditorComponent implements OnInit, OnChanges {
  @Input() text: string = '';
  @Input() fieldKey: string | number = 'default';
  @Input() colorPresets: ColorPreset[] = this.getDefaultColorPresets();
  @Input() showToolbar: boolean = true;
  @Input() showPreview: boolean = true;
  @Input() placeholder: string = '';
  @Input() rows: number = 4;

  @Output() textChange = new EventEmitter<string>();
  @Output() hyperlinkRequested = new EventEmitter<HyperlinkRequest>();

  @ViewChild('textarea') textarea?: ElementRef<HTMLTextAreaElement>;

  private lastInitializedFieldKey: string | number | null = null;

  constructor(
    private historyService: EditorHistoryService,
    private imageService: ImageService,
  ) {}

  ngOnInit(): void {
    this.historyService.ensureInitialized(this.fieldKey, this.text);
    this.lastInitializedFieldKey = this.fieldKey;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only reinitialize history when switching to a different field (e.g., different character)
    // Don't reinitialize when text changes due to normal editing
    if (changes['fieldKey'] && !changes['fieldKey'].firstChange) {
      const newFieldKey = changes['fieldKey'].currentValue;
      if (newFieldKey !== this.lastInitializedFieldKey) {
        if (this.lastInitializedFieldKey !== null) {
          this.historyService.clearField(this.lastInitializedFieldKey);
        }
        this.historyService.ensureInitialized(newFieldKey, this.text);
        this.lastInitializedFieldKey = newFieldKey;
      }
    }
  }

  onTextareaInput(): void {
    const ta = this.textarea?.nativeElement;
    if (!ta) return;

    this.text = ta.value;
    this.textChange.emit(this.text);

    this.historyService.captureSnapshot(
      this.fieldKey,
      this.text,
      ta.selectionStart,
      ta.selectionEnd,
    );
  }

  onTextareaBlur(): void {
    const ta = this.textarea?.nativeElement;
    if (!ta) return;
    this.historyService.flushPending(this.fieldKey);
  }

  onTextareaKeydown(event: KeyboardEvent): void {
    const ta = this.textarea?.nativeElement;
    if (!ta) return;

    const isMod = event.ctrlKey || event.metaKey;
    if (!isMod) return;

    const k = event.key.toLowerCase();
    if (k === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo(ta);
    } else if (k === 'y' || (k === 'z' && event.shiftKey)) {
      event.preventDefault();
      this.redo(ta);
    }
  }

  undo(ta?: HTMLTextAreaElement): void {
    const entry = this.historyService.undo(this.fieldKey);
    if (!entry) return;

    this.text = entry.value;
    this.textChange.emit(this.text);

    ta = ta || this.textarea?.nativeElement;
    if (ta) {
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(entry.selectionStart, entry.selectionEnd);
      });
    }
  }

  redo(ta?: HTMLTextAreaElement): void {
    const entry = this.historyService.redo(this.fieldKey);
    if (!entry) return;

    this.text = entry.value;
    this.textChange.emit(this.text);

    ta = ta || this.textarea?.nativeElement;
    if (ta) {
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(entry.selectionStart, entry.selectionEnd);
      });
    }
  }

  canUndo(): boolean {
    return this.historyService.canUndo(this.fieldKey);
  }

  canRedo(): boolean {
    return this.historyService.canRedo(this.fieldKey);
  }

  wrapSelection(tag: 'bold' | 'italic' | 'color', color?: string): void {
    const ta = this.textarea?.nativeElement;
    if (!ta) return;

    this.historyService.flushPending(this.fieldKey);

    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const selected = this.text.substring(start, end);

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

    const newValue = this.text.slice(0, start) + openTag + selected + closeTag + this.text.slice(end);
    this.text = newValue;
    this.textChange.emit(this.text);

    const newStart = start + openTag.length;
    const newEnd = newStart + selected.length;
    this.historyService.captureSnapshot(this.fieldKey, this.text, newStart, newEnd);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  }

  clearFormatting(): void {
    const ta = this.textarea?.nativeElement;
    if (!ta) return;

    this.historyService.flushPending(this.fieldKey);

    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const selected = this.text.substring(start, end);

    // Remove all formatting tags
    const cleared = selected
      .replace(/<b>/g, '')
      .replace(/<\/b>/g, '')
      .replace(/<i>/g, '')
      .replace(/<\/i>/g, '')
      .replace(/<color=[^>]*>/g, '')
      .replace(/<\/color>/g, '');

    const newValue = this.text.slice(0, start) + cleared + this.text.slice(end);
    this.text = newValue;
    this.textChange.emit(this.text);

    const newEnd = start + cleared.length;
    this.historyService.captureSnapshot(this.fieldKey, this.text, start, newEnd);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, newEnd);
    });
  }

  requestHyperlink(): void {
    const ta = this.textarea?.nativeElement;
    if (!ta) return;

    this.historyService.flushPending(this.fieldKey);

    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const selectedText = this.text.substring(start, end);

    this.hyperlinkRequested.emit({
      selectedText,
      selectionStart: start,
      selectionEnd: end,
    });
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

  private getDefaultColorPresets(): ColorPreset[] {
    return [
      { label: 'Kiemelés', color: '#FFD780FF' },
      { label: 'Anemo', color: '#80FFD7FF', element: ElementType.ANEMO },
      { label: 'Cryo', color: '#99FFFFFF', element: ElementType.CRYO },
      { label: 'Dendro', color: '#99FF88FF', element: ElementType.DENDRO },
      { label: 'Electro', color: '#FFACFFFF', element: ElementType.ELECTRO },
      { label: 'Geo', color: '#FFE699FF', element: ElementType.GEO },
      { label: 'Hydro', color: '#80C0FFFF', element: ElementType.HYDRO },
      { label: 'Pyro', color: '#FF9999FF', element: ElementType.PYRO },
    ];
  }
}
