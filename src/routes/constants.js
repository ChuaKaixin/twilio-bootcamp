
require("dotenv").config();

 const accountSid = process.env.ACCOUNT_SID;
 const authToken = process.env.AUTH_TOKEN;
 const us_phone = process.env.US_PHONE;
 const call_wait_url = process.env.CALL_WAIT_URL;
 const webhook_url = process.env.WEBHOOK_URL;

module.exports = {
    accountSid,
    authToken,
    us_phone,
    call_wait_url,
    webhook_url
}