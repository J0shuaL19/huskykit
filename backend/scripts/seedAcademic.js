const { connectDatabase, closeDatabase } = require('../src/db/client');
const { TOPICS, PROGRAMS } = require('../src/db/academic');

const EXAMPLES = [
  [
    'Organizing a weekly study routine',
    'I split practice into short sessions and kept a list of questions to revisit before each class.',
    'Try one focused session, then adjust the length to suit your schedule.',
  ],
  [
    'Planning a balanced course schedule',
    'I drafted a weekly calendar before registration to compare class hours, independent study, and commuting time.',
    'Verify prerequisites and availability with the official course catalog.',
  ],
  [
    'Keeping a group project on track',
    'Our demo team agreed on small tasks, documented shared API fields, and reviewed progress at a weekly check-in.',
    'Agree on responsibilities and a simple definition of done before coding.',
  ],
  [
    'Making the most of academic resources',
    'I prepared questions before office hours and wrote a short summary afterward to check my understanding.',
    'Check current office hours and official resource pages before visiting.',
  ],
];

function buildAcademicPosts(count = 1000) {
  return Array.from({ length: count }, (_, index) => {
    const topicIndex = index % TOPICS.length;
    const program = PROGRAMS[Math.floor(index / TOPICS.length) % PROGRAMS.length];
    const courseCode = ['CS 5610', 'INFO 6150', 'DS 5220', ''][Math.floor(index / 16) % 4];
    const [title, body, tips] = EXAMPLES[topicIndex];
    const date = new Date(Date.UTC(2026, 0, 1 + (index % 180)));
    return {
      seedKey: 'academic-v1-' + String(index + 1).padStart(4, '0'),
      isSynthetic: true,
      title: `${title} — demo ${index + 1}`,
      topic: TOPICS[topicIndex],
      program,
      courseCode,
      body: `${body}\n\nSynthetic example for testing HuskyKit, not a verified student experience or official course advice.`,
      tips,
      author: 'HuskyKit Demo',
      createdAt: date,
      updatedAt: date,
    };
  });
}

async function seedAcademic() {
  try {
    const db = await connectDatabase();
    const collection = db.collection('academicPosts');
    await collection.createIndex(
      { seedKey: 1 },
      { unique: true, partialFilterExpression: { seedKey: { $exists: true } } },
    );
    let inserted = 0;
    const posts = buildAcademicPosts();
    for (let offset = 0; offset < posts.length; offset += 250) {
      const result = await collection.bulkWrite(
        posts.slice(offset, offset + 250).map((post) => ({
          updateOne: {
            filter: { seedKey: post.seedKey },
            update: { $setOnInsert: post },
            upsert: true,
          },
        })),
      );
      inserted += result.upsertedCount;
    }
    console.log(`Academic demo posts inserted: ${inserted}`);
    console.log(
      `Academic demo posts in database: ${await collection.countDocuments({ isSynthetic: true })}`,
    );
  } finally {
    await closeDatabase();
  }
}

if (require.main === module)
  seedAcademic().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
module.exports = { buildAcademicPosts };
