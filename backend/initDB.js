require("dotenv").config();
const faker = require("faker");
const getDB = require("./db");
const { formatDateToDB } = require("./helpers");
const { random } = require("lodash");
const fs = require("fs");
const axios = require("axios");
const uuid = require("uuid");

async function downloadImage(url, filepath) {
  const queryResponse = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const imageUrl = queryResponse.data.responseUrl;

  const response = await axios({
    url: imageUrl,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", reject)
      .once("close", () => resolve(filepath));
  });
}

let connection;

async function main() {
  try {
    connection = await getDB();

    // borrar las tablas existentes
    await connection.query(`DROP TABLE IF EXISTS entries_votes`);
    await connection.query(`DROP TABLE IF EXISTS entries_photos`);
    await connection.query(`DROP TABLE IF EXISTS entries`);
    await connection.query(`DROP TABLE IF EXISTS users`);

    console.log("Tablas borradas");

    // creo la tabla usuarios
    await connection.query(`
      CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          date DATETIME NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(512) NOT NULL,
          name VARCHAR(100),
          avatar VARCHAR(50),
          active BOOLEAN DEFAULT false,
          role ENUM("admin","normal") DEFAULT "normal" NOT NULL,
          registrationCode VARCHAR(100),
          deleted BOOLEAN DEFAULT false,
          lastAuthUpdate DATETIME,
          recoverCode varchar(100)
          )
    `);

    // creo la tabla entries
    await connection.query(`
              CREATE TABLE entries (
                  id INT PRIMARY KEY AUTO_INCREMENT,
                  date DATETIME NOT NULL,
                  place VARCHAR(1000) NOT NULL,
                  description TEXT,
                  user_id INT NOT NULL,
                  FOREIGN KEY (user_id) REFERENCES users(id)
                  )
              `);

    // creo la tabla entries_votes
    await connection.query(`
        CREATE TABLE entries_votes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            date DATETIME NOT NULL,
            vote TINYINT NOT NULL,
            entry_id INT NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id),
            user_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // creo la tabla entries_photos
    await connection.query(`
        CREATE TABLE entries_photos (
            id INT PRIMARY KEY AUTO_INCREMENT,
            uploadDate DATETIME NOT NULL,
            photo VARCHAR(50),
            entry_id INT NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id)
        )
    `);

    console.log("Tablas creadas");

    // añado el usuario admin
    await connection.query(`
        INSERT INTO users(date, email, password, name, active, role)
        VALUES (
          "${formatDateToDB(new Date())}", 
          "stefano.peraldini@hackaboss.com",
          SHA2("${process.env.ADMIN_PASSWORD}", 512),
          "Stefano Peraldini", 
          true, 
          "admin");
    `);

    //generamos usuarios random
    const users = 10;

    for (let index = 0; index < users; index++) {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const nombre = faker.name.findName();
      const avatar = `${uuid.v4()}.jpg`;

      const randomAvatarUrl = "https://source.unsplash.com/1600x900/?people";
      const avatarPath = `./uploads/${avatar}`;
      await downloadImage(randomAvatarUrl, avatarPath);

      await connection.query(`
        INSERT INTO users(date,email,password,name,avatar,active)
        VALUES (
          "${formatDateToDB(new Date())}",
          "${email}",
          SHA2("${password}", 512),
          "${nombre}",
          "${avatar}",
          true
        )
        `);
    }

    // introducir varias entradas de entries
    const num_entries = 10;

    for (let index = 0; index < num_entries; index++) {
      const now = new Date();
      const place = faker.address.city();
      const description = faker.lorem.paragraph();
      const userId = random(2, users + 1);

      const [createdEntry] = await connection.query(`
        INSERT INTO entries (date, place, description, user_id)
        VALUES (
                    "${formatDateToDB(now)}",
                    "${place}",
                    "${description}",
                    ${userId}
        )
        `);

      console.log("Created entry:", createdEntry.insertId);

      // Uploads 0-3 images of entry place
      for (let imageIndex = 0; imageIndex < Math.random() * 3; imageIndex++) {
        const entryPlaceImage = `https://source.unsplash.com/1600x900/?place`;
        const imageName = `${uuid.v4()}.jpg`;
        const imagePath = `./uploads/${imageName}`;

        await downloadImage(entryPlaceImage, imagePath);

        await connection.query(`
          INSERT INTO entries_photos (uploadDate, photo, entry_id)
          VALUES (
                      "${formatDateToDB(now)}",
                      "${imageName}",
                      ${createdEntry.insertId}
          )
        `);
      }
    }

    // introducir varias entradas de entries_votes
    const num_votes = 100;

    for (let index = 0; index < num_votes; index++) {
      const now = new Date();
      await connection.query(`
        INSERT INTO entries_votes (date, vote, entry_id, user_id)
        VALUES (
                    "${formatDateToDB(now)}",
                    "${random(1, 5)}",
                    "${random(1, num_entries)}",
                    ${random(2, users + 1)}
        )
        `);
    }

    console.log("Datos randoms introducidos");
  } catch (error) {
    console.error(error);
  } finally {
    // libero la connexion
    if (connection) connection.release();
    process.exit(0);
  }
}

main();
