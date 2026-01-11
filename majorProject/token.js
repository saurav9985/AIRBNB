const express  = require('express');
const app = express();
const port = 8000;

app.use('/abcd',(req,res,next)=>{
    let token = req.query.q;
    if(token === 'access'){
        next();
    }
    throw new Error("Access denied");
});

app.get('/abcd',(req,res)=>{
    res.send("data");
})

app.use((req,res)=>{
     
    res.status(404).send("page not found");
});

app.listen(port,()=>{
    console.log(`server running listening on port ${port}`);
})