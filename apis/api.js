var async = require('async');
var con = require('./../utils/models');
var validation = require('./../utils/validation');
var response = require('./../utils/response');
var query = require('./../utils/query');
var common = require('./../utils/function');


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
                var session_id = common.random_key();
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
                    var sess = common.random_key();
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