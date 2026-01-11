const mongoose = require('mongoose');
//const initdata = require('./data.js');
const initdata = require('../init/data2.js');
const Listing = require('../models/listing.js');


const Userdata = require('../models/UD.js');

const mongoose_url = 'mongodb://127.0.0.1:27017/wandrelust';

main()
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log("Error while connecting to MongoDB:", err);
})

async function main(){
  await  mongoose.connect(mongoose_url);
}

const initDB = async() => {
    try{
        //await Listing.deleteMany({});
       await Listing.insertMany(initdata);
        //await Userdata.deleteMany({});
        console.log("Database initialized with sample data");
    }catch(err){
        console.log("Error while deleting existing listings:", err);
    }   
}  
initDB();

