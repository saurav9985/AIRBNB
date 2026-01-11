const mongoose  = require("mongoose");

const listingSchema = new mongoose.Schema({
   title:{
    type:String,
    required:true,
    lowercase:true,
   },
   description:{
    type:String,
    
   },
   image:{
      filename:{
         type:String,
      },
    url:{
      type:String,
      default:"https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600",
    set:(v) => v==="" ? "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600" : v,
    }
    
   },
   price:{
    type:Number,
    default:1000,
   },
   location:{
    type:String,
    lowercase:true,
   }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;


