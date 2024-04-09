const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
  titre: String,
  url: String,
  categorie: String,
  content: String,
  date: Date,
});

const Article = mongoose.model('articles', articleSchema);

module.exports = Article;
