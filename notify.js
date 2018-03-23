var express = require('express');
var fs = require('fs');
var FCM = require('fcm-node');
    
var serverKey = require('AAAAFB7JsaE:APA91bHDWqnlQb9gXuzZzZ8PqBowJW2AEXKpG5TGtpBmMpbGehzgeDKtE85iEizWM0H7bYgKX-K_Q0S9kC5mfv6C4EdB_kBXb_bCK1Luioc4mDZPzGru8uF-RUkOTbLbFK5ZCDdb3in0') //put the generated private key path here    

var fcm = new FCM(serverKey)

exports.fcmapi = function(req, res){
    var message = {
        to: '8eed0c1a068a10173ab3352037e907d28d64d332', 
        collapse_key: 'your_collapse_key',
        
        notification: {
            title: 'hola', 
            body: 'gracias' 
        },
        
        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    }
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!")
        } else {
            console.log("Successfully sent with response: ", response)
        }
    })
};