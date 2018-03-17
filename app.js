var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var con = require('./utils/models');
var api = require('./apis/api.js');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var urlencodedParser = bodyParser.urlencoded({ extended: true });


//sign-up api
app.use('/signup', api.signup);

//login api
app.use('/login', api.login);


app.listen(8080);

