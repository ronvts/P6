const express = require('express'); //Framework Express : création et gestion du serveur
const mongoose = require('mongoose'); //Connexion à la base de données
const bodyParser = require('body-parser'); //Extrait l'objet JSON des requêtes en objet JS
const path = require('path'); //Chemin des dossiers/fichiers
const helmet = require('helmet'); //Protection des requêtes HTTP - headers

const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const app = express();

require('dotenv').config({ path: process.cwd() + '/db' }); //Masque les informations de connexion à la db

//Connexion à la base données MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
{ useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(helmet());

app.use((req, res, next) => { //Autorisation CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); //Accès à l'API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Ajoute les headers aux requêtes envoyées à l' API
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //Envoie des requêtes avec ces méthodes
    next();
  });

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images'))); //Dossier images

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;