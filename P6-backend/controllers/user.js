const bcrypt = require('bcrypt'); //Plug-in hachage du mot de passe
const jwt = require('jsonwebtoken'); //Plug-in sécurité connexion avec token unique
const mailValidator = require('email-validator');
const passwordValidator = require('password-validator');

const User = require('../models/user'); //Importation model User

var schema = new passwordValidator();

schema
.is().min(8) //Minimum 8 caractères
.is().max(50) //Maximum 50 caractères
.has().not().spaces(); //Ne doit pas contenir d'espace

// Inscription utilisateur
exports.signup = (req, res, next) => {
    if (!mailValidator.validate(req.body.email) || (!schema.validate(req.body.password))) {
        throw { error: "Votre mot de passe doit faire entre 8 et 30 caractères et ne peut pas contenir d'espace" }
    } else if (mailValidator.validate(req.body.email) && (schema.validate(req.body.password))) {
    bcrypt.hash(req.body.password, 10) // Hachage du mdp sur 10 tours de l'algorithme
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save() //Sauvegarde nouvel user dans la base de données
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    }
};

// Connexion utilisateur
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // Cherche l'utilisateur dans la base de données
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !'})
            }
            bcrypt.compare(req.body.password, user.password) //Compare le password avec celui enregistré
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !'})
                    }
                    res.status(200).json({
                        userId: user._id, //Identifiant utilisateur dans la base de données
                        token: jwt.sign(
                            { userId: user._id },
                            'e116aa13db1443148620f1b728b509b4',
                            { expiresIn: '24h' } //Temps de validité du token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};
