
const express = require("express");
const router = express.Router();

const {accountSid, authToken, us_phone, call_wait_url, webhook_url} = require ('./constants');

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

router.get('/', function (req, res) {
   res.send('Hello from sms and voice');
})

//reply with the country
router.post('/sms-1', (req, res) => {
   const twiml = new MessagingResponse();
   
   var fromCountry = req.body.FromCountry;
   twiml.message(`Hi! It looks like your phone number was born in ${fromCountry}`);
 
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
 });

//send sms
router.post('/send_sms', (req, res) => {
   from = req.body.from;
   to = req.body.to;
   body = req.body.body;
   client.messages
      .create({body, from, to})
      .then(message => 
         {
            console.log(message.sid);
            return res.json({messagesid:message.sid})
         });
   
 });


 //to-do list--------
let todoList = []
router.post('/sms', (req, res) => {
   const twiml = new MessagingResponse();
   
   var reqBody = req.body.Body;
   let returnMsg = "";
   let action = {}
   if(reqBody.startsWith("add")) {
      item = reqBody.substr(reqBody.indexOf(' ')+1)
      todoList.push(item);
      returnMsg = `added ${item}`
   } else if(reqBody.startsWith("list")) {
      returnMsg = todoList.reduce((accumulator, currentValue, currentIndex, array) => {
         return accumulator + "" + (currentIndex+1) + ". " + currentValue + " "
     }, "")
     action = {action:"http://a301ac9b.ngrok.io/status",method:"POST"}

   } else if(reqBody.startsWith("remove")) {
      element = parseInt(reqBody.split(" ")[1]);
      removed = todoList.splice(element, 1);
      returnMsg = `removed ${removed}`;
   }
   twiml.message(action, returnMsg);
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
 });



 //status--------
 router.post('/status', (req, res) => {
   var reqBody = req.body;
   var reqHeader = req.headers["X-Twilio-Signature"]
   console.log(`twilio header ${JSON.stringify(req.headers)}`);
   console.log(`Message ID: ${reqBody.SmsSid}`);
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end("OK");
 });

 //check no. of sms
 //status--------
 router.get('/stats', (req, res) => {
   var startDate = req.body.startDate;
   var endDate = req.body.endDate;
   var category = req.body.category;
   filterOpts = {startDate, endDate, category};
  console.log("category is:" + category);
  filterOpts = {category};
   client.usage.records.each(filterOpts, record => 
      {
         console.log(record);
      });
      
  return res.json({ok:"OK"});
 });

 //hang up call and send sms back
 router.post('/handle_call', (req, res) => {
   console.log(JSON.stringify(req.body));
   console.log(`call coming from ${req.body.Caller}`)
   const VoiceResponse = require('twilio').twiml.VoiceResponse;
   const response = new VoiceResponse();
   response.hangup();

   client.messages
   .create({
      body: 'Please send me an email instead at xx@gmail.com. Thanks!',
      from: us_phone,
      to: req.body.Caller
    }).then(message => console.log(`sms sending status: ${JSON.stringify(message)}`));

   //return res.json({ok:"OK"});
 
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(response.toString());
 });
 
//enqueue the call and say call will get recorded
router.post('/enqueue_call', (req, res) => {
   console.log(JSON.stringify(req.body));
   console.log(`call coming from ${req.body.Caller}`)
   const VoiceResponse = require('twilio').twiml.VoiceResponse;
   const response = new VoiceResponse();
   response.enqueue({
    waitUrl: call_wait_url
   }, 'support');

   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(response.toString());
 });

 //say something before the call
router.post('/prep_call_msg', (req, res) => {
   console.log(JSON.stringify(req.body));
   console.log(`call coming from ${req.body.Caller}`)
   const VoiceResponse = require('twilio').twiml.VoiceResponse;
   const response = new VoiceResponse();
   //response.say("Your call will be recorded for training purposes");
   response.record({ recordingStatusCallback:"http://354197e0a647.ngrok.io/api/sms_voice/callback"});
 
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(response.toString());
 });

 //say something before the call
router.get('/play_digits', (req, res) => {
   console.log(JSON.stringify(req.body));
   console.log(`call coming from ${req.body.Caller}`)
   const VoiceResponse = require('twilio').twiml.VoiceResponse;
   const response = new VoiceResponse();

   response.play({
      digits: '123456789'
   });
   response.say("Thanks for listening");
 
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(response.toString());
 });

 //say something before the call
router.post('/record_call', (req, res) => {
   console.log(JSON.stringify(req.body));
   console.log(`call coming from ${req.body.Caller}`)
   const VoiceResponse = require('twilio').twiml.VoiceResponse;
   const response = new VoiceResponse();
   response.say("Please record your message after beep. Press 0 to end");
   response.record({
      transcribe:true,
      playBeep:true,
      trim:true,
      maxLength:20,
      action:webhook_url+"/callback",
      recordingStatusCallback:webhook_url+"/callback",
      finishOnKey:0
      });
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(response.toString());
   });  

router.post('/callback', (req, res) => {
   console.log(JSON.stringify(req.body));
   const twiml = new MessagingResponse();
   /**
   console.log(`CALLBACK----call coming from ${req.body.Caller}`)
   const VoiceResponse = require('twilio').twiml.VoiceResponse;
   const response = new VoiceResponse();
   if(req.body.Caller) {
      response.say("Thank you for your call.");
      response.hangup();
   }**/
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
 });

 router.get('/calllog', (req, res) => {
   /**
   client.calls('CA86ab2c32c11f69760682ae81bbaa3a5a')
         .fetch()
         .then(call => {
            console.log(JSON.stringify(call));
            return res.json(call);

         }); */

   client.calls.list({to:"+6581259138",status:"completed",limit: 2})
      .then(calls => 
         {
            return res.json(calls);
         }
         );
 })


module.exports = router;