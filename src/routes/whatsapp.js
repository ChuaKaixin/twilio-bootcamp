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