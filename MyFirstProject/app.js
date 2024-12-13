const express = require("express"); 
const app = express(); 
const port = process.env.Port||5000;
const mongoose = require("mongoose"); 
const routes = require("./server/routes/routes.js");
const bcrypt = require('bcrypt');
const session = require("express-session");
const fileUpload = require('express-fileupload');//um das Hochladen von Dateien in einer Express.js-Anwendung zu ermöglichen
const methodOverride = require('method-override');
app.use(methodOverride('_method'));//method-override, dass du auch PUT und DELETE-Anfragen über Formulare simulieren kannst.
app.use(express()); 
app.use(fileUpload()); 


app.use(express.static('public'));
app.set('view engine', 'ejs'); // damit ich mit ejs arbeiten kann
app.use(express.urlencoded({extended:false})); 
app.use(session({
    secret: 'dein_geheimes_schlüsselwort', // ein geheimen Schlüssel zur Signierung der Session-Cookies
    resave: false, // Speichert die Sitzung nicht erneut, wenn sie nicht verändert wurde
    saveUninitialized: false, // Speichert keine neuen, nicht initialisierten Sitzungen
    cookie: { secure: false } // Wenn secure auf true gesetzt ist, wird das Cookie nur über HTTPS gesendet. Setze es auf false für lokale Entwicklung.
  }));app.use("/", routes); 
mongoose.connect("mongodb+srv://omkha7788:Dnd7kNWZhGlYh4TS@projectdb.5x0ub.mongodb.net/?retryWrites=true&w=majority&appName=ProjectDB")
.then(()=>{
    console.log("Connected"); 
}).catch((error)=>{
    console.log("error "  +error); 
})



app.listen(port,()=>{
    console.log("listening");
})