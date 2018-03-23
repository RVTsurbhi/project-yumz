var async = require('async');
var con = require('./../utils/models');
var validation = require('./../utils/validation');
var response = require('./../utils/response');
var query = require('./../utils/query');
var random_key = require('./../utils/function');
var auth = require('./../utils/middleware');
var nodemailer = require('./../utils/nodemailer');
var send = require('./../utils/twilio');
// const fns = require('./../utils/function');


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
        },
        fb_id:{
            value: req.body.fb_id || null
        },
        google_id:{
            value: req.body.google_id || null
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
                var sql = 'insert into users set email =?, name=?, password=?, shop_name=?, user_img=?, img_shop=?, fb_id=?, google_id=?';
                var param = [body.email.value, body.name.value, body.password.value, body.shop_name.value, body.user_img.value, body.shop_img.value, body.fb_id.value, body.google_id.value];
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

    async.waterfall([
        // function(cb){
        //     validation.customValidator(body , cb);
        // },
        function(cb){
            var sql = 'select * from users'
            query.query(sql, [], 'result', cb)
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

//users device

exports.users_device = function (req, res){
    var body = {
        session_id:{
            value: req.headers.authorization,
            required:1
        },
        device_type:{
            value: req.body.device_type,
            required: 1
        },
        device_id:{
            value: req.body.device_id,
            required: 1
        },
        device_token:{
            value: req.body.device_token
        }
    };
    async.waterfall([
        function(cb){
            validation.customValidator(body, cb)
        },
        function(cb){
            auth.auth(body.session_id.value,[], cb);
        },
        function(login, cb){
            var code = Math.floor(1000 + Math.random() * 9000)

            var sql = 'insert into users_device set device_type =?, device_id=?, device_token=?, users_id=?'
            var param = [body.device_type.value, body.device_id.value, code, login.user_id]
            query.query(sql, param, "id", cb);
        }
    ], function(err, result){
        response.response(err, result, res);
    });
};

//sending otp
exports.insertion = function(req, res){
    var body ={
        session_id:{
            value: req.headers.authorization,
            required:1
        },
        phone_no:{
            value: req.body.phone_no,
            required:1
        }
    };
  
    async.waterfall([
        function(cb){     
          validation.customValidator(body, cb)
        },
        function(cb){
            
            auth.auth(body.session_id.value,[], cb);
        },
        function(login, cb){
            
                var code = random_key.random_key(5, 1);
                console.log(body)
                
                var sql = 'insert into `otp_verify` set phone_no=?, otp=?, user_id=?'
                var param = [body.phone_no.value, code, login.user_id]
                query.query(sql, param, "id", cb);

                // send.send_otp(body.phone_no.value, code);
        }
    ], function(err, result){
        console.log(4)
        response.response(err, err ? result : {
            message: "Otp is sent"
        }, res);
    });
        
};

//veryfying otp
// exports.verify = function(req, res){
//     var body ={
//         // session_id:{
//         //     value: req.headers.authorization,
//         //     required: 1
//         // },
//         phone_no:{
//             value: req.body.phone_no,
//             required:1
//         },
//         otp: {
//             value: req.body.otp
//         }
//     };
//     async.waterfall([
//         function(cb){
//             validation.customValidator(body, cb);
//         },
//         // function(cb){
//         //     auth.auth(body.session_id.value,[], cb);
//         // },
//         function( cb){
//                 var sql = 'select * from `otp_verify` where phone_no=?'
//                 var param = [body.phone_no.value]
//                 query.query(sql, param, "row", cb)
//         },
//         function(user, cb){
//             if(user){
//                 if(body.otp.value == user.otp)
//                 cb("confirmed", null)
//             }else{
//                 cb("otp does not match", user)
//             }
//         }
//     ],function(err, result){
//         response.response(err, result, res);
//     });
// }

//social-login
exports.login = function(req, res){
    var body ={
        email:{
            value: req.body.email,
            required: req.body.password ? 1 : 0
        },
        password:{
            value: req.body.password,
            required: 0
        },
        fb_id:{
            value: req.body.fb_id,
            required: req.body.password || req.body.google_id ? 0 : 1
        },
        google_id:{
            value: req.body.google_id,
            required: req.body.password || req.body.fb_id ? 0 : 1
        },
        name: {
            value: req.body.name,
            required: req.body.google_id || req.body.fb_id ? 1 : 0
        }
    };

    async.waterfall([
        function(cb){
            validation.customValidator(body, cb);
        },
        function(cb){
            // email and password
            
            if(body.password.value){
                var sql = 'select * from users where email =?';
                var param = [body.email.value]
            }else if(body.fb_id.value){
                var sql = 'select * from users where fb_id=?';
                var param = [body.fb_id.value]
            }else{
                var sql = 'select * from users where google_id=?'
                var param = [body.google_id.value]
            }
            
            query.query(sql , param, "row", cb);
        },
        function(user, cb){
            if(user){
                if(body.password.value){
                    if(body.password.value == user.password){
                        createSession(user.id, cb);
                    }else{
                        cb("password is wrong", user);
                    }                  
                }else{
                    createSession(user.id, cb);
                }
            }else if(!body.password.value){
                // login with fb_id or google_id for new user
                async.waterfall([
                    function(cb){
                        sql = "insert into users set fb_id=?, google_id=?, email=?, name=? on duplicate key update fb_id=?, google_id=?";
                        query.query(sql, [
                            body.fb_id.value,
                            body.google_id.value,
                            body.email.value,
                            body.name.value,
                            body.fb_id.value,
                            body.google_id.value
                        ], "id", cb);
                    },
                    function(id, cb){
                        createSession(id, cb);
                    }
                ], function(err, result){
                    cb(err, result);
                });
                
            }else{
                cb("email and password are wrong", null);
            }
        }
    ], function(err, result){
       response.response(err, result, res);
    });
}

function createSession(id, cb){
    var sess = random_key.random_key();
                    cb(null,{
                        session_id : sess
                    });
                    var sql = 'insert into session set session_id =?, user_id=?';
                    var param = [sess, id];
                query.query(sql,param, "id", null);
};



// exports.insertion = function(req, res){
//     var body ={
//         phone_no:{
//             value: req.body.phone_no,
//             required:1
//         },
//         session_id:{
//             value: req.headers.authorization,
//             required:1 
//         }
//     };
  
//     async.waterfall([
//         function(cb){
//           validation.checkValidations(body, cb)
//         },
//         function(cb){
//             auth.auth(body.session_id.value,[], cb);
//         },
//         function(login, cb){
//                 // var code = fns.random_key(5, 1);
//                 var code = Math.floor(1000 + Math.random() * 9000);
                
//                 var sql = 'insert into `otp_verify` set phone_no=?, otp=?, user_id=?'
//                 var param = [body.phone_no.value, code, login.user_id]
//                 query.query(sql, param, "id", cb)

//                 // send.send_otp(body.phone_no.value, code);
//         }
//     ], function(err, result){
//         response.response(err, result, res);
//      });
        
// };