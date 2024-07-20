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
  const folders = await getFoldersByUid(uid)
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
  const findUserQuery = `
    SELECT password from users
    WHERE username=$1
  `
  let passwordRes = await db.query(findUserQuery, [username])

  if (passwordRes.rowCount === 0) {
    res.status(404).send({msg:"Username does not exist"})
  } else {
    const matchResult = await bcrypt.compare(password, passwordRes.rows[0].password)
    if (matchResult) {

      const uid = await getUidFromUsername(username)
      const folders = await getFoldersByUid(uid);

      let data = {
        "username": username,
        "uid": uid,
      }

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
    const uid = await getUidFromUsername(username);
    const folders = await getFoldersByUid(uid);
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
    const getFolderQuery = `
      SELECT links from folders
      WHERE fid=$1
    `
    const getFolderRes = await db.query(getFolderQuery, [fid])
    let updatedLinks = getFolderRes.rows[0].links

    let newLinkId = generateRandomId(10)
    while (updatedLinks[newLinkId] != undefined) {
      newLinkId = generateRandomId(10)
    }
    
    updatedLinks[newLinkId] = {
      "link": newLink,
      "linkname": newLinkName,
      "linkId": newLinkId
    }

    await updateFolderLinks(fid, updatedLinks)

    const userFolders = `
      SELECT * FROM folders
      WHERE uid=$1
    `
    const incLinkNumQuery = `
      UPDATE users
      SET numlinks=numlinks+1
      WHERE uid=$1
    `

    await db.query(incLinkNumQuery, [uid])
    const userFoldersRes = await db.query(userFolders, [uid]) 
    res.status(201).json({"folders":userFoldersRes.rows});
  } catch(err) {
    console.log(err)
    res.status(500).send(); 
  }


})

app.delete("/api/links", authenticateToken, async (req, res) => {
  try {
    const linkId = req.body.linkId;
    const fid = req.body.fid;
    const uid = req.body.uid;

    const getFolderQuery = `
      SELECT links FROM folders
      WHERE fid = $1
    `;

    let result = await db.query(getFolderQuery, [fid]);
    let updatedLinks = result.rows[0].links;
    
    delete updatedLinks[linkId];

    const linksJson = JSON.stringify(updatedLinks);
    await updateFolderLinks(fid, linksJson);
    const decLinkNumQuery = `
      UPDATE users
      SET numlinks=numlinks-1
      WHERE uid=$1
    `

    await db.query(decLinkNumQuery, [uid])

    let folders = await getFoldersByUid(uid);
    res.status(200).json({ "folders": folders });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).send();
  }
});

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

app.post("/api/folders", authenticateToken, async (req, res) => {
  try {
    const uid=req.body.uid
    const folderName=req.body.folderName

    const getFoldersQuery = `
      SELECT * FROM folders
      WHERE fid=$1
    `

    let newFolderId = generateRandomId(10)
    let matchingFoldersRes = await db.query(getFoldersQuery, [newFolderId])
    while (matchingFoldersRes.rowCount != 0) {
      newFolderId = generateRandomId(10)
      matchingFoldersRes = await db.query(getFoldersQuery, [newFolderId])
    }

    const createFolderQuery = `
      INSERT INTO folders (fid, uid, parentid, name, links)
      VALUES ($1, $2, $3, $4, $5)
    `

    await db.query(createFolderQuery, [newFolderId, uid, null, folderName, "{}"])

    const getUserFoldersQuery = `
      SELECT * FROM folders
      WHERE uid=$1
    `
    const folderRes = await db.query(getUserFoldersQuery, [uid])
    const folders = folderRes.rows;
    res.status(201).json({folders: folders})

  }catch(err) {

  }
})

async function getUidFromUsername(username) {
  const getUID = `
    SELECT uid from users
    WHERE username=$1
  `

  const uidRes = await db.query(getUID, [username])
  return uidRes.rows[0].uid;
}

async function getFoldersByUid(uid) {
  const getFoldersQuery = `
    SELECT * FROM folders
    WHERE uid=$1
  `

  const folderRes = await db.query(getFoldersQuery, [uid])
  return folderRes.rows;
}

async function updateFolderLinks(fid, links) {
  const updateFolderQuery = `
    UPDATE folders
    SET links = $1
    WHERE fid = $2
  `;

  // Log the query and the parameters
  console.log("Executing query:", updateFolderQuery);
  console.log("With values:", links, fid);

  await db.query(updateFolderQuery, [links, fid]);
}

async function getUidFromUsername(username) {
  const getUID = `
    SELECT uid from users
    WHERE username=$1
  `
  const uidRes = await db.query(getUID, [username])
  return uidRes.rows[0].uid;
}


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