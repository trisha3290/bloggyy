const dotenv = require('dotenv');
dotenv.config();
const express=require('express');
const app=express();
app.set('view engine', 'ejs'); 
app.use(express.static('public'));// includes css files and js files which are embedded in html 
app.use(express.json());
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const session = require('express-session')
const MongoStore =  require('connect-mongo')
var path=require('path')
//const client = require('./db');
const dbURI=process.env.MONG_URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const db = mongoose.connection;
mongoose.connect(dbURI,{useNewUrlParser: true, useUnifiedTopology:true},function(err){
	if(err) return console.error(err)
	console.log('connected to database');
	
  })
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: dbURI }),
}));
const index = require('./router');
app.use('/', index);


const PORT = process.env.PORT||101;
//console.log(process.env.MONG_URL)
app.listen(PORT ,()=>console.log(`server running on port ${PORT}`))



