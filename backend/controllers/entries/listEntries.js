const getDB = require("../../db");

const listEntries = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    // saco el query string
    const { search, order, direction } = req.query;

    const validOrders = ["place", "date", "votes"];
    const orderBy = validOrders.includes(order) ? order : "votes";

    const validDirections = ["ASC", "DESC"];
    const orderDirection = validDirections.includes(direction)
      ? direction
      : "ASC";

    let results;

    if (search) {
      [results] = await connection.query(
        `
                SELECT entries.id, entries.place, entries.date, entries.user_id, users.name AS user_name, users.avatar AS user_avatar, users.email AS user_email, AVG(IFNULL(entries_votes.vote, 0)) AS votes
                FROM entries
                LEFT JOIN entries_votes ON (entries.id = entries_votes.entry_id)
                INNER JOIN users ON (entries.user_id = users.id)
                WHERE entries.place LIKE ? OR entries.description LIKE ? 
                GROUP BY entries.id
                ORDER BY ${orderBy} ${orderDirection}
              `,
        [`%${search}%`, `%${search}%`]
      );
    } else {
      [results] = await connection.query(`
                SELECT entries.id, entries.place, entries.date, entries.user_id, users.name AS user_name, users.avatar AS user_avatar, users.email AS user_email, AVG(IFNULL(entries_votes.vote, 0)) AS votes
                FROM entries
                LEFT JOIN entries_votes ON (entries.id = entries_votes.entry_id)
                INNER JOIN users ON (entries.user_id = users.id)
                GROUP BY entries.id
                ORDER BY ${orderBy} ${orderDirection}
              `);
    }

    let resultsWithPhotos = [];

    if (results.length > 0) {
      // Saco las ids de los resultados
      const ids = results.map((result) => result.id);

      // Selecciono todas las fotos que tengan como entrada relacionada una con una id de los resultados anteriores
      const [photos] = await connection.query(
        `SELECT * FROM entries_photos WHERE entry_id IN (${ids.join(",")})`
      );

      // Junto el array de fotos resultante en la query anterior con los resultados
      resultsWithPhotos = results.map((result) => {
        // Fotos correspondientes al resultado (si hay, si no un array vacío)
        const resultPhotos = photos.filter(
          (photo) => photo.entry_id === result.id
        );

        // Devuelvo el resultado + el array de fotos
        return {
          ...result,
          photos: resultPhotos,
        };
      });
    }

    // Devuelvo un json con las entradas
    res.send({
      status: "ok",
      data: resultsWithPhotos,
    });
  } catch (error) {
    // voy al middleware de los errores
    next(error);
  } finally {
    // libero la connexion
    if (connection) connection.release();
    // ERROR!!! no puedo salir del proceso como en initDB!!!
    //process.exit(0);
  }
};

module.exports = listEntries;
