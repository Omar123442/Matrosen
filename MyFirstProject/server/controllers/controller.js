const { clearCache } = require("ejs");
const configoration = require("../models/auth.js");
const blog = require("../models/blog.js"); 
const Comment = require("../models/comment.js");

const bcrypt = require('bcrypt');
const path = require('path');

exports.signdata = async(req, res)=>{


    try{
        if (!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).send("All fields are required");
        }
        const data = new configoration({
            username: req.body.username,
            name: req.body.email, 
            password: req.body.password,
        })
        const find = await configoration.findOne({name: data.name});
    
        if(find){
                res.send("This User Alredy exist"); 
        }
        
        else{
            const saltRounds = 10;
            const hashpassword = await bcrypt.hash(data.password, saltRounds); 
            data.password =hashpassword; 
            const dataSave = await data.save(); 
            console.log(dataSave); 
            res.redirect("Login"); 
        }
     

    }
    catch(error){
        console.log(error); 
    }



}

exports.sign = async (req, res)=>{
    try{
        res.render("Signup.ejs"); 

    }
    catch(error){
        res.send("Error " + error); 
    }
}


exports.logindata = async(req, res)=>{
    const check = await configoration.findOne({name: req.body.emailLog}); 

    if(!check){
       return res.send("The email does not exist");
    }

    const isMatch = await bcrypt.compare(req.body.password,check.password);//check.password der gespeichrete gehashte passsword wird mit den eingetipptem password verglichen
    if(!isMatch){
        res.send("False Passwort " );
    }
    else{
        req.session.check = check;//check-Objekt(Email Info) unter dem Schlüssel check in der Session speicherst. 

        res.redirect("/home");  // damit die URL geändert wid
    }
   
}

exports.login = async(req, res)=>{
    res.render("Login");
}
   
exports.home = async (req, res) => {
    try {
        if (req.session.check) {
            const blogdata = await blog.find()
            return res.render("index.ejs", { user: req.session.check, blogdata });
        }
        res.redirect("/Login");
    } catch (error) {
        console.log("Error " + error);
    }
};
exports.logout = async(req, res)=>{
    try{
        await req.session.destroy((error)=>{ // ist asynchron und erwartet einen Callback,   
            if(error){
                console.log("error"); 
                res.send("Error "  + error); 
            }
            else{
                res.redirect("/Login")
            }
        }); 
        
    }
    catch(error){
        console.log("Error " + error); 
    }

}
exports.blog = async (req, res) => {
    try {
        if (req.session.check) {
            return res.render("submit-blog.ejs", { user: req.session.check });
        }
        res.redirect("/Login");
    } catch (error) {
        res.send("Error " + error);
    }
};


exports.blogdats = async (req, res) => {
    try {
        if (req.session.check) {
            let imageUploadFile;
            let uploadPath;
            let newImageName;

            if (!req.files || Object.keys(req.files).length === 0) {
                console.log('No Files were uploaded.');
                return res.status(400).send('No files were uploaded.');
            }

            imageUploadFile = req.files.image;
            newImageName = Date.now() + path.extname(imageUploadFile.name); 
            uploadPath = path.resolve('./') + '/public/uploads/' + newImageName;

            imageUploadFile.mv(uploadPath, function (err) {
                if (err) {
                    console.log("Error " + err);
                    return res.status(500).send(err);
                }
            });

            const blogData = new blog({
                image: 'uploads/' + newImageName,
                 title: req.body.title, 
                catchytext: req.body.catchy, 
                text: req.body.btext, 
                author: req.session.check._id // Setze die author-ID
            });


            await blogData.save();
            return res.redirect("/home"); 

        } else {
            return res.redirect("/login"); 
        }
    } catch (error) {
        console.log("Error " + error);
        res.status(500).send("Server error");
    }
};

exports.showdata = async (req, res) => {
    try {
        if (req.session.check) {
            const { showcomment } = req.body;
            if (!showcomment) {
                return res.status(400).send('No comment provided');
            }

            const commentData = new Comment({
                name: showcomment,
                blogPostId: req.params.id 
            });

            await commentData.save(); 

            console.log('Comment saved:', commentData);
            res.redirect(`/show/${req.params.id}`); 
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log("Error " + error);
        res.status(500).send("Server error");
    }
};


exports.show = async (req, res) => {
    try {
        if (req.session.check) {
            const blogPostId = req.params.id; 
            const infos = await blog.findById(blogPostId); 
            if (!infos) {
                return res.status(404).send("Blogpost not found");
            }

            const commentsen = await Comment.find({ blogPostId }); 
            res.render("showBlog.ejs", { infos, commentsen, user: req.session.check });
        } else {
            res.redirect("/login"); 
        }
    } catch (error) {
        console.log("Error " + error);
        res.status(500).send("Server error");
    }
};

exports.deleteBlog = async (req, res) =>{
    try{
        if(req.session.check){
            const comment = await Comment.findByIdAndDelete({blogPostId});
            res.redirect(`/show/${req.params.id}`); 
        }
    }
    catch(error){
        console.log(" Error " + error);
    }

}


exports.myblogs = async(req, res)=>{
    try{
        if(req.session.check){
            const ublogs = await blog.find({author: req.session.check._id}); 
            res.render("myBlogs.ejs", {user: req.session.check, blogs:ublogs}); 
        }
    }
    catch(error){

    }
}
exports.deleteBlog = async (req,res)=>{
    try{
       
            const params = req.params.id; 
            let data = await blog.findByIdAndDelete(params); 
            res.redirect("/myblogs");
    }
    catch(error){
        console.log("Error "  + error); 
    }
}

exports.editBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const updateData = req.body;

        const updatedBlog = await blog.findByIdAndUpdate(blogId, updateData);

        if (updatedBlog) { // ob das updatedBlog-Objekt existiert und nicht null oder undefined ist.
            console.log('Blog updated successfully:', updatedBlog);
            res.redirect(`/edit/${blogId}`); 
        } else {
            console.log('Blog not found');
            res.status(404).send('Blog not found');
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Server error');
    }
};
exports.editsite = async (req, res) => {
    try {
        if (req.session.check) {
            const params = req.params.id; 
            const blogsedit = await blog.findById(params); 
            if (blogsedit) {
                res.render("edits.ejs", { blogs: blogsedit, user: req.session.check }); 
            } else {
                res.status(404).send('Blog not found');
            }

        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Server error');
    }
};


exports.search = async (req, res)=>{
    try{ 
        if(req.session.check){
            let searchinput = req.body.searchTerm; 
            let find= await blog.find({$text: {$search:searchinput,$diacriticSensitive: true }}); 
            res.render("search", { user: req.session.check,find}); 
        }   
        else{
            res.redirect("/Login"); 
        }
     
    }
    catch(error){
        res.send("Error "  + error); 
    }
 
}


