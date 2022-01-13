const getDB = require("../../db");

const getUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    // saco el usuario desde la url
    const { id } = req.params;

    // saco la info del usuario
    const [user] = await connection.query(
      `
     SELECT id, date, email, name, avatar, role
     FROM users
     WHERE id=?
    `,
      [id]
    );

    // si el usuario logueado es admin o el usuario legueado cincide con
    // el usuario de lo que pido info, devuelvo toda la información del usuario
    const userInfo = {
      name: user[0].name,
      avatar: user[0].avatar,
    };

    if (user[0].id === req.userAuth.id || req.userAuth.role === "admin") {
      //date, email, role
      userInfo.id = user[0].id;
      userInfo.date = user[0].date;
      userInfo.email = user[0].email;
      userInfo.role = user[0].role;
    }

    res.send({
      status: "ok",
      data: userInfo,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = getUser;
