const Sauce = require('../models/sauces'); //Importe le modèle sauce
const fs = require('fs'); //Importe le plugin file system

//Création d'une sauce 
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //Transforme le JSON en objet JS
  const sauce = new Sauce({ //Nouvel objet sauce
    ...sauceObject, // Copie les éléments de req.body
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save() //Enregistre l'objet sauce dans la base de données
    .then( () => res.status(201).json( { message: 'Sauce enregistrée !' }))
    .catch( error => res.status(400).json( { error } ));
};

// Afficher une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

// Afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find() //Récupère les sauces dans la base de données
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? { // Si le fichier existe
    ...JSON.parse(req.body.sauce), // Récupère le string et parse en objet
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //Modifie l'url de l'image
  } : { ...req.body }; //Si le fichier n'existe pas, traite l'objet entrant
  Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id}) //Crée une instance de Sauce à partir de sauceObject
    .then( () => res.status(200).json({ message: 'Sauce modifiée avec succès !' }))
    .catch( (error) => res.status(400).json({ error: error }));
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]; //Récupère le nom du fichier
      fs.unlink(`images/${filename}`, () => { //Efface le fichier
        Sauce.deleteOne({_id: req.params.id}) //Supprime la sauce de la base de données
          .then( () => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch((error) => res.status(400).json({ error: error }));
        });
    })
    .catch(error => res.status(500).json({ error })); //Erreur serveur
};

// Like/dislike sauce
exports.reactToSauce = (req, res, next) => {
  if (req.body.like === 1) { // Un utilisateur like une sauce
    Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }) // on ajoute 1 like et push l'array usersLiked
      .then((sauce) => res.status(200).json({ message: 'Un like de plus !' }))
      .catch(error => res.status(400).json({ error }));
  } else if (req.body.like === -1) { // Dislike une sauce
    Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }) // on ajoute 1 dislike et push l'array usersDisliked
      .then((sauce) => res.status(200).json({ message: 'Un dislike de plus !' }))
      .catch(error => res.status(400).json({ error }));
  } else { // L'utilisateur enlève son like ou dislike
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
          if (sauce.usersLiked.includes(req.body.userId)) { // si l'array userLiked contient le id de like
              Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }) // $pull vide l'array userLiked et enlève un like afin qu'un même utilisateur ne puisse liker plusieurs fois
                  .then((sauce) => { res.status(200).json({ message: 'Un like de moins !' }) })
                  .catch(error => res.status(400).json({ error }))
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
              Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                  .then((sauce) => { res.status(200).json({ message: 'Un dislike de moins !' }) })
                  .catch(error => res.status(400).json({ error }))
          }
      })
      .catch(error => res.status(400).json({ error }));
    }
};
