import { Component, Input } from '@angular/core';
import { AstNode } from '../../_models/ast-nodes';
import { HyperlinkComponent } from '../hyperlink/hyperlink.component';

@Component({
  selector: 'app-ast-renderer',
  imports: [HyperlinkComponent],
  templateUrl: './ast-renderer.component.html',
  styleUrl: './ast-renderer.component.css',
})
export class AstRendererComponent {
  @Input({ required: true })
  nodes: AstNode[] = [];
}
