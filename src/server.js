const app = require("./app");

const server = app.listen(process.env.PORT || 8081, function() {
  console.log("Listening on port " + server.address().port);
});
