// Uses a randomly named test database and never drops the configured application database.
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomBytes, randomUUID } = require('node:crypto');
const { MongoClient } = require('mongodb');
const { createApp } = require('../src/app');

test(
  'real MongoDB: Campus CRUD, Passport sessions, and ownership',
  { skip: !process.env.MONGODB_TEST_URI },
  async () => {
    const client = new MongoClient(process.env.MONGODB_TEST_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    const databaseName = 'huskykit_test_c_' + randomUUID().replaceAll('-', '').slice(0, 20);
    let server;
    let connected = false;
    try {
      await client.connect();
      connected = true;
      const db = client.db(databaseName);
      const app = await createApp(db, {
        secret: randomBytes(32).toString('hex'),
        production: false,
      });
      server = app.listen(0, '127.0.0.1');
      await once(server, 'listening');
      const base = 'http://127.0.0.1:' + server.address().port;

      function browser() {
        let cookie = '';
        return async (path, method = 'GET', body) => {
          const response = await fetch(base + '/api' + path, {
            method,
            headers: {
              ...(cookie ? { Cookie: cookie } : {}),
              ...(method !== 'GET'
                ? { 'Content-Type': 'application/json', 'X-HuskyKit': '1' }
                : {}),
            },
            ...(method !== 'GET' ? { body: JSON.stringify(body ?? {}) } : {}),
          });
          const newCookie = response.headers.get('set-cookie');
          if (newCookie) cookie = newCookie.split(';')[0];
          return {
            status: response.status,
            data: response.status === 204 ? null : await response.json(),
          };
        };
      }

      const anonymous = browser();
      const author = browser();
      const other = browser();
      const sample = {
        title: 'Finding a good commute',
        topic: 'commuting',
        neighborhood: 'Fenway',
        budgetLevel: 'low',
        location: 'Near campus',
        body: 'This is a practical example of a student commuting experience.',
        tips: 'Check current schedules.',
      };

      assert.equal((await anonymous('/campus-posts', 'POST', sample)).status, 401);
      const registeredAuthor = await author('/auth/register', 'POST', {
        username: 'campusauthor',
        displayName: 'Alex Demo',
        password: 'integration-passphrase',
      });
      assert.equal(registeredAuthor.status, 201);
      assert.equal(
        (
          await other('/auth/register', 'POST', {
            username: 'campusother',
            displayName: 'Other Demo',
            password: 'integration-passphrase',
          })
        ).status,
        201,
      );

      const created = await author('/campus-posts', 'POST', {
        ...sample,
        authorId: 'forged',
        author: 'Fake author',
        isSynthetic: true,
      });
      assert.equal(created.status, 201);
      assert.equal(created.data.authorId, registeredAuthor.data.user.id);
      assert.equal(created.data.author, 'Alex Demo');
      assert.equal(created.data.isSynthetic, false);
      const id = created.data.id;
      assert.equal((await anonymous('/campus-posts/' + id)).status, 200);
      assert.equal((await other('/campus-posts/' + id, 'PUT', sample)).status, 403);
      assert.equal((await other('/campus-posts/' + id, 'DELETE')).status, 403);
      assert.equal(
        (await author('/campus-posts/' + id, 'PUT', { ...sample, body: 'short' })).status,
        400,
      );
      const updated = await author('/campus-posts/' + id, 'PUT', {
        ...sample,
        title: 'Updated commute advice',
        author: 'Forged',
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.data.title, 'Updated commute advice');
      assert.equal(updated.data.author, 'Alex Demo');
      assert.equal((await author('/campus-posts/' + id, 'DELETE')).status, 204);
      assert.equal((await anonymous('/campus-posts/' + id)).status, 404);

      const demo = await db.collection('campusPosts').insertOne({
        ...sample,
        author: 'HuskyKit Demo',
        isSynthetic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      assert.equal(
        (await author('/campus-posts/' + demo.insertedId.toString(), 'DELETE')).status,
        403,
      );
      assert.equal((await anonymous('/campus-posts?topic=commuting')).status, 200);
    } finally {
      if (server) {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
      }
      try {
        if (connected) await client.db(databaseName).dropDatabase();
      } finally {
        await client.close();
      }
    }
  },
);
