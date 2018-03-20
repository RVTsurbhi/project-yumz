var async = require('async');
var con = require('./../utils/models');
var validation = require('./../utils/validation');
var response = require('./../utils/response');
var query = require('./../utils/query');
var random_key = require('./../utils/function');
var auth = require('./../utils/middleware');
var nodemailer = require('./../utils/nodemailer');


//sign-up

exports.signup = function(req, res){
    var body={
        email:{
            value : req.body.email || null,
            required: 1,
            is_email:1
        },
        name:{
            value: req.body.name || null,
            required: 1,
        },
        password:{
            value: req.body.password || null,
            required:1
        },
        shop_name:{
            value: req.body.shop_name
        },
        shop_img:{
            value: req.body.shop_img
        },
        user_img:{
            value: req.body.user_img
        }
    };

    async.waterfall([
        function(cb){
            validation.customValidator(body, cb);
        },
        function(cb){
            var sql = 'select * from users where email =?'
            var param = [body.email.value]
            query.query(sql, param, "row", cb);
        },
        function(row, cb){
            if(row){
                req.body.email == row.email
                cb("email alredy exist", null);
            }else{
                var sql = 'insert into users set email =?, name=?, password=?, shop_name=?, user_img=?, img_shop=?';
                var param = [body.email.value, body.name.value, body.password.value, body.shop_name.value, body.user_img.value, body.shop_img.value];
                query.query(sql, param, "id", cb);
            }
        },
        function(create, cb){
            if(create){
                var session_id = random_key.random_key();
                var sql = 'insert into session set session_id=?, user_id =?'
                cb(null,{
                    session_id : session_id,
                });

                var param = [session_id, create]
                query.query(sql, param, "id", null);
            }else{
                cb("user not found", create);
            }
        }
    ], function(err,result){
        response.response(err, result, res);
    });
};

//login api
exports.login = function(req, res){
    var body ={
        email:{
            value: req.body.email,
            required : 1
        },
        password:{
            value: req.body.password,
            required :1
        }
    };

    async.waterfall([
        function(cb){
            validation.customValidator(body, cb);
        },
        function(cb){
            var sql = 'select * from users where email =?';
            var param = [body.email.value];
            query.query(sql, param, "row", cb);
        },
        function(user, cb){
            if(user){
                if(req.body.password == user.password){
                    var sess = random_key.random_key();
                    cb(null,{
                        session_id : sess
                    });
                    var sql = 'insert into session set session_id =?, user_id=?';
                    var param = [sess, user.id];
                    query.query(sql,param, "id", cb);

                }else{
                    cb("password is wrong", user);
                }                  
            }else{
                cb("email and password are wrong", user);
            }
        }
    ], function(err, result){
       response.response(err, result, res);
    });
}


//update profile
exports.update = function(req, res){
    var body = {
        session_id:{
            value: req.headers.authorization,
            required:1
        },
        name:{
            value: req.body.name
        },
        shop_name:{
            value: req.body.shop_name
        },
        location:{
            value: req.body.location
        },
        bio:{
            value: req.body.bio
        },
        shop_img:{
            value: req.body.shop_img
        },
        user_img:{
            value: req.body.user_img
        }
    };

    async.waterfall([
        function(cb){
            validation.customValidator(body, cb);
        },
        function(cb){
            console.log(body.session_id.value);
            auth.auth(body.session_id.value,["name","shop_name","location","description","img_shop","user_img"], cb);
        },
        function(login, cb){
            cb(null,{
                message: "profile updated"
            });
            var sql = 'update users set name=?, shop_name=?, location=?, description=?, img_shop=?, user_img=? where id = ?';
            var param = [body.name.value, body.shop_name.value, body.location.value, body.bio.value, body.shop_img.value, body.user_img.value, login.user_id];
            query.query(sql, param, "affectedrows", null);
        }
    ], function(err, result){
        response.response(err, result, res);
    })
}

//get users

exports.getUser = function(req, res){
    var body = {
        id:{
            value: req.params.id
        }
    };

    async.waterfall([
        function(cb){
            validation.customValidator(body , cb);
        },
        function(cb){
            var sql = 'select * from users where users.id=?'
            query.query(sql, [body.id.value], 'result', cb)
        }
    ], function(err, result){
        response.response(err, result, res);
    })
};

//forgot-password
exports.forgot = function(req, res){
    var body ={
        email: {
            value:req.body.email,
            required:1
        }
    };

    async.waterfall([
        function(cb){
            validation.customValidator(body, cb);
        },
        function(cb){
            var sql = 'select * from users where email=?'
            var param = [body.email.value]
            query.query(sql, param, "row", cb);
        },
        function(users, cb){
            if(!users){
                console.log(body);
                cb("email does not exist", null);
            }else{
                var token = random_key.random_key();

                var sql = 'update users set reset_password_token=? where email = ?'
                var param = [token, users.email]
                query.query(sql, param, "affectedrows", cb);

                var url = "http://localhost:8080/forgot-password?token="
                
                nodemailer.resetPassword({email: users.email, name: users.name},{},
                    {
                    subject: "Forgot Password?",
                    message : "To reset your password, click the link here.",
                    url : "http://localhost:8080/forgot-password?token=" + token      
                })
            }
        }
    ], function(err, result){
        response.response(err, result, res);
    })
};

//reset-password
exports.reset = function(req, res){
    var body = {
        password:{
            value: req.body.password,
            required:1
        },
        token:{
            value: req.body.token,
            required: 1
        }
    };

    async.waterfall([
        function(cb){
            validation.customValidator(body, cb);
        },
        function(cb){
            var sql = 'select * from users where reset_password_token = ?'
            var param =[body.token.value]
            query.query(sql, param, "row", cb)
        },
        function(user, cb){
            if(!user){
                cb("not found", null);
            }else{
                var sql = 'update users set password =? where id=?'
                var param = [body.password.value, user.id]
                query.query(sql, param, "affectedrows", cb);

            nodemailer.resetPassword({email: user.email, name:user.name},{},{
                subject: "success",
                message:"your password successfully updated"
            })               
            }
            
        }
    ], function(err, result){
        response.response(err, result, res);
    });
}