//to create a common function for session token

exports.random_key = function(length=5, is_numeric=0) {

    var text = "";
    if(is_numeric){ 
      var possible = "0123456789";
    }else{
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }
    
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  };
 

