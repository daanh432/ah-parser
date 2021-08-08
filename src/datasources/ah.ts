const Enmap = require("enmap");

// non-cached, auto-fetch enmap:
const db = new Enmap({
  name: "db",
  autoFetch: true,
  fetchAll: false,
});


export {db}