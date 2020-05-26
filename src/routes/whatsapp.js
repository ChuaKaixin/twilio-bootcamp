const express = require("express");
const router = express.Router();

const {accountSid, authToken, us_phone, call_wait_url, webhook_url} = require ('./constants');

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

router.post('/callback',(req, res) => {
   console.log(JSON.stringify(req.body));
   const twiml = new MessagingResponse();
   
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
})


module.exports = router;