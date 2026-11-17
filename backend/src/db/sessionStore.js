const session = require('express-session');

// Keep sessions in MongoDB using the already-approved native driver.
class MongoSessionStore extends session.Store {
  constructor(collection) {
    super();
    this.collection = collection;
  }

  get(id, callback) {
    this.collection
      .findOne({ _id: id, expiresAt: { $gt: new Date() } })
      .then((record) => callback(null, record ? JSON.parse(record.data) : null))
      .catch(callback);
  }

  set(id, value, callback = () => {}) {
    const expiresAt = new Date(value.cookie.expires || Date.now() + 86400000);
    this.collection
      .updateOne(
        { _id: id },
        { $set: { data: JSON.stringify(value), expiresAt } },
        { upsert: true },
      )
      .then(() => callback(null))
      .catch(callback);
  }

  touch(id, value, callback = () => {}) {
    const expiresAt = new Date(value.cookie.expires || Date.now() + 86400000);
    this.collection
      .updateOne({ _id: id }, { $set: { expiresAt } })
      .then(() => callback(null))
      .catch(callback);
  }

  destroy(id, callback = () => {}) {
    this.collection
      .deleteOne({ _id: id })
      .then(() => callback(null))
      .catch(callback);
  }
}

module.exports = { MongoSessionStore };
