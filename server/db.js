const {Client} = require("pg")
const client = new Client({
  user: "postgres",
  password: "fishanator29",
  host: "localhost",
  port: 5432,
  database: "LinkMark" 
})

client.connect();

module.exports = client;