export type AstNode =
  | TextNode
  | ColorNode
  | LinkNode
  | ItalicNode
  | BoldNode
  | LineBreakNode;

export type LinkType = 'N' | 'S' | 'P' | 'T';

export interface TextNode {
  type: 'text';
  text: string;
}

export interface ColorNode {
  type: 'color';
  color: string;
  children: AstNode[];
}

export interface LinkNode {
  type: 'link';
  id: number;
  linkType: LinkType;
  children: AstNode[];
}

export interface LineBreakNode {
  type: 'lineBreak';
}

export interface ItalicNode {
  type: 'italic';
  children: AstNode[];
}

export interface BoldNode {
  type: 'bold';
  children: AstNode[];
}
