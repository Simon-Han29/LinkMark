const db = require("./db");

const createUser = async () => {
  const deleteUsersTableQuery = `
    DROP TABLE IF EXISTS users;
  `;

  const deleteFoldersTableQuery = `
    DROP TABLE IF EXISTS folders;
  `;

  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      uid VARCHAR(10) NOT NULL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      numlinks INT DEFAULT 0,
      numfolders INT DEFAULT 1
    );
  `;

  const createFoldersTableQuery = `
    CREATE TABLE IF NOT EXISTS folders (
      fid VARCHAR(10) NOT NULL PRIMARY KEY,
      uid VARCHAR(10) NOT NULL,
      parentid VARCHAR(10),
      name VARCHAR(100) NOT NULL,
      links JSONB,
      FOREIGN KEY (uid) REFERENCES users(uid)
    );
  `;

  try {
    await db.query(deleteFoldersTableQuery); // Drop folders table first because of foreign key dependency
    await db.query(deleteUsersTableQuery);
    await db.query(createUsersTableQuery);
    await db.query(createFoldersTableQuery);
    console.log("Tables created successfully.");
  } catch (err) {
    console.log("Error creating tables,", err);
  }
};

const initDB = async () => {
  await createUser();
  db.end();
};

initDB();
