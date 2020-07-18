const express = require('express');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const path = require('path');
const helmet = require('helmet');

const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

require('dotenv').config();

const app = express();

mongoose.connect('mongodb+srv://ronvts:1210@cluster0.4ydad.mongodb.net/5f0ca8d7f6f5b272c3cb1027?retryWrites=true&w=majority',
{ useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(helmet());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;