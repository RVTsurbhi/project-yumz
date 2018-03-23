const fns = require('./../utils/function');

exports.send_otp = function(phone, code){

  const accountSid = 'ACd029f062e3e1a56de901385bbb7fb532';
  const authToken = '4d172ce8d083f11a938db4b9ffeb5163';
  
  // require the Twilio module and create a REST client
  const client = require('twilio')(accountSid, authToken);
  client.messages
    .create({
      to: phone,
      from: '+12087124560',
      body: 'your verification code is' + code,
    })
    .then(message => console.log(message.sid));
}