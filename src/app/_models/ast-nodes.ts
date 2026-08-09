export type AstNode =
  | TextNode
  | ColorNode
  | LinkNode
  | ItalicNode
  | BoldNode
  | LineBreakNode
  | ParamNode;

export type LinkType = 'N' | 'S' | 'P' | 'T' | 'Z' | 'C';

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
  id: string | number;
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

export interface ParamNode {
  type: 'param';
  groupId: number;
  level: number;
  paramIndex: number;
  multiplier: number;
}
