var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var indexController = require('../controllers/indexController.js');
/* GET home page. */
router.get('/',  indexController.home_get );

router.get('/login', indexController.login_get );

//handling login logic
router.post("/login", passport.authenticate("local",  {
                                   failureRedirect: '/login', failureFlash: 'Invalid username or password.' }), function(req, res){
		 var foundUser = User.findOne({username : req.body.username}).populate("foundUser").exec(function(err, foundUser){
        if(err || !foundUser){
            console.log(err);
        }
        /*if(foundUser.verified === false )
		{
			console.log("User not verified later!");
			return res.render("verify", {username: foundUser.username});
			
		}*/
		
		req.flash("success", "Hi User " + foundUser.username);
        res.redirect("/");
    });
});

router.get('/register', indexController.register_get);

router.post('/newUserRegister', indexController.newUserRegister_post);

router.get('/courses', indexController.courseStructure);

//router.get('/settings', indexController.settings);

router.get('/logout', indexController.logout);

router.get('/ping', indexController.ping);

module.exports = router;
