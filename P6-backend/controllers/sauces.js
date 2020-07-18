const Sauce = require('../models/sauces'); //Importe modèle sauce
const fs = require('fs'); //Importe package fs

//Middleware création sauce 
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //Extrait objet sauce
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Sauce enregistrée !'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//Middleware récupération des sauces par id
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ 
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

//Middleware modification sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  {  
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
  const sauce = new Sauce({
    _id: req.params.id,
    userId: req.body.userId,
    name: req.params.name,
    manufacturer: req.params.manufacturer,
    description: req.body.description,
    mainPepper: req.body.mainPepper,
    imageUrl: req.body.imageUrl,
    likes: req.body.likes,
    dislikes: req.body.dislikes,
    usersLiked: req.body.usersLiked,
    usersDisliked: req.body.usersDisliked
  });
  Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
  .then(
    () => {
      res.status(201).json({
        message: 'Sauce modifiée avec succès !'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//Middleware suppression sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({_id: req.params.id}).then(
          () => {
            res.status(200).json({
              message: 'Sauce supprimée !'
            });
          }
        ).catch(
          (error) => {
            res.status(400).json({
              error: error
            });
          }
        );
      });
    })
    .catch(error => res.status(500).json({ error }));
};

//Middleware récupération toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//Middleware like/dislike sauce
exports.reactToSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce => { 
    switch (req.body.like) {
        case 1 :
            if (!sauce.usersLiked.includes(req.body.userId)) {
              Sauce.updateOne({_id: req.params.id}, {$inc: {likes: 1}, $push: {usersLiked: req.body.userId}, _id: req.params.id})
              .then(() => res.status(201).json({ message: 'Like ajouté avec succès !' }))
              .catch((error) => {res.status(400).json({error: error});});
            }
          break;
  
        case -1 :
            if (!sauce.usersDisliked.includes(req.body.userId)) {
              Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: 1}, $push: {usersDisliked: req.body.userId}, _id: req.params.id})
          .then(() => res.status(201).json({ message: 'Dislike ajouté avec succès !' }))
          .catch(error => res.status(400).json({ error }));
            }
          break;
  
        case 0:
            if (sauce.usersLiked.includes(req.body.userId)) {
              Sauce.updateOne({_id: req.params.id}, {$inc: {likes: -1}, $pull: {usersLiked: req.body.userId}, _id: req.params.id})
              .then(() => res.status(201).json({ message: 'Like annulé avec succès !' }))
              .catch(error => res.status(400).json({ error }));
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
              Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: -1}, $pull: {usersDisliked: req.body.userId}, _id: req.params.id})
              .then(() => res.status(201).json({ message: 'Dislike annulé avec succès !' }))
              .catch(error => res.status(400).json({ error })); 
            }   
          break;
        
        default:
          throw { error: "Impossible de modifier vos likes, merci de bien vouloir réessayer ultérieurement" };
    }
  })
  .catch(error => res.status(400).json({ error }));
};
