const bcrypt = require('bcrypt'); //Plug-in hachage du mot de passe
const jwt = require('jsonwebtoken'); //Plug-in sécurité connexion avec token unique
const mailValidator = require('email-validator');
const passwordValidator = require('password-validator'); //Sécurité mot de passe

const User = require('../models/user'); //Importation model User

var schema = new passwordValidator();

schema
.is().min(8) //Minimum 8 caractères
.is().max(50) // Maximum 50 caractères
.has().digits() // Doit contenir des chiffres
.has().not().spaces(); // Ne doit pas contenir d'espace

//Middleware inscription
exports.signup = (req, res, next) => {
    if (!mailValidator.validate(req.body.email) || (!schema.validate(req.body.password))) {
        throw { error: "Merci de bien vouloir entrer une adresse email et un mot de passe valide !" }
    } else if (mailValidator.validate(req.body.email) && (schema.validate(req.body.password))) {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error: 'Votre mot de passe doit faire entre 8 et 30 caractères et ne peut pas contenir un espace' }));
    }
};

//Middleware connexion
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !'})
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !'})
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};
