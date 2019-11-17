const express = require("express");
const app = express();
const mongodb = require("mongodb").MongoClient;
const body = require('body-parser');

console.log("run @ 3000");

app.use((req,res,next)=>{

    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
    
    });

var db;

app.use(body.json());

mongodb.connect("mongodb+srv://karthik:guitarist@cluster0-mbf5c.mongodb.net/test?retryWrites=true&w=majority",(error,database)=>{
  if(error){
      console.log(error);
  }else{
    db = database.db("Trades")
      console.log("successful connection");
  }
})

//Erasing all records
app.get('/erase',(req,res)=>{
  db.collection('trade').remove((error,data)=>{
    if(error){
      res.status(401).json('No data available for delete')
    }
    else{
      res.status(200).json("Trades are deleted successfully");
    }
  })
})

//Adding new trades
app.post("/trades",(req,res)=>{

  var UTCHours = new Date().getUTCHours()
    req.body._id = new Date().getTime();
    req.body.user.id = loggedInUserID;
    req.body.user.name = loggedInUsername;
    req.body.timestamp = UTCHours -4;

  db.collection('trade').save(req.body,(error,data)=>{
    if(error){
      res.status(400).json("The Trade with same ID already exists")
    }
    else{
      res.status(201).json("successfully stored");
    }
  })
})

//Returning all trades
//The array should be sorted in ascending order
app.get('/trades',(req,res)=>{ 
  db.collection('trades').find().toArray((error,data)=>{
    if(data){
       result = data.sort((a,b)=>(a._id > b._id)?1 : ((b._id > a._id)? -1 : 0));
      res.status(200).json(result);
    }
  })
})

//Returning the trade records filtering by UserID
app.get('/trades/users/:userID',(req,res)=>{
db.collection('trades').find({user:req.params.userID}).toArray((err,data)=>{
  if(err){
    res.status(404).json("user doenot exists");
  }else{
    res.status(200).json(data);
  }
})
})

//Returning the trade records filtered by the stock symbol and trade type in the given date range
app.get('/stocks/:stockSymbol/trades?type={tradetype}&start={startDate}&end={endDate}',(req,res)=>{
  db.collection('trades').find({stocksymbol:'',tradetype:'',timestamp:{$gt:new Date(''),$lt:new Date('')}}).toArray((err,data)=>{
    if(err){
      res.status(404).json("does not exist")
    }else{
      res.status(200).json(data)
    }
  })
})

//Returning highest and lowest price for the stock symbol in the given date range
app.get('/stocks/:stockSymbol/price?start={starDate}&end={endDate}',(req,res)=>{
  db.collection('trades').find({price:'',timestamp:{$gt:new Date(''),$lt:new Date('')}}).toArray((err,data)=>{
    if(err){
      res.status(404).json({"message":"There are no trades in the given data range"})
    }
    else{
      result = data.sort(function(a,b){
        a - b;
      })

      var highest = result.charAt(0);
      var lowest = result.charAt(result.lenght-1);
      res.status(200).json({
        "symbol": data.stocksymbol,
        "highest": highest,
        "lowest": lowest
      })
    }
  })
})