const getDB = require("../../db");
const { savePhoto, formatDateToDB } = require("../../helpers");

const addEntryPhoto = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { id } = req.params;

    // controlar que la entry no tenga ya 3 fotos
    const [currentPhoto] = await connection.query(
      `
        SELECT id, photo FROM entries_photos WHERE entry_id=?
    `,
      [id]
    );

    //console.log("Current foto:", currentPhoto);
    if (currentPhoto.length >= 3) {
      const error = new Error("La entry ya tiene un maximo de 3 fotos");
      error.httpStatus = 403;
      throw error;
    }

    // añade la foto en el DB
    let savedPhoto;
    if (req.files && Object.keys(req.files).length > 0) {
      // guardo la foto en el disco (static/upload) y saco el nombre
      // guarda la foto en static upload
      //console.log(Object.values(req.files)[0]);
      savedPhoto = await savePhoto(Object.values(req.files)[0]);
    }
    const now = new Date();
    await connection.query(
      `
        INSERT INTO entries_photos (uploadDate, photo, entry_id)
        VALUES (?,?,?)
    `,
      [formatDateToDB(now), savedPhoto, id]
    );

    // devuelvo json con nombre de la foto añadida (UUID.jpg)
    res.send({
      status: "ok",
      data: {
        photo: savedPhoto,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = addEntryPhoto;
