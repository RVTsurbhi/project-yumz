var mysql = require('mysql');

var con = mysql.createConnection({
    host : "localhost",
    user : "root",
    password: "welcome",
    database : "app"
});

con.connect(function (err) {
    if(!err){
        console.log("connected");
    }else{
        console.log("error");
    }
});

module.exports = con;