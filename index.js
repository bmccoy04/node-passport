var _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;

var users = require("./user");

var app = express();
app.use(passport.initialize());

// parse application/x-ww-form-urlencoded
// for easier testing with postman or plain HTML forms
app.use(bodyParser.urlencoded({
	extended: true
}));

// parse application/json
app.use(bodyParser.json());

var jwtOptions = {}; 
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'replacethiswithsomethingbiggertwsh';

var strategy = new Strategy(jwtOptions, function(jwt_payload, next){
	console.log('strat was called');
	console.log('payload recieved', jwt_payload);
	var user = users.get()[_.findIndex(users.get(), {id: jwt_payload.id})];
		
	if(user){
		next(null, user);
	} else {
		next(null, false);
	}
});

passport.use(strategy);

app.get("/", function(req, res){
	res.json({message: "Expres is working"});
});

app.get("/users", function(req, res){
	res.json({users: users.get()});
});

app.post("/login", function(req, res){
	console.log("Function start: " + req + " " + res);
	var name = null;
	var password = null;

	console.log(req.body);
	if(req.body.name && req.body.password){
		name = req.body.name;
		password = req.body.password;
	}

	console.log(name + " " + password);

	var user = users.get()[_.findIndex(users.get(), {name:name})];
	console.log("User: " + user);

	if(!user){
		res.status(401).json({message:"There was an error"});
	}
	
	if(user.password === req.body.password){
		var payload = {id: user.id, name: user.name, somethingElse: "mine"};
		var token = jwt.sign(payload, jwtOptions.secretOrKey);
		res.json({message: "ok", token:token});
	} else {
		res.status(401).json({message: "There was an error"});
	}	
});

// Header Key                   Header Value
// Authorization                Bearer + encoded token
app.get("/secret", passport.authenticate('jwt', {session: false}), function(req, res){
	res.json("Success! YOu can not see this w/o a token");
});

app.get("/secretDebug", function(req, res, next){
	console.log(req.get('Authorization'));
	next();
}, function(req, res){
	res.json("debugging");
});

app.listen(3000, function(){
	console.log("Express is running");
});

//fake users
// var users = [
// 	{
// 		id:1,
// 		name:'bryan',
// 		password:'1234'
// 	},
// 	{
// 		id:2,
// 		name:'test',
// 		password:'test'
// 	}
// ];
