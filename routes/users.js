var express = require('express');
var router = express.Router();
require('../models/connection');
require('dotenv').config();
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const { validateEmail } = require('../modules/validator');
const verifyToken = require('../modules/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



//Route pour refresh mon token
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.decode(token, { complete: true });
    const exp = decoded.payload.exp;
    const currentUnixTime = Math.floor(Date.now() / 1000);

    if (exp - currentUnixTime < 10 * 60) {
      const user = await User.findById(decoded.payload._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newToken = jwt.sign(
        { _id: user._id, email: user.email},
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({ token: newToken });
    } else {
      return res.status(200).json({ message: "Token is still valid" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



//Route verifier si le token est toujours valide
router.post('/verify-token', verifyToken, (req, res) => {
  // Si le middleware ne renvoie pas d'erreur, le token est valide
  return res.status(200).json({ message: "Token is valid" });
});



router.post('/register', async (req, res) => {
  let { email, password } = req.body;

  // Vérification des champs requis
  let requiredFields = ['email', 'password'];
  if (!checkBody(req.body, requiredFields)) {
    return res.status(400).json({ result: false, message: 'Missing required fields' });
  }

  // Normalisation de l'email
  email = email ? email.toLowerCase() : '';

  // Validation du format de l'email
  if (!validateEmail(email)) {
    return res.status(400).json({ result: false, message: 'Invalid email format' });
  }

  try {
    // Vérification de l'existence de l'utilisateur
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ result: false, message: 'A user with this email already exists' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    // Enregistrement de l'utilisateur
    await newUser.save();

    // Génération du token JWT
    const token = jwt.sign({ _id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Réponse de succès
    const response = {
      result: true,
      message: 'User successfully created.',
      token,
      email: newUser.email,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, message: 'Internal server error' });
  }
});


router.post('/signin', async (req, res) => {
  let { email, password } = req.body;

  // Vérification des champs requis
  if (!email || !password) {
    return res.status(400).json({ result: false, message: 'Email and password are required' });
  }

  // Normalisation de l'email
  email = email.toLowerCase();

  try {
    // Vérification de l'existence de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ result: false, message: 'User not found' });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ result: false, message: 'Invalid password' });
    }

    // Génération du token JWT
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Réponse de succès avec token
    return res.status(200).json({
      result: true,
      message: 'User successfully logged in.',
      token,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, message: 'Internal server error' });
  }
});




module.exports = router;
