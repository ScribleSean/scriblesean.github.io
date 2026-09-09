import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBrowserAddress } from '../lib/browser-navigation';

test('web addresses and search terms resolve to navigable pages', () => {
  assert.equal(resolveBrowserAddress('example.com'), 'https://example.com/');
  assert.equal(resolveBrowserAddress('https://example.com/path?q=1'), 'https://example.com/path?q=1');
  assert.equal(resolveBrowserAddress('/portfolio/'), '/portfolio/');
  const search = new URL(resolveBrowserAddress('gamecube controller'));
  assert.equal(search.searchParams.get('q'), 'gamecube controller');
  assert.equal(search.searchParams.get('igu'), '1');
  assert.equal(resolveBrowserAddress('google.com'), 'https://www.google.com/webhp?igu=1');
});

test('active URLs and embedded credentials are rejected', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hi', 'file:///tmp/a', 'https://name:secret@example.com']) {
    assert.throws(() => resolveBrowserAddress(value));
  }
});
