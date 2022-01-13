const { format } = require("date-fns");
const { ensureDir, unlink } = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const uuid = require("uuid");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

// Configuro sendgrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function formatDateToDB(dateObject) {
  return format(dateObject, "yyyy-MM-dd HH:mm:ss");
}

const { UPLOAD_DIRECTORY } = process.env;

const uploadDir = path.join(__dirname, UPLOAD_DIRECTORY);

async function savePhoto(fotoData) {
  // fotoData tengo las informaciones de la imagen

  // compruebo que exista el directorio donde quiero guardar las fotos (static/upload)
  await ensureDir(uploadDir);

  // leer el buffer (fotoData.data) de la imagen (con sharp)
  const image = sharp(fotoData.data);

  // hago un resize
  image.resize(800);

  // generar un nombre unico para la imagen (UUID)
  const saveImageName = `${uuid.v4()}.jpg`;

  // guardo la imagen en static/upload
  await image.toFile(path.join(uploadDir, saveImageName));

  // devuelvo el nombre de la photo
  return saveImageName;
}

async function deletePhoto(imageName) {
  const pathImage = path.join(uploadDir, imageName);
  await unlink(pathImage);
}

function generateRandomString() {
  return crypto.randomBytes(40).toString("hex");
}

async function sendMail({ to, subject, body }) {
  try {
    // https://www.npmjs.com/package/sendgrid
    const msg = {
      to,
      from: process.env.SENDGRID_FROM, //poner el mismo correo que pusimos en FROM de sendgrid
      subject,
      text: body,
      html: `
    <div>
      <h1>${subject}</h1>
      <p>${body}</p>
    </div>
    `,
    };
    await sgMail.send(msg);
  } catch (error) {
    throw new Error("Error enviando email");
  }
}

async function validate(schema, data) {
  try {
    await schema.validateAsync(data);
  } catch (error) {
    error.httpStatus = 400;
    throw error;
  }
}

module.exports = {
  formatDateToDB,
  savePhoto,
  deletePhoto,
  generateRandomString,
  sendMail,
  validate,
};
