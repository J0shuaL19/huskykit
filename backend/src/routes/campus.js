const express = require('express');
const { ObjectId } = require('mongodb');
const { requireAuth } = require('../auth/passport');
const { validateCampusPost } = require('../db/campus');

const FILTER_FIELDS = ['topic', 'neighborhood', 'budgetLevel'];

function publicPost(post) {
  const { _id, ...fields } = post;
  return { id: _id.toString(), ...fields };
}

function singleValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createCampusRouter(collection) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const page = Number(req.query.page || 1);
      if (!Number.isInteger(page) || page < 1 || page > 10000) {
        return res.status(400).json({ error: 'page must be an integer from 1 to 10000' });
      }

      const query = {};
      for (const field of FILTER_FIELDS) {
        const value = singleValue(req.query[field]);
        if (value) query[field] = value;
      }

      const keyword = singleValue(req.query.keyword);
      if (keyword.length > 100) {
        return res.status(400).json({ error: 'keyword must be 100 characters or fewer' });
      }
      if (keyword) {
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(safeKeyword, 'i');
        query.$or = [
          { title: pattern },
          { body: pattern },
          { tips: pattern },
          { location: pattern },
        ];
      }

      const pageSize = 20;
      const [posts, total] = await Promise.all([
        collection
          .find(query)
          .sort({ updatedAt: -1, _id: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        collection.countDocuments(query),
      ]);
      return res.json({ posts: posts.map(publicPost), page, pageSize, total });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }
      const post = await collection.findOne({ _id: new ObjectId(req.params.id) });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      return res.json(publicPost(post));
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', requireAuth, async (req, res) => {
    const { fields, error } = validateCampusPost(req.body);
    if (error) return res.status(400).json({ error });
    const post = {
      ...fields,
      authorId: req.user._id.toString(),
      author: req.user.displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
      isSynthetic: false,
    };
    const { insertedId } = await collection.insertOne(post);
    return res.status(201).json(publicPost({ ...post, _id: insertedId }));
  });

  async function requireOwner(req, res, next) {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid post ID' });
    req.postId = new ObjectId(req.params.id);
    const post = await collection.findOne({ _id: req.postId });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the author can change this post.' });
    }
    return next();
  }

  router.put('/:id', requireAuth, requireOwner, async (req, res) => {
    const { fields, error } = validateCampusPost(req.body);
    if (error) return res.status(400).json({ error });
    const post = await collection.findOneAndUpdate(
      { _id: req.postId, authorId: req.user._id.toString() },
      { $set: { ...fields, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.json(publicPost(post));
  });

  router.delete('/:id', requireAuth, requireOwner, async (req, res) => {
    const result = await collection.deleteOne({
      _id: req.postId,
      authorId: req.user._id.toString(),
    });
    if (!result.deletedCount) return res.status(404).json({ error: 'Post not found' });
    return res.status(204).end();
  });

  return router;
}

module.exports = { createCampusRouter };
