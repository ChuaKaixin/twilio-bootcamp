const express = require("express");
const router = express.Router();

const {accountSid, authToken, us_phone, call_wait_url, webhook_url} = require ('./constants');

const twilioClient = require('twilio')(accountSid, authToken);
// Get twilio-node from twilio.com/docs/libraries/node
const webhooks = require('twilio/lib/webhooks/webhooks');
const request = require('request');

// The Twilio request URL
//const url = 'https://sarah-5212.twil.io/send-sms';
const url = 'https://sarah-5212.twil.io/trigger_studio';



router.post('/function',(req, res) => {
/**
    params = {};
    const signature = webhooks.getExpectedTwilioSignature(authToken, url, params);
    console.log(`signature: ${signature}`)
    const options = {
        method: "POST",
        url: url,
        form: params,
        headers: {
          'X-Twilio-Signature': signature
        }
    }
  
    request(options, function(error, response, body){
        console.log(JSON.stringify(response));

         res.json(response)
    });**/
    //const twilioClient = context.getTwilioClient();
    twilioClient.studio.v1.flows('FW54e6bff911025bc35c2679f717a4b0d0').
    executions.create({ to: '+6581259138', from: '+6531385226'})
    .then(function(execution) { 
        console.log(execution.sid); })
    res.json({status:"ok"})
 })


 module.exports = router;