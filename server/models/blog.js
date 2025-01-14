const mongoose = require("mongoose"); 
const blog  = new mongoose.Schema({
    image:{ 
        type:String, 
        required: "This field is required"
    },
    title:{ 
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Config",
        required: true
    }
})

blog.index({ title: 'text', catchytext: 'text', text: 'text' });


const infoBlog = mongoose.model("blog",blog ); // damit habe ich einen neue Kollektion in Mongodb erstellt(Les go)

module.exports = infoBlog;  