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

// Blog reading page
router.get("/:slug", async (req, res, next) => {
    try {
        let blog = await Article.findOne({ slug: req.params.slug }).lean();
        if (!blog) return res.status(404).send("Oops, Blog not found!");
        res.render("pages/blog_read", { title: blog.title, description: blog.description, blog });
    } catch (error) {
        res.status(500).send("Something went wrong from our end, please contact the administartor or developer :)");
    }
});

module.exports = router; 