    const express = require("express"); 
    const app = express(); 
    const port = process.env.Port||5000;
    const mongoose = require("mongoose"); 
    const routes = require("./server/routes/routes.js");
    const bcrypt = require('bcrypt');
    const session = require("express-session");
    const fileUpload = require('express-fileupload');
    const methodOverride = require('method-override');
    app.use(methodOverride('_method'));
    app.use(express()); 
    app.use(fileUpload()); 

    require('dotenv').config();

    app.use(express.static('public'));
    app.set('view engine', 'ejs'); 
    app.use(express.urlencoded({extended:false})); 
    app.use(session({
        secret: 'dein_geheimes_schlüsselwort', 
        resave: false, 
        saveUninitialized: false, 
        cookie: { secure: false } 
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