var user = require('../models/user.js');
var student = require('../models/student.js');
var instructor = require('../models/instructor.js');
var location = require('../models/location.js');
var passport = require("passport");
var ValidateUserSchema = require("../models/validateuser");
var nodemailer = require("nodemailer");
var mongoose = require("mongoose");

var transporter = nodemailer.createTransport({
  //debug: true,
  /*host: 'stmp.yahoo.com',
  port: 587,
  secure: false, //true for 465, false for other ports*/
  service: 'Yahoo',
  auth: {
    user: 'shreyanshdixit204@yahoo.com',
    pass: 'Co52j^eKCG'
  }
});


function randomString() {
  var randomstring = [];
  var possible = "QWERTYUIOPLKJHGFDSAZXCVBNM1234567890qwertyuioplkjhgfdsazxcvbnm";

  for (var i=0; i<8; i++) {
    newChar = possible.charAt(Math.floor(Math.random() * possible.length));
    randomstring.push(newChar);
  }
  return randomstring.join('');
  //console.log(randomstring);
};


function sendEmailValidate(email, validateString)
{
  console.log("Send Mesg started" + email);
  var mailOptions = {
    from: 'shreyanshdixit204@yahoo.com',
    to: email,
    subject: 'Email Verification - WidgetEduTech',
    /*
       for plain text body
  	 ->	text: 'Just Testing!'
    */

    // html body
    html: 'The mail has been sent from Node.js application! '+ validateString + '</p>'
  };

transporter.sendMail(mailOptions, (error, info) => {
  if (error)
  {
    return console.log(error);
  }
  console.log('Email sent: ' + info.response);
});
var validateUserSchema = {email: email, validationKey: validateString};

ValidateUserSchema.create({email: email, validationKey: validateString}, function(err, newlyCreated){
  if(err){
    console.log(err);
  }
});
};



//home route
exports.home_get= function(req, res) {
  res.render('home');
};
//login page
exports.login_get = function(req, res) {
  res.render('login');
};
//register page
exports.register_get = function(req, res) {
  res.render('register');
};

exports.newUserRegister_post = function(req, res){
	
			 var foundUser = user.findOne({username : req.body.username}).populate("foundUser").exec(function(err, foundUser){
        if(err || !foundUser){
            console.log(err);
        }
        /*if(foundUser.verified === false )
		{
			console.log("User not verified later!");
			return res.render("verify", {username: foundUser.username});
			
		}*/
		if(foundUser != null)
		{
			console.log("user with given username found");
		req.flash("error", "User Already Exists " + foundUser.username);
        res.redirect("/register");
		}
    });
	 foundUser = user.findOne({email : req.body.email}).populate("foundUser").exec(function(err, foundUser){
        if(err || !foundUser){
            console.log(err);
        }
        /*if(foundUser.verified === false )
		{
			console.log("User not verified later!");
			return res.render("verify", {username: foundUser.username});
			
		}*/
		if(foundUser != null)
		{
			console.log("user with given username found");
		req.flash("error", "User Already Exists " + foundUser.email);
        res.redirect("/register");
		}
    });
	
  var newUser = new user(
    {
      email: req.body.emailConfirm,
      userType: "student",
      emailValid: false,
	    username: req.body.username
  });
  console.log("User Initiated " + newUser);
  var newStudent = new student(
    {
      user: newUser._id,
      fullName: req.body.fullName,
      mobileNumber: req.body.mobileNumber
    }
  );
  console.log("Student initiated" + newStudent);

  /*var randomString = function(){

  var randomString = function(){

  var chars = "01234567890123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = 8;
  var randomString = '';
  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum+1);
  }
  return randomstring;

};*/

  console.log("" + newUser.email + "    " +req.body.password)
  user.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.flash('error', {error: error.message});
      res.redirect('/register');
    }
    passport.authenticate("local")(req, res, function(){
      sendEmailValidate(req.body.email, randomString());
      req.flash("success ", "Successfully registered! Nice to meet you "+ req.body.email);
      res.redirect("/");
    });
  });
};

exports.courseStructure = function(req, res) {
  res.render('courseStructure');
};



exports.logout = function(req,res){
  req.logout();
  req.flash("Success", "see you later!");
  res.redirect("/");
};
//ping-pong
exports.ping = function(req, res) {
  res.status(200).send("pong!");
};
