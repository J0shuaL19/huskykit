const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAcademicPosts } = require('../scripts/seedAcademic');
const { validateAcademicPost } = require('../src/db/academic');

test('1000 academic demo records are unique, valid, and clearly synthetic', () => {
  const posts = buildAcademicPosts();
  assert.equal(posts.length, 1000);
  assert.equal(new Set(posts.map((post) => post.seedKey)).size, 1000);
  for (const post of posts) {
    assert.equal(post.isSynthetic, true);
    assert.equal(validateAcademicPost(post).error, undefined);
    assert.match(post.body, /not a verified student experience/);
    assert.equal(post.authorId, undefined);
  }
});

test('academic validation rejects invalid types and strips ownership fields', () => {
  const sample = buildAcademicPosts(1)[0];
  for (const bad of [
    null,
    [],
    { ...sample, title: {} },
    { ...sample, body: 'short' },
    { ...sample, topic: 'housing' },
    { ...sample, program: { $ne: '' } },
  ]) {
    assert.ok(validateAcademicPost(bad).error);
  }
  const { fields } = validateAcademicPost({
    ...sample,
    authorId: 'forged',
    author: 'Someone else',
    courseCode: ' cs 5610 ',
  });
  assert.equal(fields.courseCode, 'CS 5610');
  assert.equal(fields.authorId, undefined);
  assert.equal(fields.author, undefined);
});
