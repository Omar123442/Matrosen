
const mongoose  = require("mongoose"); 
const comments = new mongoose.Schema({
    name:{
        type: String, 
        required: "This field is required"
    },
    blogPostId: { // Hier wird das `blogPostId` hinzugefügt
        type: mongoose.Schema.Types.ObjectId, // Typ von ObjectId
        ref: "blog", // Bezug zum `blog` Modell
        required: true
    }
})

let  Comment = mongoose.model("comment",comments );
module.exports= Comment;