const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { ObjectId } = require('mongodb');
const { createCampusRouter } = require('../src/routes/campus');

test('campus read API filters posts and returns details', async () => {
  const id = new ObjectId();
  const post = {
    _id: id,
    title: 'Food.* near campus',
    topic: 'food',
    neighborhood: 'Fenway',
    budgetLevel: 'low',
    location: 'Boston',
    tips: 'Bring a student ID',
    updatedAt: new Date('2026-01-01'),
  };
  let capturedQuery;
  const collection = {
    find(query) {
      capturedQuery = query;
      return {
        sort() {
          return this;
        },
        skip() {
          return this;
        },
        limit() {
          return this;
        },
        async toArray() {
          return [post];
        },
      };
    },
    async countDocuments() {
      return 1;
    },
    async findOne(query) {
      return query._id.equals(id) ? post : null;
    },
  };
  const app = express();
  app.use('/api/campus-posts', createCampusRouter(collection));
  const server = app.listen(0);
  const base = 'http://127.0.0.1:' + server.address().port;

  try {
    const list = await fetch(
      base + '/api/campus-posts?keyword=food.%2A&topic=food&neighborhood=Fenway&budgetLevel=low',
    );
    assert.equal(list.status, 200);
    const result = await list.json();
    assert.equal(result.total, 1);
    assert.equal(result.posts[0].id, id.toString());
    assert.equal(capturedQuery.topic, 'food');
    assert.equal(capturedQuery.neighborhood, 'Fenway');
    assert.equal(capturedQuery.budgetLevel, 'low');
    assert.equal(capturedQuery.$or[0].title.test('Food.* near campus'), true);
    assert.equal(capturedQuery.$or[0].title.test('Food nearby'), false);

    const detail = await fetch(base + '/api/campus-posts/' + id);
    assert.equal(detail.status, 200);
    assert.equal((await detail.json()).tips, 'Bring a student ID');

    const invalidPage = await fetch(base + '/api/campus-posts?page=0');
    assert.equal(invalidPage.status, 400);
    const invalidId = await fetch(base + '/api/campus-posts/not-an-id');
    assert.equal(invalidId.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
