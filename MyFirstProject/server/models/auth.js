const mongoose = require("mongoose"); 

let config = new mongoose.Schema({
   username:{
    type:String, 
    required: "This field is required"
   },
    name:{
        type:String, 
        required: "This field is required", 
    }, 
    password:{
        type: String, 
        required:"This fieled is required"
    }, 
    isAdmin:{
        type:Boolean, 
        required: true, 
    } ,
    isGuest:{
        type: Boolean, 
        required: false
    }

})

let configoration = mongoose.model("Config", config); 
module.exports=configoration; 