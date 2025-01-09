const { clearCache } = require("ejs");
const nodemailer = require("nodemailer");

const configoration = require("../models/auth.js");
const blog = require("../models/blog.js"); 
const Comment = require("../models/comment.js");
const  crypto = require ("crypto"); 
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
            isAdmin: false,
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
    const ADMIN_EMAIL = "AdminMediconnect@gmail.com"; 
    const ADMIN_PASSWORD = "B1xID]b}"

    const check = await configoration.findOne({name: req.body.emailLog});
    if(req.body.emailLog == process.env.ADMIN_EMAIL && req.body.password == ADMIN_PASSWORD){
        req.session.check = {
            username: "Admin", 
            name: ADMIN_EMAIL, 
            password: ADMIN_PASSWORD, 
            isAdmin: true
        }
 return       res.redirect("/home"); 
    }
    if(!check){
       return res.send("The email does not exist");
    }  


    const isMatch = await bcrypt.compare(req.body.password,check.password);//check.password der gespeichrete gehashte passsword wird mit den eingetipptem password verglichen
    if(!isMatch){
        res.send("False Passwort " );
    }
    else{
        req.session.check = check;

        res.redirect("/home");  
    }
   
} 
 console.log()

exports.login = async(req, res)=>{
    res.render("Login");
}
exports.guest = async (req, res )=>{
     try{

        const temp = crypto.randomBytes(8).toString("hex"); 
        const guestemail = `Guest${temp}@gmail.com`;
        const guestpassword = crypto.randomBytes(12).toString("hex"); 

        const guest = new configoration({
            username: `guest_${temp} `,
            name: guestemail,
            password:guestpassword,
            isAdmin: false,
            isGuest: true
        })
        req.session.check = {
            username: guest.username,
            name: guest.name,
            isAdmin: guest.isAdmin,
            isGuest: guest.isGuest
        };


        res.redirect("/home");  
      

    }
    
    catch(error){
        res.send(error); 
    }

}

exports.report = async (req,res) =>{
    try{
        if(req.session.check){
            res.render("report.ejs", {user: req.session.check}); 
        }
        else{
            res.redirect("/Login"); 
        }
    }
    catch(error){
        res.send("Error " + error)
    }
}

exports.reportdata = async (req, res) => {
    try {
        if (req.session.check) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                secure: false, 
                auth: {
                    user: "mediconnect3bhbgm@gmail.com", 
                    pass: "tgmu eixe fimb kjhj", 
                },
                tls: {
                    rejectUnauthorized: false,
                },
                debug: true, 
                logger: true, 
            });

            const userEmail = req.body.email; 
            const subject = req.body.subject; 
            const reportText = req.body.reportText; 

            const mailOptions = {
                from: `"Report from ${userEmail}" <mediconnect3bhbgm@gmail.com>`, 
                to: "mediconnect3bhbgm@gmail.com", 
                subject: `User Report: ${subject}`, 
                text: `You have received a report from a user.\n\nUser Email: ${userEmail}\nSubject: ${subject}\n\nReport:\n${reportText}`, 
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                    return res.status(500).send({ message: "Error sending email." });
                } else {
                    console.log("Email sent: " + info.response);
                    return res.status(200).send({ message: "Report sent successfully." });
                }
            });
        } else {
            return res.status(403).send({ message: "Unauthorized access." });
        }
    } catch (error) {
        console.error("Error processing report:", error);
        res.status(500).send({ message: "Internal server error." });
    }
};


exports.imprint = async (req, res) =>{
    try{
            if(req.session.check){
                res.render("imprint.ejs", {user: req.session.check}); 
            }
            else{
                res.redirect("/Login"); 
            }
    }
    catch(error){
        res.send("Error " + error); 
    }
}

   
exports.home = async (req, res) => {
    try {
        if (req.session.check) {
            const page = parseInt(req.query.page) || 1; // Konvertiere `req.query.page` zu einer Zahl, Standard ist 1            
            const limit = 5; 
            const skip = (page - 1) * limit; 
            const totalBlogs = await blog.countDocuments(); 
            const totalPages = Math.ceil(totalBlogs / limit); 

            const blogdata = await blog.find().skip(skip).limit(limit); 

            return res.render("index.ejs", {
                user: req.session.check,
                blogdata,
                currentPage: page,
                totalPages,
            });
        }
        res.redirect("/Login");
    } catch (error) {
        console.log("Error " + error);
    }
};

exports.logout = async(req, res)=>{
    try{
        await req.session.destroy((error)=>{   
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
                author: req.session.check._id 
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
                blogPostId: req.params.id ,
                author: req.session.check.username
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

            const commentsen = await Comment.find({ blogPostId }); //die Kommentare zu einem spezifischen Blogpost zu finden
            res.render("showBlog.ejs", { infos, commentsen, user: req.session.check });
        } else {
            res.redirect("/login"); 
        }
    } catch (error) {
        console.log("Error " + error);
        res.status(500).send("Server error");
    }
};

exports.deletecomment = async (req, res) => {
    try {
        if (req.session.check) {
            const commentId = req.params.id;
         const comment = await Comment.findById(commentId);
            if(comment.author == req.session.check.username || req.session.check.isAdmin){
                await Comment.findByIdAndDelete(commentId);
                res.redirect(`/home`); 
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {

        console.error('Error deleting comment:', error);
        res.status(500).send('Server error');
    }
};

exports.myblogs = async (req, res) => {
    try {
        let ublogs;
        if (req.session.check) {
            if (req.session.check.isAdmin) {
                ublogs = await blog.find();
            } else {
                ublogs = await blog.find({ author: req.session.check._id });
            }
            res.render("myBlogs.ejs", { user: req.session.check, blogs: ublogs });
        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        console.error('Error in myblogs: ', error);
        res.status(500).send("Server error");
    }
};



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

        if (updatedBlog) { 
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

