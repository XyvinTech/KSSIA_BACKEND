const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({

    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
}, {
    timestamps: true,
});

const News = mongoose.model('News', newsSchema);

module.exports = News;