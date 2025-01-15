const express = require("express");
const app = express();
const compression = require("compression"); // Compression Middleware hinzugefügt
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const routes = require("./server/routes/routes.js");
const bcryptjs = require('bcryptjs'); // Verwende bcryptjs statt bcrypt
const session = require("express-session");
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Middleware konfigurieren
app.use(compression()); // Aktiviert GZIP-Kompression
app.use(flash());
app.use(methodOverride('_method'));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// Session-Management optimieren
app.use(
  session({
    secret: 'dein_geheimes_schlüsselwort',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb+srv://omkha7788:Dnd7kNWZhGlYh4TS@projectdb.5x0ub.mongodb.net/?retryWrites=true&w=majority&appName=ProjectDB',
      touchAfter: 24 * 3600, // Reduziert häufige Session-Updates
    }),
    cookie: {
      secure: false,
      httpOnly: true, // Schützt Cookies vor JavaScript-Zugriff
      maxAge: 24 * 60 * 60 * 1000, // 1 Tag
    },
  })
);

// MongoDB-Verbindung optimieren
mongoose
  .connect(process.env.MONGO_URI || 'mongodb+srv://omkha7788:Dnd7kNWZhGlYh4TS@projectdb.5x0ub.mongodb.net/?retryWrites=true&w=majority&appName=ProjectDB', {
    bufferCommands: false,
    maxPoolSize: 10, // Begrenze die Anzahl paralleler Verbindungen
    serverSelectionTimeoutMS: 5000, // Timeout für die Verbindung nach 5 Sekunden
    socketTimeoutMS: 45000, // Timeout für Inaktivität
  })
  .then(() => console.log("MongoDB verbunden"))
  .catch((error) => console.error("Fehler bei der MongoDB-Verbindung:", error.message));

// Eventlistener für Verbindungsstatus
mongoose.connection.once("open", () => console.log("MongoDB-Verbindung erfolgreich hergestellt"));
mongoose.connection.on("error", (error) => console.error("MongoDB-Verbindungsfehler:", error));

// Benutzer global verfügbar machen
app.use((req, res, next) => {
  res.locals.user = req.session.check || null;
  next();
});

// Routes laden
app.use("/", routes);

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
