
require("dotenv").config();

 const accountSid = process.env.ACCOUNT_SID;
 const authToken = process.env.AUTH_TOKEN;
 const us_phone = process.env.US_PHONE;
 const call_wait_url = process.env.CALL_WAIT_URL;
 const webhook_url = process.env.WEBHOOK_URL;
 const flexAccountSid = process.env.FLEX_ACCOUNT_SID;
 const flexAuthToken = process.env.FLEX_AUTH_TOKEN;
 const outgoingwa = process.env.OUTGOING_WANUM;
 const incomingwa = process.env.INCOMING_WANUM;
 const flexchatsid = process.env.FLEX_CHAT_SID;

module.exports = {
    accountSid,
    authToken,
    us_phone,
    call_wait_url,
    webhook_url,
    flexAccountSid,
    flexAuthToken,
    outgoingwa,
    incomingwa,
    flexchatsid
}