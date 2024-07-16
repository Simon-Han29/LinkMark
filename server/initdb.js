const db = require("./db")

const createUsersTableQuery =  async() => {
  const deleteUsersTableQuery = `
    DROP TABLE IF EXISTS users;
  `

  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      uid VARCHAR(10) NOT NULL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      links JSONB
    )
  `

  try {
    await db.query(deleteUsersTableQuery);
    await db.query(createUsersTableQuery)
    console.log("Users table created successfully.")
  } catch(err) {
    console.log("Error creating users table,", err)
  }
}
const initDB = async () => {
  await createUsersTableQuery();
  db.end();
}

initDB();