const mongoose = require("mongoose"); 
const blog  = new mongoose.Schema({
    image:{ // Feldname des Schema
        type:String, 
        required: "This field is required"
    },
    title:{ // Feldname des Schema
        type: String, 
        required: "This field is required"
    },
     catchytext:{
        type: String, 
        required:"This field is required"
     },
     text:{
        type: String, 
        required: "This field is required",
     },
     author: {
        type: mongoose.Schema.Types.ObjectId,//spezieller Datentyp in MongoDB, der als eindeutiger Identifikator für jedes Dokument in einer Sammlung dient.
        ref: "Config", // Name des Modells, auf das verwiesen wird (falls du ein User-Modell hast)
        required: true
    }
})

blog.index({ title: 'text', catchytext: 'text', text: 'text' });


const infoBlog = mongoose.model("blog",blog ); 

module.exports = infoBlog; 