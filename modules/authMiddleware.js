const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).send({ message: 'Token not supplied' });
    }

    // Extraire le token de l'en-tête Authorization
    const token = authHeader.split(' ')[1]; // Sépare "Bearer" du token

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Token authentication failed" });
        }

        req.user = decoded;
        next();
    });
}

module.exports = verifyToken;
