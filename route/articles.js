const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
var geoip = require('geoip-lite');

// Utils
const validator = require("../util/validate");
const unique = require("../util/unique");
const { sendMail } = require("../util/email");
const date = require("../util/date");
const format = require("../util/format");

// Middleware
const auth = require("../middleware/auth");

// Database Models Importing
const Article = require("../model/article/model");
const ArticleBin = require("../model/article/bin");
const { default: mongoose } = require('mongoose');


// Request article for review
router.post('/request/review', auth.verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            body
        } = req.body;

        const { user_id } = req;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        if (!body) {
            return res.status(400).json({ error: 'Article content is required' });
        }

        let user = await User.findOne({ _id: new mongoose.Types.ObjectId(user_id) }).lean();

        if (!user) {
            return res.status(400).json({ error: 'User is not exist' });
        }

        let articles = await Article.find().lean();

        // Image need to save to the server

        let keywords = await scrap.extractKeywordsUsingTFIDF(body, articles);

        let article = new ArticlePending({
            author_id: user._id,
            title: title,
            description: description,
            keywords,
            body: body,
            created_time: new Date(),
            slug: await format.generateSlug(title),
            updated_at: new Date()
        });

        await article.save();

        return res.status(200).json({ message: 'Article succesfully submitted for review' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Fetching article authenticated user
router.post('/auth/fetch', auth.verifyToken, async (req, res) => {
    try {
        const {
            slug
        } = req.body;

        if (!slug) {
            return res.status(400).json({ error: 'Slug is required' });
        }

        let article = await Article.findOne({ slug: slug }).lean();

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Increment views and impressions
        await Article.updateOne({ _id: article._id }, { views: article.views += 1, impressions: article.impressions += 1 });

        interaction.updateUserInterests(req.user_id, article._id, 'click')
            .then(() => {
                return res.status(200).json({ article, message: 'User interests updated successfully' });
            })
            .catch(err => {
                return res.status(500).json({ error: 'Error updating user interests:' + err })
            });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Fetching article none authenticated user
router.post('/fetch', async (req, res) => {
    try {
        const {
            slug
        } = req.body;

        if (!slug) {
            return res.status(400).json({ error: 'Slug is required' });
        }

        let article = await Article.findOne({ slug: slug }).lean();

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Increment views and impressions
        await Article.updateOne({ _id: article._id }, { views: article.views += 1, impressions: article.impressions += 1 });

        return res.status(200).json({ article });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Fetching articles authenticated user
router.post('/auth/list/fetch/recomended', auth.verifyToken, async (req, res) => {
    try {
        let recommendedArticles = await interaction.getRecommendedArticles(req.user_id);
        return res.status(200).json({ articles: recommendedArticles });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Fetching articles none authenticated user
router.post('/list/fetch', auth.verifyToken, async (req, res) => {
    try {
        let articles = await Article.find().lean();
        return res.status(200).json({ articles });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Fetchign personal articles
router.post('/list/personal/fetch', auth.verifyToken, async (req, res) => {
    try {
        let articles = await Article.find({ author_id: new mongoose.Types.ObjectId(req.user_id) }).lean();
        return res.status(200).json({ articles });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Update published article
router.post('/update', auth.verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            body,
            article_id
        } = req.body;

        const { user_id } = req;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        if (!body) {
            return res.status(400).json({ error: 'Article content is required' });
        }
        if (!article_id) {
            return res.status(400).json({ error: 'Article ID is required' });
        }

        let user = await User.findOne({ _id: new mongoose.Types.ObjectId(user_id) }).lean();

        if (!user) {
            return res.status(400).json({ error: 'User is not exist' });
        }

        let article = await Article.findOne({ _id: new mongoose.Types.ObjectId(article_id) }).lean();

        if (!article) {
            return res.status(400).json({ error: 'Article is not exist' });
        }

        let articles = await Article.find().lean();

        // Image need to save to the server

        let keywords = await scrap.extractKeywordsUsingTFIDF(body, articles);

        await Article.updateOne({ _id: article._id }, { title, description, body, keywords });

        return res.status(200).json({ message: 'Article succesfully updated' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Update pending article 
router.post('/pending/update', auth.verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            body,
            article_id
        } = req.body;

        const { user_id } = req;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        if (!body) {
            return res.status(400).json({ error: 'Article content is required' });
        }
        if (!article_id) {
            return res.status(400).json({ error: 'Article ID is required' });
        }

        let user = await User.findOne({ _id: new mongoose.Types.ObjectId(user_id) }).lean();

        if (!user) {
            return res.status(400).json({ error: 'User is not exist' });
        }

        let article = await ArticlePending.findOne({ _id: new mongoose.Types.ObjectId(article_id) }).lean();

        if (!article) {
            return res.status(400).json({ error: 'Article is not exist' });
        }

        let articles = await ArticlePending.find().lean();

        // Image need to save to the server

        let keywords = await scrap.extractKeywordsUsingTFIDF(body, articles);

        await ArticlePending.updateOne({ _id: article._id }, { title, description, body, keywords });

        return res.status(200).json({ message: 'Article succesfully updated' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Liking article
router.post('/auth/like', auth.verifyToken, async (req, res) => {
    try {
        let { article_id } = req.body;
        if (!article_id) {
            return res.status(400).json({ error: "Article ID is required" });
        }
        let article = await Article.findOne({ _id: new mongoose.Types.ObjectId(article_id) }).lean();
        if (!article) {
            return res.status(400).json({ error: "Article not found" });
        }

        interaction.updateUserInterests(req.user_id, article._id, 'like')
            .then(() => {
                return res.status(200).json({ message: 'User interests updated successfully' });
            })
            .catch(err => {
                return res.status(500).json({ error: 'Error updating user interests:' + err })
            });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Article deletion
router.post('/delete', auth.verifyToken, async (req, res) => {
    try {
        let { article_id } = req.body;
        if (!article_id) {
            return res.status(400).json({ error: "Article ID is required" });
        }
        let article = await Article.findOne({ _id: new mongoose.Types.ObjectId(article_id), author_id: new mongoose.Types.ObjectId(req.user_id) }).lean();

        if (!article) {
            return res.status(400).json({ error: "Article is not found or article id is wrong" });
        }

        article.reason = await "Deleted by author";
        article.deleted_by_author = await true;

        let articleBin = new ArticleBin(article);
        await articleBin.save();

        await Article.deleteOne({ _id: article._id });

        return res.status(200).json({ message: "Article has been deleted succesfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Report article
router.post('/report', auth.verifyToken, async (req, res) => {
    try {
        let { article_id, reason } = req.body;
        if (!article_id) {
            return res.status(400).json({ error: "Article ID is required" });
        }
        if (!reason) {
            return res.status(400).json({ error: "Reason is required" });
        }
        let article = await Article.findOne({ _id: new mongoose.Types.ObjectId(article_id) }).lean();

        if (!article) {
            return res.status(400).json({ error: "Article is not found or article id is wrong" });
        }

        let existReport = await Report.findOne({ reporter_id: new mongoose.Types.ObjectId(req.user_id), article_id: new mongoose.Types.ObjectId(article_id) }).lean();

        if (!existReport) {
            let report = new Report({ reporter_id: new mongoose.Types.ObjectId(req.user_id), reason, article_id: new mongoose.Types.ObjectId(article_id), reported_time: new Date() });
            await report.save();
        }

        return res.status(200).json({ message: "Article has been reported succesfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 