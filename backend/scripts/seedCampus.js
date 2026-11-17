const { connectDatabase, closeDatabase } = require('../src/db/client');

const TOPICS = ['housing', 'commuting', 'food', 'activities'];
const NEIGHBORHOODS = [
  'Fenway',
  'Mission Hill',
  'Back Bay',
  'Allston',
  'Cambridge',
  'Roxbury',
  'South End',
  'Downtown',
  'East Boston',
  'Brookline',
];
const BUDGET_LEVELS = ['low', 'medium', 'high'];

function buildCampusPosts(count = 1000) {
  return Array.from({ length: count }, (_, index) => {
    const topic = TOPICS[index % TOPICS.length];
    const neighborhood = NEIGHBORHOODS[Math.floor(index / TOPICS.length) % NEIGHBORHOODS.length];
    const budgetLevel =
      BUDGET_LEVELS[
        Math.floor(index / (TOPICS.length * NEIGHBORHOODS.length)) % BUDGET_LEVELS.length
      ];
    const date = new Date(Date.UTC(2026, 0, 1 + (index % 180)));

    return {
      seedKey: 'campus-v1-' + String(index + 1).padStart(4, '0'),
      isSynthetic: true,
      title: topic + ' in ' + neighborhood + ': demo note ' + (index + 1),
      topic,
      neighborhood,
      budgetLevel,
      location: neighborhood + ', Boston area',
      body: 'Synthetic example for browsing and testing HuskyKit. This is not a verified student experience.',
      tips: 'Check current prices, routes, and availability before making plans.',
      author: 'HuskyKit Demo',
      createdAt: date,
      updatedAt: date,
    };
  });
}

async function seedCampus() {
  const database = await connectDatabase();
  try {
    const collection = database.collection('campusPosts');
    await collection.createIndex(
      { seedKey: 1 },
      { unique: true, partialFilterExpression: { seedKey: { $exists: true } } },
    );

    let inserted = 0;
    const posts = buildCampusPosts();
    for (let offset = 0; offset < posts.length; offset += 250) {
      const operations = posts.slice(offset, offset + 250).map((post) => ({
        updateOne: {
          filter: { seedKey: post.seedKey },
          update: { $setOnInsert: post },
          upsert: true,
        },
      }));
      const result = await collection.bulkWrite(operations);
      inserted += result.upsertedCount;
    }
    console.log('Campus demo posts inserted: ' + inserted);
    console.log(
      'Campus demo posts in database: ' + (await collection.countDocuments({ isSynthetic: true })),
    );
  } finally {
    await closeDatabase();
  }
}

if (require.main === module) {
  seedCampus().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { buildCampusPosts };
