export type AstNode =
  | TextNode
  | ColorNode
  | LinkNode
  | LineBreakNode;

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
  children: AstNode[];
}

export interface LineBreakNode {
  type: 'lineBreak';
}
