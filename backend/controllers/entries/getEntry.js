const getDB = require("../../db");

const getEntry = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { id } = req.params;

    // hacer la query con "prepared statemen" para evitar SQL injection
    const [result] = await connection.query(
      `
        SELECT entries.id, entries.place, entries.date, entries.description, entries.user_id, users.name AS user_name, users.avatar AS user_avatar, users.email AS user_email, AVG(IFNULL(entries_votes.vote, 0)) AS votes
        FROM entries
        LEFT JOIN entries_votes ON (entries.id = entries_votes.entry_id)
        INNER JOIN users ON (entries.user_id = users.id)
        WHERE entries.id = ?
        GROUP BY entries.id
       `,
      [id]
    );

    let [single] = result;

    const [photos] = await connection.query(
      `
      SELECT id, photo, uploadDate 
      FROM entries_photos
      WHERE entry_id = ?
    `,
      [id]
    );

    res.send({
      status: "ok",
      data: {
        ...single,
        photos,
      },
    });
  } catch (error) {
    // voy al middleware de los errores
    next(error);
  } finally {
    // libero la connexion
    if (connection) connection.release();
  }
};

module.exports = getEntry;
