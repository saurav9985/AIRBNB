const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
   name:String,
   email:String,
   number:Number,
   guest:Number,
   checkin:Date,
});

const Userdata = mongoose.model("Userdata", userDataSchema);
module.exports = Userdata;