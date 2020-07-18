const jwt = require('jsonwebtoken'); // Plug-in sécurité connexion

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; //Récupère le token provenant de la requete
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId; //Extrait l'ID utilisateur du token
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Identifiant utilisateur invalide';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Requête invalide !')
    });
  }
};