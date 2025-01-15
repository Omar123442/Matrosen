    const { clearCache } = require("ejs");
    const nodemailer = require("nodemailer");
    const flash = require('connect-flash');  
    const configoration = require("../models/auth.js");
    const blog = require("../models/blog.js"); 
    const Comment = require("../models/comment.js");
    const  crypto = require ("crypto"); 
    const bcrypt = require('bcryptjs');
    const path = require('path');
    const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const { allowedNodeEnvironmentFlags } = require("process");

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



    exports.logindata = async (req, res) => {
        try {
            const ADMIN_EMAIL = "AdminMediconnect@gmail.com";
            const ADMIN_PASSWORD = "B1xID]b}";
            const ADMIN_USERNAME = "Admin";
    
            if (!req.body.emailLog || !req.body.password) {
                return res.status(400).send("Email and password are required.");
            }
    
            if (req.body.emailLog === ADMIN_EMAIL && req.body.password === ADMIN_PASSWORD) {
                req.session.check = {
                    username: ADMIN_USERNAME,
                    email: ADMIN_EMAIL,
                    isAdmin: true,
                    isGuest: false,
                    profilePicture: "images/user.png", 
                };
                return res.redirect("/home");
            }
            
    
            const user = await configoration.findOne({ name: req.body.emailLog });
            if (!user) {
                return res.status(400).json({ error: "Email and password are required." });
                }
    
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(401).send("Incorrect password.");
            }
    
            req.session.check = {
                _id: user._id.toString(),
                username: user.username,
                email: user.name,
                isAdmin: user.isAdmin || false,
                isGuest: user.isGuest || false,
                profilePicture: user.profilePicture || "images/user.png", 
            };
    
            return res.redirect("/home");
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).send("An error occurred during login. Please try again later.");
        }
    };
            exports.login = async(req, res)=>{
        res.render("Login");
    }


    exports.guest = async (req, res) => {
        try {
          const tempId = crypto.randomBytes(8).toString("hex");
          const guestEmail = `Guest${tempId}@gmail.com`;
          const guestName = `guest_${tempId}`;
          const defaultPassword = `${tempId}`; 
      
          const guestUser = new configoration({
            username: guestName,
            name: guestEmail,
            password: defaultPassword, 
            isAdmin: false,
            isGuest: true,
          });
      
          const savedGuest = await guestUser.save();
      
          req.session.check = {
            _id: savedGuest._id.toString(),
            username: savedGuest.username,
            name: savedGuest.name,
            isAdmin: savedGuest.isAdmin,
            isGuest: savedGuest.isGuest,
          };
      
          res.redirect('/home');
        } catch (error) {
          console.error('Error creating guest user:', error);
          res.status(500).send('Server error');
        }
      };
      

    exports.report = async (req,res) =>{
        try{
            if(req.session.check){
                const messages = req.flash();
                res.render("report.ejs", {user: req.session.check,messages: messages}); 
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
                        req.flash('error', 'Error sending the report. Please try again.');
                        return res.redirect('/report');  // Weiterleitung bei Fehler
                    } else {
                        console.log("Email sent: " + info.response);
                        req.flash('success', 'Your report has been successfully sent!');
                        return res.redirect('/report');  // Weiterleitung bei Erfolg
                    }
                });
            } else {
                req.flash('error', 'Unauthorized access.');
                return res.redirect('/login');  // Weiterleitung bei nicht eingeloggtem Benutzer
            }
        } catch (error) {
            console.error("Error processing report:", error);
            req.flash('error', 'Internal server error. Please try again.');
            res.redirect('/report');  // Weiterleitung bei Serverfehler
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
                if (req.session.check.isAdmin) {
                    const page = parseInt(req.query.page) || 1;
                    const limit = 5;
                    const skip = (page - 1) * limit;
    
                    const totalBlogs = await blog.countDocuments();
                    const totalPages = Math.ceil(totalBlogs / limit);
                    const blogdata = await blog.find().skip(skip).limit(limit);
    
                    return res.render("index.ejs", {
                        user: req.session.check, // Admin-Daten direkt aus der Session
                        blogdata,
                        currentPage: page,
                        totalPages,
                    });
                } else {
                    const userId = new ObjectId(req.session.check._id); 
                    const user = await configoration.findById(userId);
                    if (!user) {
                        return res.status(404).send("User not found.");
                    }
    
                    const page = parseInt(req.query.page) || 1;
                    const limit = 5;
                    const skip = (page - 1) * limit;
    
                    const totalBlogs = await blog.countDocuments();
                    const totalPages = Math.ceil(totalBlogs / limit);
                    const blogdata = await blog.find().skip(skip).limit(limit);
    
                    return res.render("index.ejs", {
                        user,
                        blogdata,
                        currentPage: page,
                        totalPages,
                    });
                }
            }
            res.redirect("/Login");
        } catch (error) {
            console.error("Error in home route:", error);
            res.status(500).send("Server error");
        }
    };
        exports.manageUser = async(req, res)=>{
        try{
            if(req.session.check){
                res.render("Manageuser.ejs", {user: req.session.check}); 
            }
        }
        catch(error){
            res.status(error); 
        }
    }


    exports.manageUserdata = async (req, res) => {
        try {
            if (!req.session.check || !req.session.check._id) {
                return res.status(401).json({ message: "Unauthorized. Please log in again." });
            }
    
            const user = await configoration.findById(req.session.check._id);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
    
            if (req.body.username && req.body.username !== user.username) {
                const oldUsername = user.username;
                user.username = req.body.username;
    
                const usernameUpdateResult = await Comment.updateMany(
                    { author: oldUsername },
                    { $set: { author: req.body.username } }  
                );
                console.log(`Updated ${usernameUpdateResult.modifiedCount} comments with new username.`);
            }
    
            if (req.body.password) {
                const saltRounds = 10;
                const hashpassword = await bcrypt.hash(req.body.password, saltRounds);
                user.password = hashpassword;
            }
    
            
            if (req.files && req.files.profilePicture) {
                const imageUploadFile = req.files.profilePicture;
                const newImageName = Date.now() + path.extname(imageUploadFile.name);
                const uploadPath = path.resolve('./') + '/public/profile/' + newImageName;
    
                await imageUploadFile.mv(uploadPath);
    
                const oldProfilePicture = user.profilePicture; 
                user.profilePicture = 'profile/' + newImageName;
    
                
                console.log(`Old profile picture: ${oldProfilePicture}`);
                console.log(`New profile picture: ${user.profilePicture}`);
    
                
                const profilePictureUpdateResult = await Comment.updateMany(
                    { author: user.username }, 
                    { $set: { imageAuthor: user.profilePicture } }  
                );
                console.log(`Updated ${profilePictureUpdateResult.modifiedCount} comments with new profile picture.`);
    
               
                
            }
    
            await user.save();
            req.session.check.username = user.username;
            req.session.check.profilePicture = user.profilePicture;
    
            res.redirect("/home"); 
        } catch (error) {
            console.error("Update Error: ", error);
            res.status(500).json({ message: "An error occurred while updating the user data." });
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
                const user = await configoration.findById(req.session.check)

                return res.render("submit-blog.ejs", { user });
            }
            res.redirect("/Login");
        } catch (error) {
            res.send("Error " + error);
        }
    };


    exports.blogdats = async (req, res) => {
        try {
            if (req.session.check) {
                // Sicherstellen, dass eine Datei hochgeladen wurde
                if (!req.files || !req.files.image) {
                    console.log('No Files were uploaded.');
                    return res.status(400).send('No files were uploaded.');
                }
    
                const imageUploadFile = req.files.image;
                const newImageName = Date.now() + path.extname(imageUploadFile.name); // Einzigartiger Name für das Bild
                const uploadPath = path.resolve('public/uploads') + '/' + newImageName; // Pfad zum Speichern des Bildes
    
                // Bild in das Verzeichnis hochladen (asynchron)
                await imageUploadFile.mv(uploadPath);
                
                // Blog-Daten speichern
                const blogData = new blog({
                    image: 'uploads/' + newImageName,  // Pfad zum Bild relativ zum öffentlichen Verzeichnis
                    title: req.body.title,
                    catchytext: req.body.catchy,
                    text: req.body.btext,
                    author: req.session.check._id
                });
    
                // Blog-Daten speichern und auf die Startseite umleiten
                await blogData.save();
                return res.redirect("/home");
            } else {
                // Falls der Benutzer nicht eingeloggt ist, umleiten
                return res.redirect("/login");
            }
        } catch (error) {
            // Fehlerbehandlung
            console.error("Error: ", error);
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
                    author: req.session.check.username, 
                    imageAuthor: req.session.check.profilePicture
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
                console.log(req.session.check.profilePicture); 

                const blogPostId = req.params.id; 
                const infos = await blog.findById(blogPostId); 
                if (!infos) {
                    return res.status(404).send("Blogpost not found");
                }

                const commentsen = await Comment.find({ blogPostId });
                const user = await configoration.findById(req.session.check._id);

                res.render("showBlog.ejs", { 
                    infos, 
                    commentsen, 
                    user: req.session.check, 
                    profilePicture: req.session.check.profilePicture 
                });
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
            if (req.session.check) { 
                let user = await configoration.findById(req.session.check._id); 
                let ublogs;
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
                const user = await configoration.findById(req.session.check)
                if (blogsedit) {
                    res.render("edits.ejs", { blogs: blogsedit, user }); 
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
