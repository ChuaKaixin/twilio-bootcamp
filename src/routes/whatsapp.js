const express = require("express");
const router = express.Router();

const fetch = require('node-fetch');
var base64 = require('base-64');

const {accountSid, authToken, flexAccountSid,flexAuthToken,outgoingwa,incomingwa,flexchatsid} = require ('./constants');

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

router.post('/callback',(req, res) => {
   console.log(JSON.stringify(req.body));
   const twiml = new MessagingResponse();
   
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
})

channeltowaMap = {}
watochannelMap = {}

router.post('/flex-outbound',(req, res) => {
   console.log(`From ${JSON.stringify(req.body)}`);
   console.log(`Sending to ${channeltowaMap[req.body.channelSid]}`)
   //some logic to determine the end user to send to
   if(!req.body.From.startsWith("whatsapp:")) {
      client.messages
      .create({
         from: outgoingwa,
         body: req.body.Body,
         to: channeltowaMap[req.body.ChannelSid]
       })
      .then(message => console.log(message.sid));
   }
   res.writeHead(200, {'Content-Type': 'text/xml'});
})

router.post('/flex-redirect',(req, res) => {
   
   const flexclient = require('twilio')(flexAccountSid, flexAuthToken);
   console.log(`From ${req.body.From}`);
   //res.json({status:'OK'})
   //adhoc logic to decide whether to create the channel or send to an existing one. 
   //More rounded logic required to store the info and manage the channels
   if(!watochannelMap[req.body.From]) {
      flexclient.flexApi.channel
      .create({
      flexFlowSid: 'FO702ebc05c79785d45c3dab3d5777f7ee',
      identity: req.body.From,
      chatUserFriendlyName: req.body.From,
      chatFriendlyName: 'Flex Custom Chat',
      target: req.body.From 
      })
      .then(channel => {
      console.log(`Created new channel ${channel.sid}`);
      watochannelMap[req.body.From] = channel.sid;
      channeltowaMap[channel.sid] = req.body.From;
      flexclient.chat
         .services(flexchatsid)
         .channels(channel.sid)
         .webhooks.create({
            type: 'webhook',
            'configuration.method': 'POST',
            'configuration.url': `http://bbace2534ca7.ngrok.io/api/whatsapp/flex-outbound?channel=${channel.sid}&wanum=${req.body.From}`,
            'configuration.filters': ['onMessageSent']
         }).then(webhook => {
            console.log(`${JSON.stringify(webhook)}`)
            const params = new URLSearchParams();
            params.append('Body', req.body.Body);
            params.append('From', req.body.From);
            fetch(
               `https://chat.twilio.com/v2/Services/${flexchatsid}/Channels/${webhook.channelSid}/Messages`,
               {
                  method: 'post',
                  body: params,
                  headers: {
                  'X-Twilio-Webhook-Enabled': 'true',
                  Authorization: `Basic ${base64.encode(flexAccountSid+":"+flexAuthToken)}`
                  }
               }
            )
         })
      })
      .catch(error => {console.log(error)}) 
   } else {
      console.log(`sending to channel ${watochannelMap[req.body.From]}`)
      const params = new URLSearchParams();
      params.append('Body', req.body.Body);
      params.append('From', req.body.From);
      fetch(
         `https://chat.twilio.com/v2/Services/${flexchatsid}/Channels/${watochannelMap[req.body.From]}/Messages`,
         {
            method: 'post',
            body: params,
            headers: {
            'X-Twilio-Webhook-Enabled': 'true',
            Authorization: `Basic ${base64.encode(flexAccountSid+":"+flexAuthToken)}`
            }
         }
      )


   }

  res.writeHead(200, {'Content-Type': 'text/xml'});
   //res.json({status:"OK"})
})

let playInfo = {}
router.post('/multiplication_challenge',(req, res) => {
   console.log(JSON.stringify(req.body));
   const twiml = new MessagingResponse();
   msg = "";
   if(!playInfo[req.body.From]) {
      msg = generateQuestion(req.body.From, false);
   } else {
      info = playInfo[req.body.From];
      if(info.currentA===parseInt(req.body.Body)) {
         if(info.correct===4) {
            msg = "YOU WIN. THANKS FOR PLAYING."
            playInfo[req.body.From] = undefined;
         } else {
            msg = generateQuestion(req.body.From, false);
         }
      } else {
         msg = `Wrong. \nThe correct answer is ${info.currentA}.\nGAME OVER.`
         playInfo[req.body.From] = undefined;
      }
   }
   twiml.message(msg);
   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString());
})

function generateQuestion(player, isCorrect) {
   num1 = Math.floor((Math.random() * 10) + 1);
   num2 = Math.floor((Math.random() * 10) + 1);
   if(!playInfo[player]) {
      playInfo[player] = {
         correct:0,
         answered:0,
         currentQ:`${num1} X ${num2}`,
         currentA:num1*num2
      };
      msg = "Answer 5 questions correctly to win!\n";
      msg+= `Q${playInfo[player].answered + 1}. ${playInfo[player].currentQ}`
      return msg;
   } else {
      playInfo[player] = {
         correct:playInfo[player].correct +1,
         answered:playInfo[player].answered +1,
         currentQ:`${num1} X ${num2}`,
         currentA:num1*num2
      }
      msg = "Right. Next question.\n"
      msg+= `Q${playInfo[player].answered + 1}. ${playInfo[player].currentQ}`
      return msg;
   }
}
module.exports = router;