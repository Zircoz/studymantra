var user = require('../models/user.js');
var student = require('../models/student.js');
var instructor = require('../models/instructor.js');
var location = require('../models/location.js');
var passport = require("passport");
var ValidateUser = require("../models/validateuser");
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
var ValidateUser = {email: email, validationKey: validateString};

ValidateUser.create({email: email, validationKey: validateString}, function(err, newlyCreated){
  if(err){
    console.log(err);
  }
});
};

//feedback
exports.feedback_get = function(req, res) {
  res.render('feedback');
};

exports.feedback_post = function(req, res) {
  var newFeedback = new feedback(
    fullname: req.body.fullName,
    email: req.body.email,
    subject: req.body.subject,
    messege: req.body.messege
  );
  feedback.create(newFeedback, function(err, newfeedback){
    if(err){
      console.log(err);
    } else {
      console.log(newfeedback);
      res.redirect('/');
    }
  });
};

//verify email
exports.verify_email_get = function(req, res) {
  res.render('verifyEmail');
};
exports.verify_email_post = function(req, res) {
  ValidateUser.findOneAndRemove(req.body.verificationCode === ValidateUser.validationKey && req.foundUser.email === validateUser.email, function (err, user){
    if(err) {
      res.flash('Wrong OTP')
      res.redirect('/verify-email');
    }
    console.log('inside otp check and remove');
    user.findOneAndUpdate(req.foundUser._id === user._id, function(err, foundUserSchema){
      if (err) {
        res.redirect('/');
      }
      console.log('inside altering user model');
      foundUserSchema.emailValid = True;
      foundUser.emailValid = True;
      res.flash('success', 'Email verified');
      res.redirect('/');
    } );
  });
};

//home route
exports.home_get= function(req, res) {
	var user = req.session.user;
	console.log("HOME_Get method")
	console.log(user);
	if(user!= null && user!="undefined" && user.userType!= null &&  user.userType!= "undefined")
	{
		console.log("inside conditional check");
		if(user.userType === "student")
		{
		var foundStudent = student.findOne({user : user}).populate("foundStudent").exec(function(err, foundStudent){
        if(err || !foundStudent){
            console.log(err);
        }});
		req.session.student = foundStudent;
		res.render('student/home');
		}
		else if(user.userType === "instructor")
		{
			console.log("trying to find user");
			var foundInstructor = instructor.findOne({user : user}).populate("foundInstructor").exec(function(err, foundInstructor){
        if(err || !foundInstructor){
            console.log(err);
        }});
		req.session.instructor = foundInstructor;
		res.render('instructor/home');
		}
	}
	else
	{
			res.render('home');
	}

};


exports.login_get = function(req, res) {
  res.render('student/login', {usertype: "student"});
};

//register page
exports.register_get = function(req, res) {
	res.render('student/register', {usertype: "student"});
};

//register page
exports.student_home_get = function(req, res) {
	res.render('student/home', {usertype: "student"});
};

exports.instructor_register_get = function(req, res) {
	res.render('instructor/register', {usertype: "instructor"});
};
exports.newUserRegister_post = function(req, res){


	var foundUser = user.findOne({email : req.body.email}).populate("foundUser").exec(function(err, foundUser){
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
	var usertype =  req.body.usertype;
  var newUser = new user(
    {
      email: req.body.emailConfirm,
      userType: req.body.usertype,
      emailValid: false,
	    username: req.body.username
  });
  console.log("User Initiated " + newUser);

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
  if(usertype === "student")
  {
	  var newStudent = new student(
    {
      user: newUser._id,
      fullName: req.body.fullName,
      mobileNumber: req.body.mobileNumber
    }
  );
  console.log("Student initiated" + newStudent);
  student.create(newStudent, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/student");
        }
    });
  }
  else if(usertype === "instructor")
  {
	  var newInstructor = new instructor(
    {
      user: newUser._id,
      fullName: req.body.fullName,
      mobileNumber: req.body.mobileNumber
    }
  );
  console.log("Student initiated" + newStudent);
  instructor.create(newInstructor, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/");
        }
    });
  }
};

exports.about_us_get = function(req,res){
  res.render('aboutUs');
};

exports.login_post = function(req, res){
	var usertype = req.body.usertype;
	var isValidated = false;
	passport.authenticate("local", function(req, res){ isValidated = true;});
	console.log("user Verified " + isValidated);
	res.redirect("/login");
	};


exports.courseStructure = function(req, res) {
  res.render('courseStructure');
};

exports.student_my_account_get = function(req, res) {
  res.render('student/my-account');
};

exports.instructor_my_profile_get = function(req, res) {
  res.render('instructor/my-profile');
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
