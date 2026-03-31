import type { Document, Block, Text, TopLevelBlock } from '@contentful/rich-text-types';
import { BLOCKS } from '@contentful/rich-text-types';

export type BodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading-2' | 'heading-3'; text: string };

function textNode(value: string): Text {
  return {
    nodeType: 'text',
    value,
    marks: [],
    data: {},
  };
}

function paragraph(text: string): Block {
  return {
    nodeType: BLOCKS.PARAGRAPH,
    data: {},
    content: [textNode(text)],
  };
}

function heading(level: 2 | 3, text: string): Block {
  return {
    nodeType: level === 2 ? BLOCKS.HEADING_2 : BLOCKS.HEADING_3,
    data: {},
    content: [textNode(text)],
  };
}

export function blocksToDocument(blocks: BodyBlock[]): Document {
  const content: TopLevelBlock[] = [];
  for (const b of blocks) {
    if (b.type === 'paragraph') {
      const t = b.text.trim();
      if (t) content.push(paragraph(t) as TopLevelBlock);
    } else if (b.type === 'heading-2') {
      const t = b.text.trim();
      if (t) content.push(heading(2, t) as TopLevelBlock);
    } else if (b.type === 'heading-3') {
      const t = b.text.trim();
      if (t) content.push(heading(3, t) as TopLevelBlock);
    }
  }
  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: content.length ? content : [paragraph('') as TopLevelBlock],
  };
}
