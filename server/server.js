const {jwtDecode} = require("jwt-decode")
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

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]
  if (!token) return res.status(403).send();

  jwt.verify(token, jwtSecretKey, (err, data) => {
    if (err) return res.status(403).send();
    next();
  })
}


app.get("/api/folders", authenticateToken, async(req, res) => {
  const token = req.headers["authorization"]
  const decoded = jwtDecode(token)
  const uid = decoded.uid;
  
  const getFoldersQuery = `
    SELECT * FROM folders
    WHERE uid=$1
  `
  const folderRes = await db.query(getFoldersQuery, [uid])

  const folders = folderRes.rows
  res.status(200).json(folders)
})

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

      //create default folder
      //check give an id to the folder, make sure it does not exist
      const defaultFid = generateRandomId(10);

      const findFolderQuery = `
        SELECT * FROM folders
        WHERE fid=$1
      `
      const folderFound = await db.query(findFolderQuery, [defaultFid])
      while (folderFound.rowCount !== 0) {
        defaultFid = generateRandomId(10)
        folderFound = await db.query(findFolderQuery, [defaultFid])
      }


      const registerUserQuery = `
        INSERT INTO users (uid, username, password)
        VALUES ($1, $2, $3)
      `
      const initDefaultFolder = `
        INSERT INTO folders (fid, uid, parentid, name, links)
        VALUES ($1, $2, $3, $4, $5)
      `
      await db.query(registerUserQuery, [uid, username, hashedPassword])
      await db.query(initDefaultFolder, [defaultFid, uid, null, "Default", "{}"])
      
      res.status(201).json({msg:"User registered successfully and default folder created"}) 
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

      const getUID = `
        SELECT uid from users
        WHERE username=$1
      `

      const uidRes = await db.query(getUID, [username])
      const uid = uidRes.rows[0].uid;

      const getFoldersQuery = `
        SELECT * FROM folders
        WHERE uid=$1
      `

      const folderRes = await db.query(getFoldersQuery, [uid])
      console.log("Folder res")
      console.log(folderRes);
      const folders = folderRes.rows;

      let data = {
        "username": username,
        "uid": uid,
      }

      console.log(data)

      const token = jwt.sign(data, jwtSecretKey)
      res.status(201).json({msg:"Login Successful", "token": token, "folders": folders})
    } else {
      res.status(409).json({msg: "Incorrect Password"})
    }
  }
})

app.get("/folders", authenticateToken,  async(req, res) => {
  try {
    const username = req.params.username;
    const getUID = `
      SELECT uid from users
      WHERE username=$1
    `
    const uidRes = await db.query(getUID, [username])
    const uid = uidRes.rows[0].uid;
    const getFoldersQuery = `
      SELECT * FROM folders
      WHERE uid=$1
    `
    const folderRes = await db.query(getFoldersQuery, [uid])
    const folders = folderRes.rows;
    res.status(201).json({"folders":folders})
  } catch(err) {
    res.status(500).send();
  }

})

app.post("/api/links", authenticateToken, async (req, res) => {
  try {
    const newLink = req.body.link;
    const newLinkName = req.body.linkName;
    const fid = req.body.fid
    const uid = req.body.uid
    console.log("Updating folder with id: " + fid)
    const getFolderQuery = `
      SELECT links from folders
      WHERE fid=$1
    `

    const getFolderRes = await db.query(getFolderQuery, [fid])
    let updatedFolder = getFolderRes.rows[0].links

    let newLinkId = generateRandomId(10)
    while (updatedFolder[newLinkId] != undefined) {
      newLinkId = generateRandomId(10)
    }
    
    updatedFolder[newLinkId] = {
      "link": newLink,
      "linkname": newLinkName,
      "linkId": newLinkId
    }
    
    console.log("Updated folder: ")
    console.log(updatedFolder) 
    const updateFolderQuery = `
      UPDATE folders
      SET links=$1
      WHERE fid=$2
    `

    await db.query(updateFolderQuery, [updatedFolder, fid])

    const userFolders = `
      SELECT * FROM folders
      WHERE uid=$1
    `
    console.log("uid:" + uid)

    const userFoldersRes = await db.query(userFolders, [uid])
    console.log("The folder that will be returned: ")
    console.log(userFoldersRes.rows)    
    res.status(201).json({"folders":userFoldersRes.rows});
  } catch(err) {
    console.log(err)
    res.status(500).send(); 
  }


})

app.delete("/api/links", authenticateToken, async(req, res) => {
  try {
    const username = req.body.username;
    const linkId = req.body.linkId;
    const getLinksQuery = `
      SELECT links FROM users
      WHERE username=$1
    `
    let updatedLinks = await db.query(getLinksQuery, [username])
    updatedLinks = updatedLinks.rows[0].links
    delete updatedLinks[linkId]
    const updateLinksQuery = `
      UPDATE users
      SET links=$1
      WHERE username=$2
    `
    await db.query(updateLinksQuery, [updatedLinks, username])
    res.status(201).json(updatedLinks);

  } catch(err) {
    res.status(500).send();
  }
})

app.post("/api/refresh", authenticateToken, async(req, res) => {
  try {
    const uid = req.body.uid
    const username = req.body.username

    const getFoldersQuery = `
      SELECT * FROM folders
      WHERE uid=$1
    `

    const folderRes = await db.query(getFoldersQuery, [uid])
    console.log("Folder res")
    console.log(folderRes);
    const folders = folderRes.rows;

    let data = {
      "username": username,
      "uid": uid,
      "folders": folders
    }

    const token = jwt.sign(data, jwtSecretKey)
    res.status(201).json({msg:"Login Successful", token})
  } catch(err) {

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