# Quick start

# Definición API

- Se trata de una web donde los usuarios publican entrada sobre viajes
- Cada entrada tiene un título, descripción, lugar y hasta 3 fotos asociadas
- Cada entrada puede ser votada con una puntuación entre 1 y 5

# Endpoints users

- POST - /users - Crear un usuario pendiente de activar ✅
- GET - /users/validate/:registrationCode - Validará un usuario recien registrado ✅
- POST - /users/login - Hará el login de un usuario y devolverá el TOKEN ✅
- GET - /users/:id - Devolver información del usuario | Token obligatorio y si el usuario coincide (o administrator) dar más información ✅
- DELETE - /users/:id - Borrar un usuario | Solo lo puede hacer el admin o si mismo ✅
- PUT - /users/:id - Editar un usuario (name, email, avatar) | Solo el propio usuario ✅
- PUT - /users/:id/password - Editar la contraseña de un usuario | Solo el propio usuario ✅

# Endpoints entries

- GET - /entries - JSON con lista todas las entradas con filtro ✅ | orden y fotos | SIN TOKEN ✅
- GET - /entries/:id - JSON que muestra información de una entrada✅ | SIN TOKEN ✅
- POST - /entries - crea una entrada ✅ | TOKEN OBLIGATORIO ✅
- PUT - /entries/:id - edita el lugar o descripción de una entrada ✅ | TOKEN OBLIGATORIO y puede modificarlo solo el mismo usuario o admin (solo editable durante 2 horas) ✅
- DELETE - /entries/:id - borra una entrada ✅ | TOKEN OBLIOGATORIO y solo el mismo usuario o admin ✅
- POST - /entries/:id/photos - añade una imagen a una entrada ✅ | TOKEN OBLIOGATORIO y solo el mismo usuario o admin ✅
- DELETE - /entries/:id/photos/:photoID - borra una imagen de una entrada ✅ | TOKEN OBLIOGATORIO y solo el mismo usuario o admin ✅
- POST - /entries/:id/votes - vota una entrada ✅ | TOKEN OBLIGATORIO no puede votar el usuario que la creó y un usuario puede votar solo una vez ✅ | MIDDLEWARE de comprobación de que la entrada exista ✅
