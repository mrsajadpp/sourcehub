const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const geoip = require('geoip-lite');
const mongoose = require('mongoose');

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

router.get("/", (req, res, next) => {
  try {
    res.render({})
  } catch (error) {
    res.send("Something went wrong from our end, please contact the administartor or developer :)");
  }
});

module.exports = router;