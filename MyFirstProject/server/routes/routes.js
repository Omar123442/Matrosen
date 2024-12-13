    const express = require("express"); 
    const router = express.Router(); //Routing Struktur
    const controller = require("../controllers/controller.js"); 
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
    router.put("/edit/:id", controller.editBlog); 
    router.get("/edit/:id", controller.editsite);
    router.post("/search", controller.search); 
    module.exports= router; 
