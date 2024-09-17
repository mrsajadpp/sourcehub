const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
var geoip = require('geoip-lite');
const cheerio = require('cheerio');

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
const { listen } = require('express/lib/application');

// Blogs list page
router.get("/", auth.verifyAdmin, async (req, res, next) => {
    try {
        let blogs = await Article.find().sort({ _id: -1 }).lean();
        res.render("pages/admin/blogs", { title: "", description: "", admin: true, blogs });
    } catch (error) {
        res.status(500).send("Something went wrong from our end, please contact the administartor or developer :)");
    }
});

// Blog writing GET
router.get("/blog/write", auth.verifyAdmin, (req, res, next) => {
    try {
        res.render("pages/admin/write_blog", { title: "", description: "", admin: true });
    } catch (error) {
        res.status(500).send("Something went wrong from our end, please contact the administartor or developer :)");
    }
});

// Blog writing POST
router.post('/blog/write', auth.verifyAdmin, async (req, res) => {
    try {
        const { title, description, content } = req.body;

        if (!title) res.render("write_blog", { title: "Write Blog", title, description, content, error: "Title is required" });
        if (!description) res.render("write_blog", { title: "Write Blog", title, description, content, error: "Description is required" });
        if (!content) res.render("write_blog", { title: "Write Blog", title, description, content, error: "Content is required" });

        let slug = await format.generateSlug(title);

        // Load the HTML into Cheerio
        const $ = await cheerio.load(content);

        // Find the first image and get its 'src' attribute
        const firstImageSrc = await $('img').first().attr('src');

        let blog = new Article({
            title,
            description,
            content,
            updated_at: new Date(),
            slug: slug,
            image: firstImageSrc ? firstImageSrc : "no"
        });

        await blog.save();

        res.redirect('/admin/');

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Blog updating GET
router.get("/blog/update/:blog_id", auth.verifyAdmin, async (req, res, next) => {
    try {
        let blog = await Article.findOne({ _id: new mongoose.Types.ObjectId(req.params.blog_id) }).lean();
        res.render("pages/admin/update_blog", { title: "", description: "", admin: true, blog });
    } catch (error) {
        res.status(500).send("Something went wrong from our end, please contact the administartor or developer :)");
    }
});

// Blog updating POST
router.post('/blog/update/:blog_id', auth.verifyAdmin, async (req, res) => {
    try {
        const { title, description, content } = req.body;

        if (!title) res.render("write_blog", { title: "Write Blog", title, description, content, blog_id, error: "Title is required" });
        if (!description) res.render("write_blog", { title: "Write Blog", title, description, content, blog_id, error: "Description is required" });
        if (!content) res.render("write_blog", { title: "Write Blog", title, description, content, blog_id, error: "Content is required" });
        if (!req.params.blog_id) res.render("write_blog", { title: "Write Blog", title, description, content, blog_id, error: "Blog ID is required" });

        let blog = await Article.findOne({ _id: new mongoose.Types.ObjectId(req.params.blog_id) }).lean();

        if (!blog) res.render("write_blog", { title: "Write Blog", title, description, content, blog_id: req.params.blog_id, error: "Blog not found" });

        // Load the HTML into Cheerio
        const $ = await cheerio.load(content);

        // Find the first image and get its 'src' attribute
        const firstImageSrc = await $('img').first().attr('src');

        await Article.updateOne({ _id: new mongoose.Types.ObjectId(req.params.blog_id) }, {
            title,
            description,
            content,
            updated_at: new Date(),
            image: firstImageSrc
        });

        res.redirect('/admin/');

    } catch (error) {
        console.error(error);
        
        res.status(500).json({ error: 'Server error' });
    }
});

// Blog deletting POST
router.get('/blog/delete/:blog_id', auth.verifyAdmin, async (req, res) => {
    try {
        const { blog_id } = req.params;

        if (!blog_id) res.render("write_blog", { title: "Write Blog", title, description, content, blog_id, error: "Blog ID is required" });

        let blog = await Article.findOne({ _id: new mongoose.Types.ObjectId(blog_id) }).lean();

        if (!blog) res.render("write_blog", { title: "Write Blog", title, description, content, blog_id, error: "Blog not found" });

        await Article.deleteOne({ _id: new mongoose.Types.ObjectId(blog_id) });

        res.redirect('/admin/');

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;