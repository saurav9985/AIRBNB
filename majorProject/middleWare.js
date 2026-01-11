const express= require('express');
const app = express();
const port =9090;

app.use((req,res,next)=>{
    let date = new Date(Date.now()).toString();
    req.time = Date.now();
    console.log('first middleware 1',req.time);
    
    //res.send("middleware finished");
   return next();
});

const auth =(req,res,next)=>{
    //console.log("second middleware 2",req.method);
    let token = req.query.to;
    if(token !== '12345'){
        return res.status(401).send("Unauthorized: Invalid token");
    }
    next();
};


app.get('/random',auth, (req, res) => {
    res.send("This is a random route");
}   
);

app.get('/apple', (req, res) => {
    res.send("Welcome to the Apple Page");
}   
);
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});