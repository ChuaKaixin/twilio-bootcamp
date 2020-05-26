
var express = require('express');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
const smsVoiceRouter = require("./routes/sms_voice");
app.use("/api/sms_voice", smsVoiceRouter);

const whatsappRouter = require("./routes/whatsapp");
app.use("/api/whatsapp", whatsappRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = status.NOT_FOUND;
  next(err);
});


module.exports = app;
