const express = require('express');
const ejsmate = require('ejs-mate');
const app = express();
const path = require('path');
const methodOverride = require('method-override')
const Joi = require('joi');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.engine('ejs',ejsmate);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const Userdata = require('./models/UD');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError  = require('./utils/ExpressError.js');

const {listingSchema} = require('./schema.js');

const port = 7080;
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

//middleware for booking
const auth = (req,res,next)=>{
    let q = req.query.q;
    if(q != 'booking'){
        throw new Error("unauthorized access");
    }
    next();
}

//middleware for delete
const Owner = (req,res,next)=>{
    let q = req.query.q;
    if(q != "owner"){
        throw new Error("Unauthorized access")
    }
    next();
}

//validate
const validate = (req,res,next)=>{
let {error} = listingSchema.validate(req.body);
if(error){
    let errmsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errmsg);
}else{
    next();
}
}


//show all listings
app.get('/allLst',async(req, res,next) => {
    let userdata = await Listing.find();
   res.render('listings/AllListings.ejs', {userdata });
    //res.send(userdata)
    });

    //index route(all listings)
    app.get("/listings",wrapAsync(async (req,res)=>{
        let allListings = await Listing.find();
        res.render("listings/index.ejs",{allListings})
    }));

    //show route
    app.get("/listings/:id",async (req,res)=>{
        let {id} = req.params;
        let foundListing = await Listing.findById(id);
        res.render("listings/show.ejs",{foundListing})
    })

app.get('/Lst/new', (req, res) => {
    res.render('listings/new.ejs');
});

//booking data
app.get("/BD",async(req,res)=>{
    let datas = await Userdata.find();
    //res.send(datas);
   res.render('./listings/BD.ejs',{datas});
})
//search a listing using title
app.get("/search",async(req,res,next)=>{
 let {title} = req.query;
 //const foundListing = await Listing.findOne({title:title});//this returan object if you use find() this returns array
 const foundListing = await Listing.findOne({$or:[{title:title},{location:title},{price:{$gte:750,$lte:1000}}]}); 
 // let id = data._id;
  if(!foundListing){
    next(new ExpressError(404,"no such listing exist"))
  }
   console.log(`search listing is ${foundListing}`);
   res.redirect(`/listings/${foundListing._id}`);
   //res.render("listings/show.ejs",{foundListing});
})



//create new listing
app.post('/listings',wrapAsync(async (req, res,next) => {
   // const { title, description, imageUrl, price, location } = req.body;
    // const newListing = new Listing({
    //     title,
    //     description,
    //     image: { url: imageUrl },
    //     price,
    //     location
    // });
    // await newListing.save();
  if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing");
  }

     const newListing = new Listing(req.body.listing);
     
    //  if(!newListing.title){
    //     throw new ExpressError(400,"title is missing");
    //  }
    //   if(!newListing.description){
    //     throw new ExpressError(400,"description is missing");
    //  }
    //   if(!newListing.location){
    //     throw new ExpressError(400,"location is missing");
    //  }

   //console.log(req.body.listing.imageUrl);
    const data = await newListing.save();
    //console.log(data);
    let id = data._id;
 Listing.findByIdAndUpdate(id,{image:{url:req.body.listing.imageUrl}},{new:true,runValidators:true })
 .then((data)=>{
    console.log(data);
 }).catch((err)=>{
    console.log("Error updating image URL:", err);
 });
    res.redirect(`/listings/${id}`);            
   
}));
//edit route
app.get("/listings/:id/edit",async (req,res)=>{
    let {id} = req.params;
    let foundListing = await Listing.findById(id);
    //console.log(foundListing);
    res.render("listings/edit.ejs",{foundListing})
})

//update route
app.put("/listings/:id",validate,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing");
  }
    let updatedListing = await Listing.findByIdAndUpdate(id,req.body.listing,{new:true,runValidators:true});
    await Listing.findByIdAndUpdate(id,{image:{url:req.body.listing.imageUrl}},{new:true,runValidators:true });
    console.log(updatedListing);
    res.redirect(`/listings/${id}`);
    
}));

app.delete("/listings/:id",Owner,async (req,res)=>{
    let {id} = req.params;
    console.log(req.method);
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

app.get('/book', (req, res) => {
    res.render('listings/book.ejs');
});

app.post('/receiveBooking', wrapAsync(async(req, res) => {
    //console.log(req.body);
    const newuser = new Userdata(req.body);
    await newuser.save()
    .then((data)=>{
        console.log("Booking data saved:", data);
    }   )
    .catch((err)=>{
        console.log("Error saving booking data:", err);
    }   );
    res.redirect('/BD')
}));
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next)=>{
    let {statusCode= 500,message = "some error occured"} = err;
    res.status(statusCode).render("./listings/error.ejs",{err});
   // res.status(statusCode).send(message);
    //res.status(status=404).send('not accessible');
    //res.send("some error coccured");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});