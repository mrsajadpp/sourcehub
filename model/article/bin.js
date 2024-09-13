const mongoose = require('mongoose');
const { Schema } = mongoose;

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    updated_at: {
        type: String,
        default: Date.now,
    },
    image: {
        type: String,
        required: true,
    },
});

const Article = mongoose.model('ArticleBin', articleSchema);

module.exports = Article;
