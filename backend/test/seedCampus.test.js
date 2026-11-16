const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCampusPosts } = require('../scripts/seedCampus');

test('builds 1000 distinct, clearly labeled campus demo posts', () => {
  const posts = buildCampusPosts();
  assert.equal(posts.length, 1000);
  assert.equal(new Set(posts.map((post) => post.seedKey)).size, 1000);
  assert.equal(posts.every((post) => post.isSynthetic && post.title && post.tips && post.author), true);
  assert.equal(new Set(posts.map((post) => post.topic)).size, 4);
  assert.equal(new Set(posts.map((post) => post.neighborhood)).size, 10);
  assert.equal(new Set(posts.map((post) => post.budgetLevel)).size, 3);
});
