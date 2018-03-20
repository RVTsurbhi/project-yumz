var async = require('async');
var con = require('./../utils/models');
var query = require('./../utils/query');

exports.auth = function(session_id, user_columns, cb){
    async.waterfall([
        function(cb){
            if(!session_id){
                cb(401, "user not authorized");
            }else{
                var sql = 'select u.*, s.* from `users` as `u` join `session` as `s` on `u`.id = `s`.user_id where `s`.session_id = ?';
                query.query(sql,[session_id], "row", cb);
            }
        },
        function(login, cb){
            if(!login){
                cb(401, "your session has expired");
            }else{
                cb(null, login);
            }
        }
    ], function(err, result){
        cb(err, result);
    });
}