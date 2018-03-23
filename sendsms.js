// const SendOtp = require('sendotp');
const fns = require('./utils/function');

// exports.send_otp = function(){

  const accountSid = 'ACd029f062e3e1a56de901385bbb7fb532';
  const authToken = '4d172ce8d083f11a938db4b9ffeb5163';
  var code = fns.random_key(5, 1);

  
  // require the Twilio module and create a REST client
  const client = require('twilio')(accountSid, authToken);
  client.messages
    .create({
      to: '+917973203241',
      from: '+12087124560',
      body: 'your verification code is' + code,
    })
    .then(message => console.log(message.sid));
// }


//'+917973203241'
//Math.floor(1000 + Math.random() * 9000)
//var code = Math.floor((Math.random()*999999)+111111);