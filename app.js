const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const routes = require("./server/routes/routes.js");
const bcryptjs = require('bcryptjs'); // Verwende bcryptjs statt bcrypt
const session = require("express-session");
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');

app.use(methodOverride('_method'));
app.use(express());
app.use(fileUpload());

// Verwendet Umgebungsvariablen, falls diese gesetzt sind
require('dotenv').config();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

// Konfiguriert die Session mit MongoDB Store
app.use(session({
  secret: 'dein_geheimes_schlüsselwort',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://omkha7788:Dnd7kNWZhGlYh4TS@projectdb.5x0ub.mongodb.net/?retryWrites=true&w=majority&appName=ProjectDB',
  }),
  cookie: { secure: false }
}));

app.use("/", routes);

// Verbinde dich mit MongoDB (ohne die veralteten Optionen)
mongoose.connect(
  "mongodb+srv://omkha7788:Dnd7kNWZhGlYh4TS@projectdb.5x0ub.mongodb.net/?retryWrites=true&w=majority&appName=ProjectDB", 
  { 
    bufferCommands: false, // Deaktiviert das Pufferung von Abfragen
    serverSelectionTimeoutMS: 5000, // Timeout für die Verbindung nach 5 Sekunden
  })
  .then(() => {
    console.log("MongoDB verbunden");
  })
  .catch((error) => {
    console.error("Fehler bei der MongoDB-Verbindung: " + error.message);
  });

// Bei erfolgreicher Verbindung MongoDB-Verbindung öffnen
mongoose.connection.once('open', () => {
  console.log("MongoDB-Verbindung erfolgreich hergestellt");

  // Hier kannst du deine Abfragen durchführen, z.B.:
  // Config.findOne({}).then(result => { console.log(result); }).catch(err => { console.error(err); });
});

mongoose.connection.on('error', (error) => {
  console.error("Fehler bei der MongoDB-Verbindung: " + error);
});

// Macht 'user' global verfügbar
app.use((req, res, next) => {
  res.locals.user = req.session.check || null; // Macht 'user' global verfügbar
  next();
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
