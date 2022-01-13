const getDB = require("../../db");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { email, password } = req.body;

    // controlo si email y password están vacios
    if (!email || !password) {
      const error = new Error("Faltan campos");
      error.httpStatus = 400;
      throw error;
    }

    // busco en la base de datos el usuario con email y password que llegaron en
    // el body de la petición
    const [user] = await connection.query(
      `
      SELECT id, role, active
      FROM users
      WHERE email=? AND password=SHA2(?, 512)
    `,
      [email, password]
    );

    if (user.length === 0) {
      const error = new Error("Email y password son incorrectos");
      error.httpStatus = 401;
      throw error;
    }

    //console.log(user[0].active);

    // compruebo si el usuario está activo
    if (!user[0].active) {
      const error = new Error("El usuario no etsá activo. Comprueba tu email.");
      error.httpStatus = 401;
      throw error;
    }

    // si todo está bien devolvemos un json con los datos de login
    const info = {
      id: user[0].id,
      role: user[0].role,
    };

    const token = jwt.sign(info, process.env.SECRET, {
      expiresIn: "30d",
    });

    res.send({
      status: "ok",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = loginUser;
