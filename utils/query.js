var con = require('./../utils/models');

exports.query = function(sql, params, ret = "result", callback){
    con.query(sql, params, function(err, result){
        console.log("sql error" , err);

        if (callback !== null){
            switch(ret){
                case "result":
                    callback(err, result);
                    break;

                case "row":
                    callback(err, result && result[0] ? result[0]: null);
                    break;
                    
                case "id":
                    callback(err, result && result.insertId ? result.insertId : null);
                    break; 
                    
                case "affectedrows":
                    callback(err, result && result.affectedRows ? result.affectedRows : 0); 
                    break;      
            }

        }
    })
}