const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth'); //Applique le middleware à toutes les routes
const multer = require('../middleware/multer-config');

router.get('/', auth, sauceCtrl.getAllSauces); // Afficher toutes les sauces
router.post('/', auth, multer, sauceCtrl.createSauce); //Création nouvel sauce
router.get('/:id', auth, sauceCtrl.getOneSauce); // Afficher une sauce
router.put('/:id', auth, multer, sauceCtrl.modifySauce); // Mise à jour
router.delete('/:id', auth, sauceCtrl.deleteSauce); // Supprimer une sauce
router.post('/:id/like', auth, sauceCtrl.reactToSauce); // Like/dislike

module.exports = router;