
const mongoose  = require("mongoose"); 
const comments = new mongoose.Schema({
    name:{
        type: String, 
        required: "This field is required"
    },
    blogPostId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "blog", 
        required: true
    },
    author: { 
        type: String, 
        required: true 
    },
    text:{
        type: String, 
        required: false
    } , 
    createdAt: {
        type: Date,
        default: Date.now
    },
    
})

let  Comment = mongoose.model("comment",comments );
module.exports= Comment;