import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendMissingLines, demoteHeadings, fillDocHeader, render, upsertBlock } from '../src/markdown.js';

test('render fills tokens and rejects unknown ones', () => {
  assert.equal(render('{{A}}/x {{A}}', { A: 'docs' }), 'docs/x docs');
  assert.throws(() => render('{{MISSING}}', {}), /Unknown template token/);
});

test('demoteHeadings leaves fenced code alone', () => {
  assert.equal(demoteHeadings('# T\n```\n# not a heading\n```\n## S'), '## T\n```\n# not a heading\n```\n### S');
});

test('upsertBlock appends, then replaces in place', () => {
  const once = upsertBlock('# Mine\n', 'v1');
  assert.equal(once, '# Mine\n\n<!-- agent-kit:start -->\nv1\n<!-- agent-kit:end -->\n');
  const twice = upsertBlock(`${once}\nafter\n`, 'v2');
  assert.equal(twice, '# Mine\n\n<!-- agent-kit:start -->\nv2\n<!-- agent-kit:end -->\n\nafter\n');
});

test('upsertBlock keeps CRLF files CRLF and refuses broken markers', () => {
  assert.equal(upsertBlock('a\r\n', 'b'), 'a\r\n\r\n<!-- agent-kit:start -->\r\nb\r\n<!-- agent-kit:end -->\r\n');
  assert.throws(() => upsertBlock('<!-- agent-kit:start -->\nno end', 'x'), /unbalanced/);
});

test('appendMissingLines adds only what is missing', () => {
  assert.equal(appendMissingLines('node_modules/', ['.env*', 'node_modules/']), 'node_modules/\n.env*\n');
  assert.equal(appendMissingLines('.env*\n', ['.env*']), '.env*\n');
});

test('fillDocHeader only touches the header', () => {
  assert.equal(fillDocHeader('# PRD-xxx\n## 1\nPRD-xxx', [['PRD-xxx', 'PRD-001']]), '# PRD-001\n## 1\nPRD-xxx');
});
