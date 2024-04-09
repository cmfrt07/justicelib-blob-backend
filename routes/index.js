var express = require('express');
var router = express.Router();
const Article = require('../models/articles');
const verifyToken = require('../modules/authMiddleware')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



// Route pour créer un nouvel article
router.post('/create-article', verifyToken, async (req, res) => {
  const { title, imageUrl, categorie, content, date } = req.body;
  try {
      const newArticle = new Article({
          titre: title,
          url: imageUrl,
          categorie: categorie,
          content: content,
          date: date,
      });
      const savedArticle = await newArticle.save();
      res.status(201).json(savedArticle);
  } catch (error) {
      console.error('Error saving article:', error);
      res.status(500).json({ message: "Error saving the article" });
  }
});

router.get('/get-articles', async (req, res) => {
  try {
      const articles = await Article.find({});
      res.status(200).json(articles);
  } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: "Error fetching the articles" });
  }
});


// Route pour trouver un article par son ID
router.get('/articles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Error fetching the article' });
  }
});

// Route pour mettre à jour un article existant
router.put('/update-articles/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { titre, content, imageUrl, categorie } = req.body;

  try {
    // Utilisez 'url' comme clé pour correspondre à votre schéma de base de données
    const updatedArticle = await Article.findByIdAndUpdate(id, {
      titre,
      content,
      url: imageUrl, // Enregistrez 'imageUrl' comme 'url' dans la base de données
      categorie
    }, { new: true }); // L'option { new: true } renvoie l'article après la mise à jour

    if (!updatedArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Error updating the article' });
  }
});

// Route pour supprimer un article par son ID
router.delete('/articles/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
      const deletedArticle = await Article.findByIdAndDelete(id);
      if (!deletedArticle) {
          return res.status(404).json({ message: 'Article not found' });
      }
      res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ message: 'Error deleting the article' });
  }
});







module.exports = router;
