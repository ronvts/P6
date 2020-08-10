const multer = require('multer');

const MIME_TYPES = { //Extension des images
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({ //Enregistrement sur le disk
  destination: (req, file, callback) => {
    callback(null, 'images'); // null : pas d'erreur, enregistrement dans le fichier images
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); //Remplace un espace par un underscore
    const extension = MIME_TYPES[file.mimetype]; //Génère l'extension du fichier
    callback(null, name + Date.now() + '.' + extension); //Génère le nom du fichier
  }
});

module.exports = multer({ storage: storage }).single('image'); //Fichier image uniquement