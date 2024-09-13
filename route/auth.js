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

// Database Models Importing
const Article = require("../model/article/model");
const ArticleBin = require("../model/article/bin");
const { default: mongoose } = require('mongoose');

// Admin login page
router.get("/login", (req, res, next) => {
  try {
    res.render("pages/login", { title: "Login", description: "", admin: true });
  } catch (error) {
    res.status(500).send("Something went wrong from our end, please contact the administartor or developer :)");
  }
});

// Admin login POST
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (email == "admin@sourcehub.com" && password == "admin@1234") {
      req.session.logged = true;
      return res.redirect('/admin/');
    } else {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;