    const express = require("express"); 
    const router = express.Router(); //Routing Struktur
    const controller = require("../controllers/controller.js"); 
    router.get("/", (req, res) => {
        if (req.session.check) {
            res.redirect("/home"); 
        } else {
            res.redirect("/Login"); 
        }
    });
    router.get("/SignUp", controller.sign); 
    router.post("/SignUp", controller.signdata);
    router.get("/Login", controller.login);
    router.post ("/Login", controller.logindata);
    router.get("/home", controller.home); 
    router.get("/Logout",controller.logout); 
    router.get("/submit-blog", controller.blog)
    router.post("/submit-blog", controller.blogdats)
    router.get("/show/:id", controller.show); 
    router.post('/add-comment/:id', controller.showdata);     
    router.get("/myblogs", controller.myblogs); 
    router.delete("/delete/:id", controller.deleteBlog); 
    router.delete("/delete-comment/:id",controller.deletecomment); 
    router.put("/edit/:id", controller.editBlog); 
    router.get("/edit/:id", controller.editsite);
    router.post("/search", controller.search); 
    router.post("/guest", controller.guest);
    router.get("/report", controller.report); 
    router.post("/report", controller.reportdata); 
    router.get("/imprint", controller.imprint);
    module.exports= router; 
