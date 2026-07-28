import { Injectable } from '@angular/core';
import {
  AstNode,
  ColorNode,
  LinkNode,
  LineBreakNode,
  ItalicNode,
  BoldNode,
  TextNode,
} from '../_models/ast-nodes';

@Injectable({
  providedIn: 'root',
})
export class FormatterService {
  constructor() {}

  parse(text: string | undefined): AstNode[] {
    if (!text) {
      return [];
    }

    const state = {
      index: 0,
    };

    return this.parseNodes(text, state);
  }

  private parseNodes(
    text: string,
    state: { index: number },
    endTag?: string,
  ): AstNode[] {
    const nodes: AstNode[] = [];

    while (state.index < text.length) {
      if (endTag && text.startsWith(endTag, state.index)) {
        state.index += endTag.length;
        break;
      }

      if (text.startsWith('<color=', state.index)) {
        nodes.push(this.parseColor(text, state));
        continue;
      }

      if (text.startsWith('<i>', state.index)) {
        nodes.push(this.parseItalic(text, state));
        continue;
      }

      if (text.startsWith('<b>', state.index)) {
        nodes.push(this.parseBold(text, state));
        continue;
      }

      if (text.startsWith('{LINK#', state.index)) {
        const result = this.parseLink(text, state);

        if (Array.isArray(result)) {
          nodes.push(...result);
        } else {
          nodes.push(result);
        }

        continue;
      }

      if (text[state.index] === '\n') {
        nodes.push({
          type: 'lineBreak',
        } satisfies LineBreakNode);

        state.index++;
        continue;
      }

      nodes.push(this.parseText(text, state));
    }

    return nodes;
  }

  private parseText(text: string, state: { index: number }): TextNode {
    const start = state.index;

    while (
      state.index < text.length &&
      !text.startsWith('<color=', state.index) &&
      !text.startsWith('{LINK#', state.index) &&
      !text.startsWith('<i>', state.index) &&
      !text.startsWith('<b>', state.index) &&
      text[state.index] !== '\n' &&
      !text.startsWith('</color>', state.index) &&
      !text.startsWith('</i>', state.index) &&
      !text.startsWith('</b>', state.index) &&
      !text.startsWith('{/LINK}', state.index)
    ) {
      state.index++;
    }

    return {
      type: 'text',
      text: text.substring(start, state.index),
    };
  }

  private parseColor(text: string, state: { index: number }): ColorNode {
    const end = text.indexOf('>', state.index);

    const tag = text.substring(state.index, end + 1);

    const match = tag.match(/<color="?([^">]+)"?>/);

    if (!match) {
      throw new Error(`Invalid color tag: ${tag}`);
    }

    state.index = end + 1;

    return {
      type: 'color',
      color: match[1],
      children: this.parseNodes(text, state, '</color>'),
    };
  }

  private parseLink(
    text: string,
    state: { index: number },
  ): LinkNode | AstNode[] {
    const end = text.indexOf('}', state.index);

    const tag = text.substring(state.index, end + 1);

    const match = tag.match(/\{LINK#([NS])(\d+)\}/);

    if (!match) {
      throw new Error(`Invalid link tag: ${tag}`);
    }

    const type = match[1];
    const id = Number(match[2]);

    state.index = end + 1;

    const children = this.parseNodes(text, state, '{/LINK}');

    if (type === 'S') {
      return children;
    }

    return {
      type: 'link',
      id,
      children,
    };
  }

  private parseItalic(text: string, state: { index: number }): ItalicNode {
    state.index += '<i>'.length;

    return {
      type: 'italic',
      children: this.parseNodes(text, state, '</i>'),
    };
  }

  private parseBold(text: string, state: { index: number }): BoldNode {
    state.index += '<b>'.length;

    return {
      type: 'bold',
      children: this.parseNodes(text, state, '</b>'),
    };
  }
}
