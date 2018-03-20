var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var con = require('./utils/models');
var api = require('./apis/api.js');

var app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var urlencodedParser = bodyParser.urlencoded({ extended: true });


//sign-up api
app.post('/signup', api.signup);

//login api
app.post('/login', api.login);

//edit profile
app.put('/edit', api.update);

//get users info
app.get('/users/:id', api.getUser);

// app.get('/users/:id', function(req, res){
//     con.query('select * from users where id = ?',[req.params.id], 
//     function (err, results, fields){
//         if(err) throw err;
//             res.end(JSON.stringify(results));      
//     });
// });

//forgot-password
app.get('/forgot-password', function(req, res){
    res.render('password');
});

app.post('/forgot-password', api.forgot);

//reset-password
app.post('/reset-password', api.reset);

app.listen(8080);

