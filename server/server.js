const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const db = require("./db")
const bcrypt = require("bcrypt")
// const jwtSecretKey = process.env.NEXT_PUBLIC_JWT_SECRET
const jwtSecretKey = "milotic"
const app = express();
const PORT = 8082;

//middleware
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(cookieParser());
app.use(express.json())

app.post("/api/signup", async(req, res) => {
  const {username, password} = req.body;
  try {
    const checkExistingUsernameQuery = `
      SELECT * from users
      WHERE username=$1
    `
    let usersWithUsername = await db.query(checkExistingUsernameQuery, [username])
    if (usersWithUsername.rows.length > 0) {
      res.status(409).json({msg:"Username taken"})
    } else {
      const uid = generateRandomId(10)
      //ensure uid does not exist
  
      const checkExistingUidQuery = `
        SELECT * from users
        WHERE uid=$1
      `
      let usersFound = await db.query(checkExistingUidQuery, [uid])
      while (usersFound.rows.length !== 0) {
        uid = generateRandomId(10)
        usersFound = await db.query(checkExistingUidQuery, [uid])
      }
  
      const hashedPassword = await bcrypt.hash(password, 10)
      const registerUserQuery = `
        INSERT INTO users (uid, username, password, links)
        VALUES ($1, $2, $3, $4)
      `
  
      await db.query(registerUserQuery, [uid, username, hashedPassword, "{}"])
      res.status(201).json({msg:"User registered successfully"}) 
    }
  } catch(err) {
    console.log(err)
    res.status(400).json({msg:"Error registering user", err})
  }
  
})

app.post("/api/login", async (req, res) => {
  const {username, password} = req.body;
  console.log(jwtSecretKey)
  const findUserQuery = `
    SELECT password from users
    WHERE username=$1
  `
  let passwordRes = await db.query(findUserQuery, [username])
  //if user does not exist
  if (passwordRes.rowCount === 0) {
    res.status(404).send({msg:"Username does not exist"})
  } else {
    console.log(password)
    const matchResult = await bcrypt.compare(password, passwordRes.rows[0].password)
    console.log(matchResult)
    if (matchResult) {
      let data = {
        username
      }
      const token = jwt.sign(data, jwtSecretKey)
      res.status(201).json({msg:"Login Successful", token})
    } else {
      res.status(409).json({msg: "Incorrect Password"})
    }
  }
})

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

app.listen(PORT, () => {console.log(`Listening on port ${PORT}`)});