const mongoose = require("mongoose"); 

let config = new mongoose.Schema({
   username:{
    type:String, 
    required: false,
   },
    name:{
        type:String, 
        required: "This field is required", 
    }, 
    password:{
        type: String, 
        required:"This fieled is required"
    },
    profilePicture:{
        type: String,
        required: false
    }, 
    isAdmin:{
        type:Boolean, 
        required: false, 
    } ,
    isGuest:{
        type: Boolean, 
        required: false
    }

})

let configoration = mongoose.model("Config", config); 
module.exports=configoration; 