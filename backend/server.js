require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const {
  listEntries,
  newEntry,
  getEntry,
  modEntry,
  deleteEntry,
  addEntryPhoto,
  deleteEntryPhoto,
  voteEntry,
} = require("./controllers/entries");

const {
  loginUser,
  newUser,
  validateUser,
  getUser,
  deleteUser,
  editUserPassword,
  editUser,
  recoverUserPassword,
  resetUserPassword,
} = require("./controllers/users");

// require de los MIDDLEWARES
const entryExists = require("./middlewares/entryExists");
const isUser = require("./middlewares/isUser");
const canEdit = require("./middlewares/canEdit");
const userExists = require("./middlewares/userExists");

const { PORT, HOST, UPLOAD_DIRECTORY } = process.env;

// creo app express
const app = express();

app.use(cors());

// uso middleware morgan
app.use(morgan("dev"));

// middleware que parsea el body json
app.use(express.json());

// middleware recursos statico
app.use(express.static(path.join(__dirname, UPLOAD_DIRECTORY)));

// body parser para la subida de imagenes (multipart form data)
// multer o express-fileupload
app.use(fileUpload());

// ruta  GET /
app.get("/", (req, res, next) => {
  res.send({
    status: "ok",
    message: "Home page",
  });
});

/*
 * ENDPOINT ENTRIES
 */

// GET - /entries - JSON con lista todas las entradas
app.get("/entries", listEntries);

// GET - /entries/:id - JSON que muestra información de una entrada
app.get("/entries/:id", entryExists, getEntry);

// POST - /entries - crea una entrada
app.post("/entries", isUser, newEntry);

// PUT - /entries/:id - edita el lugar o descripción de una entrada
app.put("/entries/:id", isUser, entryExists, canEdit, modEntry);

// DELETE - /entries/:id - borra una entrada
app.delete("/entries/:id", isUser, entryExists, canEdit, deleteEntry);

// POST - /entries/:id/photos - añade una imagen a una entrada
app.post("/entries/:id/photos", isUser, entryExists, canEdit, addEntryPhoto);

// DELETE - /entries/:id/photos/:photoID - borra una imagen de una entrada
app.delete(
  "/entries/:id/photos/:photoID",
  isUser,
  entryExists,
  canEdit,
  deleteEntryPhoto
);

// POST - /entries/:id/votes - vota una entrada
app.post("/entries/:id/votes", isUser, entryExists, voteEntry);

/*
 * ENDPOINT USERS
 */

// POST - /users - Crear un usuario pendiente de activar
app.post("/users", newUser);

// GET - /users/validate/:registrationCode - Validará un usuario recien registrado
app.get("/users/validate/:registrationCode", validateUser);

// POST - /users/login - Hará el login de un usuario y devolverá el TOKEN
app.post("/users/login", loginUser);

// GET - /users/:id - Devolver información del usuario
app.get("/users/:id", isUser, userExists, getUser);

// DELETE - /users/:id - Borrar un usuario | Solo lo puede hacer el admin o si mismo
app.delete("/users/:id", isUser, userExists, deleteUser);

// PUT - /users/:id - Editar un usuario (name, email, avatar) | Solo el propio usuario
app.put("/users/:id", isUser, userExists, editUser);

// PUT - /users/:id/password - Editar la contraseña de un usuario | Solo el propio usuario
app.put("/users/:id/password", isUser, userExists, editUserPassword);

// enviar al email del usuario un código para la recuperación
app.post("/users/recoverpassword", recoverUserPassword);

// usar ese código para cambiar la contraseña sin acceder previamente
app.post("/users/resetpassword", resetUserPassword);

// middleware de error
app.use((error, req, res, next) => {
  res.status(error.httpStatus || 500).send({
    status: "error",
    message: error.message,
  });
});

// middleware 404
app.use((req, res, next) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Servidor funcionando en http://${HOST}:${PORT}`);
});
