var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema from form entries
var instructorDetailsSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, required: true, max: 1, ref: "user"},
    fullName: {type: String, required: true, trim: true, maxlength: 100},
    //email: {type: String, required: true, trim: true}, //possibly an id
    mobileNumber: {type: Number, required: true, trim: true, minlength: 10, maxlength: 13,  },
    address: [{type: String, minlength: 1, required: true}], //array of multiple lines
    city: {type: String, required: true, trim: true, maxlength: 50},
    pinCode: {type: Number, required: true, trim: true, min: 000001, max: 999999},
    state: {type: String, required: true, trim: true, maxlenth: 50},
    country: {type: String, required: true, trim: true, maxlength: 50},
    teachExp: {type: Number, required: true, trim: true, min: 0, max: 100},
    subjects: [String], //dynamic fields.
    class: [String], //checkboxes
    language: [String], //checkboxes
    resume: {type: String, required: true },
    approval: {type: Boolean}
  }
);

// Virtual for language to boolean
instructorDetailsSchema
.virtual('language.bool')
.get( function () {
  return this.language;
})
.set(function (languageInp) {
  var inpLang = languageInp.length;
  var languagesAll = {  //make all 0 by default
    "English": 0,
    "Hindi": 0,
    "Tamil": 0,
    "Bengali": 0,
    "Marathi": 0,
    "Gujrati": 0,
    "Punjabi": 0,
    "Rajasthani": 0,
    "Odia": 0,
    "Kashmiri": 0
  };
  for (lang in languageInp) {   //turn every entry to 1
    languageAll[lang] = 1;
  };
  return languagesAll;  //return the new language dict
});

//return a model of form schema
var instructorData = mongoose.model('instructorData', instructorDetailsSchema);
