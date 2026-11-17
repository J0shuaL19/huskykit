const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { ObjectId } = require('mongodb');
const { createCampusRouter } = require('../src/routes/campus');
const { validateCampusPost } = require('../src/db/campus');

test('campus validation accepts only supported fields and values', () => {
  const input = {
    title: 'Finding a good commute',
    topic: 'commuting',
    neighborhood: 'Fenway',
    budgetLevel: 'low',
    location: 'Near campus',
    body: 'This is a practical example of a student commuting experience.',
    tips: 'Check current schedules.',
    authorId: 'forged',
    author: 'Fake author',
    isSynthetic: true,
  };
  const result = validateCampusPost(input);
  assert.equal(result.error, undefined);
  assert.equal(result.fields.authorId, undefined);
  assert.equal(result.fields.author, undefined);
  assert.equal(result.fields.isSynthetic, undefined);
  assert.equal(
    validateCampusPost({ ...input, topic: 'unknown' }).error,
    'Choose a valid campus topic.',
  );
  assert.equal(validateCampusPost({ ...input, body: 'short' }).error.includes('body'), true);
});

test('campus writes require login and ownership', async () => {
  const ownerId = new ObjectId();
  const otherId = new ObjectId();
  const records = new Map();
  const findRecord = (query) => {
    const record = records.get(query._id.toString());
    return record && (!query.authorId || record.authorId === query.authorId) ? record : null;
  };
  const collection = {
    async insertOne(post) {
      const insertedId = new ObjectId();
      records.set(insertedId.toString(), { ...post, _id: insertedId });
      return { insertedId };
    },
    async findOne(query) {
      return findRecord(query);
    },
    async findOneAndUpdate(query, update) {
      const record = findRecord(query);
      if (!record) return null;
      Object.assign(record, update.$set);
      return record;
    },
    async deleteOne(query) {
      const record = findRecord(query);
      if (!record) return { deletedCount: 0 };
      records.delete(query._id.toString());
      return { deletedCount: 1 };
    },
  };
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user =
      req.get('x-test-user') === 'owner'
        ? { _id: ownerId, displayName: 'Alex' }
        : req.get('x-test-user') === 'other'
          ? { _id: otherId, displayName: 'Other student' }
          : null;
    req.isAuthenticated = () => Boolean(req.user);
    next();
  });
  app.use('/api/campus-posts', createCampusRouter(collection));
  const server = app.listen(0);
  const base = 'http://127.0.0.1:' + server.address().port + '/api/campus-posts';
  const input = {
    title: 'Finding a good commute',
    topic: 'commuting',
    neighborhood: 'Fenway',
    budgetLevel: 'low',
    location: 'Near campus',
    body: 'This is a practical example of a student commuting experience.',
    tips: 'Check current schedules.',
  };
  const send = async (path, method, user, body) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(user ? { 'x-test-user': user } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return {
      status: response.status,
      data: response.status === 204 ? null : await response.json(),
    };
  };

  try {
    assert.equal((await send('', 'POST', null, input)).status, 401);
    assert.equal((await send('', 'POST', 'owner', { ...input, body: 'short' })).status, 400);
    const created = await send('', 'POST', 'owner', {
      ...input,
      authorId: otherId.toString(),
      author: 'Fake author',
      isSynthetic: true,
    });
    assert.equal(created.status, 201);
    assert.equal(created.data.authorId, ownerId.toString());
    assert.equal(created.data.author, 'Alex');
    assert.equal(created.data.isSynthetic, false);
    const id = created.data.id;
    assert.equal((await send('/' + id, 'PUT', null, input)).status, 401);
    assert.equal((await send('/' + id, 'PUT', 'other', input)).status, 403);
    assert.equal((await send('/' + id, 'DELETE', 'other')).status, 403);
    const updated = await send('/' + id, 'PUT', 'owner', {
      ...input,
      title: 'Updated commute advice',
      author: 'Forged',
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.title, 'Updated commute advice');
    assert.equal(updated.data.author, 'Alex');
    assert.equal((await send('/' + id, 'DELETE', 'owner')).status, 204);
    assert.equal((await send('/' + id, 'DELETE', 'owner')).status, 404);
    assert.equal((await send('/bad-id', 'PUT', 'owner', input)).status, 400);

    const demoId = new ObjectId();
    records.set(demoId.toString(), { ...input, _id: demoId, author: 'HuskyKit Demo' });
    assert.equal((await send('/' + demoId, 'DELETE', 'owner')).status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
