import { Component, Input } from '@angular/core';
import { AstNode } from '../../_models/ast-nodes';
import { HyperlinkComponent } from '../hyperlink/hyperlink.component';
import { ParamValueComponent } from '../param-value/param-value.component';

@Component({
  selector: 'app-ast-renderer',
  imports: [HyperlinkComponent, ParamValueComponent],
  templateUrl: './ast-renderer.component.html',
  styleUrl: './ast-renderer.component.css',
})
export class AstRendererComponent {
  @Input({ required: true }) nodes: AstNode[] = [];
  @Input() elementColor: string = 'var(--light-gray)';
  // True when rendering a link's own visible text, so nested color overrides can re-apply the underline.
  @Input() underline = false;
}
