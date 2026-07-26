import { Component, forwardRef, Input, OnInit } from '@angular/core';
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
  @Input({ required: true })
  id!: number;

  hyperlink?: Hyperlink;

  descriptionNodes: AstNode[] = [];

  constructor(
    private hyperlinkService: HyperlinkService,
    private formatter: FormatterService,
  ) {}

  ngOnInit(): void {
    this.hyperlinkService.getHyperlink(this.id).subscribe((hyperlink) => {
      this.hyperlink = hyperlink;

      if (!hyperlink) {
        return;
      }

      this.descriptionNodes = this.formatter.parse(hyperlink.description);

      console.log(this.descriptionNodes)
    });
  }
}
