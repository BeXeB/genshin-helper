import { Component, forwardRef, Input } from '@angular/core';
import { AstNode } from '../../_models/ast-nodes';
import { FormatterService } from '../../_services/formatter.service';
import { AstRendererComponent } from '../ast-renderer/ast-renderer.component';

@Component({
  selector: 'app-formatted-text',
  imports: [AstRendererComponent],
  templateUrl: './formatted-text.component.html',
  styleUrl: './formatted-text.component.css',
})
export class FormattedTextComponent {
  @Input() text?: string;
  @Input() nodes?: AstNode[];

  constructor(private formatter: FormatterService) {}

  ngOnChanges() {
    if (this.text !== undefined) {
      this.nodes = this.formatter.parse(this.text);
    }
  }
}
