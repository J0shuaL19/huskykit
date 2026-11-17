// Uses a real MongoDB database created just for this test. Never drops the configured app database.
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const { MongoClient } = require('mongodb');
const { createApp } = require('../src/app');
const { buildAcademicPosts } = require('../scripts/seedAcademic');

test(
  'real MongoDB: Passport sessions, academic CRUD, filters, and ownership',
  { skip: !process.env.MONGODB_TEST_URI },
  async (t) => {
    const client = new MongoClient(process.env.MONGODB_TEST_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    const db = client.db('huskykit_test_' + randomUUID().replaceAll('-', ''));
    t.after(async () => {
      await db.dropDatabase();
      await client.close();
    });
    const options = { secret: randomUUID(), production: false };
    const app = await createApp(db, options);
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const base = 'http://127.0.0.1:' + server.address().port;

    function browser() {
      let cookie = '';
      return async (path, method = 'GET', body, extra = {}) => {
        const response = await fetch(base + '/api' + path, {
          method,
          headers: {
            ...(cookie ? { Cookie: cookie } : {}),
            ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'X-HuskyKit': '1' } : {}),
            ...extra,
          },
          ...(method !== 'GET' ? { body: JSON.stringify(body ?? {}) } : {}),
        });
        const newCookie = response.headers.get('set-cookie');
        if (newCookie) cookie = newCookie.split(';')[0];
        return {
          status: response.status,
          data: response.status === 204 ? null : await response.json(),
          cookie,
        };
      };
    }
    const anonymous = browser();
    const author = browser();
    const other = browser();
    const password = 'integration-passphrase';
    const sample = {
      title: 'Planning CS 5610 group work',
      topic: 'group-projects',
      program: 'Computer Science',
      courseCode: 'cs 5610',
      body: 'We defined small tasks and reviewed each change before merging our project.',
      tips: 'Agree on the API fields first.',
    };

    await t.test('registration validation, unique username, and safe user data', async () => {
      assert.equal(
        (
          await anonymous('/auth/register', 'POST', {
            username: 'bad',
            displayName: 'A',
            password: 'short',
          })
        ).status,
        400,
      );
      const registered = await author('/auth/register', 'POST', {
        username: 'Daniel',
        displayName: 'Daniel Demo',
        password,
      });
      assert.equal(registered.status, 201);
      assert.deepEqual(Object.keys(registered.data.user).sort(), ['displayName', 'id', 'username']);
      assert.equal(registered.data.user.username, 'daniel');
      const stored = await db.collection('users').findOne({ username: 'daniel' });
      assert.notEqual(stored.passwordHash, password);
      assert.equal(
        (
          await anonymous('/auth/register', 'POST', {
            username: 'DANIEL',
            displayName: 'Duplicate',
            password,
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await other('/auth/register', 'POST', {
            username: 'maya',
            displayName: 'Maya Demo',
            password,
          })
        ).status,
        201,
      );
    });

    let id;
    let authorId;
    await t.test('create and read use authenticated author; visitors cannot write', async () => {
      assert.equal((await anonymous('/academic-posts', 'POST', sample)).status, 401);
      assert.equal(
        (await author('/academic-posts', 'POST', { ...sample, body: 'short' })).status,
        400,
      );
      const created = await author('/academic-posts', 'POST', {
        ...sample,
        authorId: 'forged',
        author: 'Fake author',
        isSynthetic: true,
      });
      assert.equal(created.status, 201);
      id = created.data.id;
      authorId = created.data.authorId;
      assert.equal(created.data.author, 'Daniel Demo');
      assert.equal(created.data.isSynthetic, false);
      assert.equal(created.data.courseCode, 'CS 5610');
      assert.equal((await anonymous('/academic-posts/' + id)).data.id, id);
      assert.equal((await anonymous('/academic-posts/not-an-id')).status, 400);
      assert.equal((await anonymous('/academic-posts/000000000000000000000000')).status, 404);
      assert.equal(
        (await author('/academic-posts', 'POST', sample, { 'X-HuskyKit': '' })).status,
        415,
      );
    });

    await t.test(
      'only owner can update and delete; login persists through app restart',
      async () => {
        assert.equal((await other('/academic-posts/' + id, 'PUT', sample)).status, 403);
        assert.equal((await other('/academic-posts/' + id, 'DELETE')).status, 403);
        assert.equal((await anonymous('/academic-posts/' + id, 'DELETE')).status, 401);
        const edited = await author('/academic-posts/' + id, 'PUT', {
          ...sample,
          title: 'Updated group project advice',
          authorId: 'forged',
        });
        assert.equal(edited.status, 200);
        assert.equal(edited.data.title, 'Updated group project advice');
        assert.equal(edited.data.authorId, authorId);
        const current = await author('/auth/me');
        const secondApp = await createApp(db, options);
        const secondServer = secondApp.listen(0, '127.0.0.1');
        await once(secondServer, 'listening');
        try {
          const response = await fetch(
            'http://127.0.0.1:' + secondServer.address().port + '/api/auth/me',
            { headers: { Cookie: current.cookie } },
          );
          assert.equal((await response.json()).user.id, authorId);
        } finally {
          await new Promise((resolve) => secondServer.close(resolve));
        }
        assert.equal((await author('/academic-posts/' + id, 'DELETE')).status, 204);
        assert.equal((await anonymous('/academic-posts/' + id)).status, 404);
      },
    );

    await t.test('logout invalidates session and local login verifies password', async () => {
      const old = await author('/auth/me');
      assert.equal((await author('/auth/logout', 'POST')).status, 200);
      const replay = await fetch(base + '/api/auth/me', { headers: { Cookie: old.cookie } });
      assert.equal((await replay.json()).user, null);
      assert.equal((await author('/academic-posts', 'POST', sample)).status, 401);
      assert.equal(
        (await author('/auth/login', 'POST', { username: 'daniel', password: 'wrong-password' }))
          .status,
        401,
      );
      assert.equal(
        (await author('/auth/login', 'POST', { username: 'DANIEL', password })).status,
        200,
      );
      assert.equal((await author('/auth/me')).data.user.id, authorId);
    });

    await t.test(
      'seed is idempotent; filters, literal search, pagination, and campus reads work',
      async () => {
        const collection = db.collection('academicPosts');
        await collection.createIndex(
          { seedKey: 1 },
          { unique: true, partialFilterExpression: { seedKey: { $exists: true } } },
        );
        const operations = buildAcademicPosts().map((post) => ({
          updateOne: {
            filter: { seedKey: post.seedKey },
            update: { $setOnInsert: post },
            upsert: true,
          },
        }));
        await collection.bulkWrite(operations);
        await collection.bulkWrite(operations);
        assert.equal(await collection.countDocuments({ isSynthetic: true }), 1000);
        const list = await anonymous('/academic-posts');
        assert.equal(list.data.total, 1000);
        assert.equal(list.data.posts.length, 20);
        const page2 = await anonymous('/academic-posts?page=2');
        assert.notEqual(list.data.posts[0].id, page2.data.posts[0].id);
        const filtered = await anonymous(
          '/academic-posts?topic=study-tips&program=Computer%20Science&courseCode=cs%205610&keyword=routine',
        );
        assert.ok(filtered.data.total > 0);
        for (const post of filtered.data.posts) {
          assert.equal(post.program, 'Computer Science');
          assert.equal(post.topic, 'study-tips');
          assert.equal(post.courseCode, 'CS 5610');
          assert.equal(post.seedKey, undefined);
        }
        assert.equal((await anonymous('/academic-posts?keyword=.%2A')).data.total, 0);
        assert.equal((await anonymous('/academic-posts?page=0')).status, 400);
        assert.equal((await anonymous('/academic-posts?keyword=a&keyword=b')).status, 400);
        const demoId = list.data.posts[0].id;
        assert.equal((await author('/academic-posts/' + demoId, 'DELETE')).status, 403);
        assert.equal((await anonymous('/campus-posts')).status, 200);
      },
    );
  },
);
