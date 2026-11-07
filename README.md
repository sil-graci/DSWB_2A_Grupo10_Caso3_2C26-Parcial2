# Urbana Cult - Gestión de Eventos Culturales

**Proyecto:** SixForge Labs  
**Materia:** Desarrollo de Sistemas Web - Back End (DSWB)  
**Comisión:** 2A | **Grupo:** 10 | **Caso de Estudio:** 3 - Urbana Cult  
**Ciclo Lectivo:** 2C2026

---

## Descripción del Proyecto

**Urbana Cult** es una solución backend desarrollada con **Node.js** y **Express** bajo el patrón arquitectónico **Modelo-Vista-Controlador (MVC)**. Su propósito es centralizar la gestión operativa de espacios culturales, organizando los módulos de **Eventos**, **Entradas**, **Clientes** y **Salas**.

Para esta **Tercera Entrega**, el sistema mantiene la **API REST**, la persistencia de datos en **MongoDB** mediante **Mongoose**, ahora alojada en **MongoDB Atlas**, las validaciones de negocio en los controladores y una interfaz web con vistas generadas mediante **Pug**.

Además, incorpora autenticación con usuarios y roles, autenticación basada en JWT, middlewares personalizados y operaciones asincrónicas mediante **Fetch API** en los módulos de Clientes y Eventos.

---

## Tecnologías Utilizadas

- **Entorno de ejecución:** Node.js.
- **Framework web:** Express.js.
- **Motor de plantillas:** Pug.
- **Base de datos:** MongoDB.
- **ODM:** Mongoose.
- **Autenticación:** jsonwebtoken (JWT).
- **Protección de contraseñas:** bcryptjs.
- **Variables de entorno:** dotenv.
- **Comunicación desde el navegador:** Fetch API.
- **Estilos:** CSS3 nativo.

---

## Estructura del Proyecto

```text
DSWB_2A_Grupo10_Caso3_2C26-Parcial2/
├── public/
│   ├── js/
│   │   ├── cliente-form.js
│   │   ├── clientes.js
│   │   ├── eventos.js
│   │   ├── nuevo_evento.js
│   │   └── salas.js
│   ├── styles.css
│   └── imágenes utilizadas en la aplicación
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   ├── clientes.controllers.js
│   │   ├── entradas.controllers.js
│   │   ├── eventos.controllers.js
│   │   ├── inicio.controllers.js
│   │   └── salas.controllers.js
│   ├── middlewares/
│   │   └── auth.middleware.js
|   ├── models/
│   │   ├── Cliente.js
│   │   ├── Entrada.js
│   │   ├── Evento.js
│   │   ├── Salas.js
│   │   └── Usuario.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── clientes.routes.js
│   │   ├── entradas.routes.js
│   │   ├── eventos.routes.js
│   │   ├── inicio.routes.js
│   │   └── salas.routes.js
│   └── views/
│       ├── clientes.pug
│       ├── entradas.pug
│       ├── eventos.pug
│       ├── inicio.pug
│       ├── layout.pug
│       ├── login.pug
│       ├── nueva_entrada.pug
│       ├── nueva_sala.pug
│       ├── nuevo_cliente.pug
│       ├── nuevo_evento.pug
│       └── salas.pug
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md
```

El archivo `.env` se crea localmente y no debe subirse al repositorio.

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/sil-graci/DSWB_2A_Grupo10_Caso3_2C26-Parcial2.git
cd DSWB_2A_Grupo10_Caso3_2C26-Parcial2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/urbanacult
JWT_SECRET=mi-clave-secreta
```

Esa dirección corresponde a una base **MongoDB local** (Compass). Para trabajar con la base compartida en la nube (**MongoDB Atlas**), reemplazar `MONGO_URI` por la cadena de conexión del cluster:

```env
PORT=3000
#MONGO_URI=mongodb://127.0.0.1:27017/urbanacult
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/urbanacult?retryWrites=true&w=majority
JWT_SECRET=mi-clave-secreta
```

La cadena de conexión con las credenciales reales no se publica en el repositorio: el archivo `.env` está en el `.gitignore` y el equipo la comparte por un canal privado. El nombre de la base (`urbanacult`) va dentro de la URI, antes del `?`.

### 4. Iniciar el servidor

Con MongoDB disponible, ejecutar:

```bash
node app.js
```

Abrir en el navegador:

http://localhost:3000

Si se configura otro puerto, reemplazar `3000` por el valor correspondiente.

## Base de Datos en MongoDB Atlas

En la Tercera Entrega la persistencia pasó de una base MongoDB local a **MongoDB Atlas**, el servicio en la nube de MongoDB, para que todo el equipo trabaje sobre los mismos datos.

- **Cluster:** `UrbanaCult`, plan gratuito M0 (512 MB de almacenamiento), con la base `urbanacult`.
- **Colecciones:** `salas`, `eventos`, `clientes`, `entradas` y `usuarios`.
- **Acceso:** un usuario de base de datos con permiso de lectura y escritura, y una lista de acceso de red que permite conexiones desde cualquier IP (`0.0.0.0/0`), solo por tratarse de un trabajo práctico.
- **Migración de datos:** cada colección se exportó desde MongoDB Compass en formato JSON y se importó en Atlas, respetando el orden salas → eventos → clientes → entradas → usuarios para conservar las referencias.
- **Cambios en el código:** ninguno. `src/config/db.js` ya leía la variable `MONGO_URI`, así que alcanzó con cambiar el `.env`.
- **Usuarios iniciales:** al arrancar, la aplicación crea el usuario administrador y el visitante si no existen.
- **Imágenes:** los archivos se guardan en `public/`. La base solo almacena la ruta.

## Navegación en el Navegador (Vistas Pug)

| Módulo / Sección | Ruta Web | Vista Pug | Descripción |
| :--- | :--- | :--- | :--- |
| **Inicio** | `/` | `inicio.pug` | Portada y cartelera pública de eventos activos próximos |
| **Login** | `/login` | `login.pug` | Formulario de inicio de sesión |
| **Eventos** | `/eventos/vista` | `eventos.pug` | Grilla de eventos con estados y acciones según rol |
| **Entradas** | `/entradas/vista` | `entradas.pug` | Consulta de entradas según el usuario y su rol |
| **Comprar entrada** | `/entradas/nueva/:eventoId` | `nueva_entrada.pug` | Formulario de compra para el evento seleccionado |
| **Nuevo Evento** | `/eventos/nuevo` | `nuevo_evento.pug` | Formulario de alta con selector de salas |
| **Clientes** | `/clientes/vista` | `clientes.pug` | Directorio de clientes registrados |
| **Nuevo Cliente** | `/clientes/nuevo` | `nuevo_cliente.pug` | Formulario de registro de clientes |
| **Salas** | `/salas/vista` | `salas.pug` | Listado de salas y sus capacidades |
| **Nueva Sala** | `/salas/nuevo` | `nueva_sala.pug` | Formulario de alta de salas |

## Autenticación e Interfaz Web

### Inicio de sesión y control de acceso

La aplicación utiliza JSON Web Tokens (JWT) firmados con jsonwebtoken para autenticar al usuario y mantener su identidad mediante una cookie httpOnly (o mediante el encabezado Authorization: Bearer <token>).

**Rutas de autenticación**

GET /login: muestra el formulario de acceso.
POST /login: valida los datos obligatorios (400), verifica las credenciales (401) y genera el token JWT firmado.
POST /logout: elimina la cookie token y redirige al inicio.

El sistema busca el correo en MongoDB y compara la contraseña ingresada con el hash almacenado, utilizando bcryptjs. Si faltan datos responde con 400; si el usuario no existe o la contraseña no coincide, responde con el código 401 y el mensaje “Credenciales inválidas”.

Cuando las credenciales son correctas, se firma un token JWT (con expiración de 30 minutos) que incluye en su payload el correo, el rol y la referencia al cliente (clienteId), guardándolo en la cookie token. El usuario administrador es dirigido a /clientes/vista y el visitante a /eventos/vista.

**Registro de visitantes**

El enlace “Regístrate” abre `/clientes/nuevo`. Al enviar el formulario, el sistema valida los datos, guarda el cliente y crea una cuenta asociada con rol `visitante`. La cuenta queda vinculada al cliente mediante `clienteId`.

Actualmente, las cuentas nuevas reciben la contraseña temporal `1234`, que se guarda protegida con `bcryptjs`. Esta contraseña fija es una limitación de seguridad pendiente de mejora.

**Middlewares personalizados y permisos (src/middlewares/auth.middleware.js)**

- autenticarJWT: extrae el token desde la cookie o el encabezado Authorization, verifica su firma con jwt.verify() y adjunta los datos del usuario en req.usuario y res.locals.usuario.
- verificarRol(...rolesPermitidos): protege las rutas verificando primero la autenticación (req.usuario, devolviendo 401 si no inició sesión) y luego la autorización según el rol (req.usuario.rol, devolviendo 403 si no tiene permisos).

### Portada y cartelera pública (/)

La portada, definida en `inicio.pug`, incorpora el botón **«Conocé más»**, que despliega un carrusel con imágenes, información y enlaces de compra. Las flechas laterales permiten recorrer las tarjetas.

La ruta definida en `inicio.routes.js` llama al controlador `inicio.controllers.js`, que consulta MongoDB y selecciona los eventos activos cuya fecha y hora todavía no pasaron, ordenándolos cronológicamente. También obtiene los nombres de las salas y envía los datos a la plantilla mediante `res.render()`.

Cada tarjeta muestra la imagen, el título y la descripción del evento. El desplegable **«Ver más»** permite consultar la fecha, el horario y el nombre de la sala.

Las imágenes se encuentran en `public` y sus rutas se guardan en el campo `imagen` de cada evento. Si no hay una imagen definida, se utiliza `/portada.png` como alternativa.

En `public/styles.css` se definieron los estilos de la portada y del layout compartido: fondos culturales, tipografías, botones, tarjetas con degradados y adaptación a pantallas pequeñas.

### Menú según rol de usuario

El menú de navegación se adapta según el rol del usuario autenticado.

**Roles disponibles**

- `admin`.
- `visitante`.

Los usuarios visitantes se generan automáticamente al registrar un cliente.

Cada usuario almacena:

- `email`.
- `passwordHash`.
- `rol`.
- `clienteId`, cuando corresponde.

**Administrador**

El usuario con rol `admin` puede visualizar:

- Inicio.
- Eventos.
- Entradas.
- Reservas.
- Clientes.
- Salas.

**Visitante**

El usuario con rol `visitante` puede visualizar:

- Inicio.
- Eventos.
- Entradas.

Las opciones Reservas, Clientes y Salas no se muestran para el visitante. La implementación funcional del módulo Reservas queda pendiente.

## Documentación de la API REST (JSON)

### Módulo de Entradas (/entradas)

El módulo Entradas fue creado para utilizarse con **MongoDB** y **Mongoose**. El módulo permite comprar entradas para eventos activos y consultar las entradas registradas. Cada entrada queda asociada a un evento y a un cliente, y puede tener estado **activa**, **cancelada** o **usada**. Los administradores pueden ver todas las entradas, mientras que cada cliente ve únicamente las propias. La funcionalidad cuenta con vistas y una API REST para crear, consultar, actualizar y eliminar entradas.

Se adaptaron el modelo y el controlador para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

Como regla de negocio, la compra y asignación de entradas solo puede realizarse a clientes activos. En el caso del administrador, el formulario de compra muestra únicamente clientes con estado activo. Además, el backend valida el estado del cliente antes de crear o reasignar una entrada, evitando que la restricción dependa únicamente de la interfaz.

El CRUD completo fue probado correctamente utilizando Thunder Client. En próximas iteraciones se añadirá la funcionalidad de eliminar y modificar entradas dentro del programa (desde la web), ya que desde la interfaz del programa todavía no es posible modificar ni eliminar entradas; esas acciones están disponibles mediante la API REST.

**Endpoints principales**

- GET `/entradas`.
- GET `/entradas/:id`.
- POST `/entradas`.
- PUT `/entradas/:id`.
- DELETE `/entradas/:id`.

**Ejemplo de registro de entrada**

Los identificadores deben corresponder a un evento y un cliente existentes en la base de datos.

```json
{
  "eventoId": "665f1c2e9b1e8a3d4c5b6a79",
  "clienteId": "665f1c2e9b1e8a3d4c5b6a80",
  "estado": "activa"
}
```

### Módulo de Eventos (/eventos)

El módulo Eventos fue migrado de **JSON a MongoDB** utilizando **Mongoose**. Cada evento guarda título, descripción, imagen, fecha, hora, sala (`salaId`, referencia a Salas) y estado (`activo`, `lleno` o `finalizado`).

El controlador trabaja con `async/await` y usa `find`, `findById`, `findOne`, `create`, `save` y `findByIdAndDelete`. La modificación usa `findById` + `save` para controlar conflictos de horario y ejecutar las validaciones del esquema.

**Validaciones y manejo de errores**

- Campos obligatorios, `salaId` con formato de ObjectId válido y estado dentro de los valores permitidos (400).
- La sala indicada debe existir (404).
- No se permite otro evento en la misma sala, fecha y hora (400). El solapamiento parcial de horarios no se controla.
- Manejo de errores mediante `try/catch`, devolviendo 500 ante errores inesperados.
- Al consultar los eventos, los que ya pasaron se actualizan a `finalizado`.
- GET `/eventos/proximos` devuelve los eventos futuros ordenados cronológicamente.

**Interfaz con Fetch API**

`public/js/eventos.js` pide eventos y salas en paralelo mediante `Promise.all`, arma las tarjetas con el nombre de cada sala y permite filtrar próximos y eliminar sin recargar.

`public/js/nuevo_evento.js` envía el formulario con POST para el alta o PUT para la modificación.

El CRUD completo fue probado utilizando la aplicación y **Thunder Client**.

**Permisos**

El alta, la modificación y la baja son exclusivas del rol `admin`. El botón “Comprar entrada” aparece para `admin` y `visitante` en los eventos activos.

**Endpoints principales**

- GET `/eventos`.
- GET `/eventos/:id`.
- GET `/eventos/proximos`.
- POST `/eventos`.
- PUT `/eventos/:id`.
- DELETE `/eventos/:id`.

**Ejemplo de registro de evento**

El valor de `salaId` debe corresponder a una sala existente.

```json
{
  "titulo": "Recital Acústico",
  "descripcion": "Presentación íntima en vivo.",
  "imagen": "/portada.png",
  "fecha": "2026-11-20",
  "hora": "21:00",
  "salaId": "665f1c2e9b1e8a3d4c5b6a78",
  "estado": "activo"
}
```

**Limitaciones conocidas**

La disponibilidad de entradas por evento depende del módulo Entradas. El precio no está incluido en esta entrega.

### Módulo de Clientes (/clientes)

El módulo Clientes utiliza **MongoDB** y **Mongoose** para la persistencia de datos.

Se adaptaron el modelo y el controlador para trabajar con operaciones asincrónicas mediante async/await y se incorporaron validaciones para el DNI, el correo electrónico y el teléfono, verificando formato, obligatoriedad y registros duplicados.

Al registrar un cliente, el sistema crea automáticamente un usuario asociado con rol visitante, contraseña temporal protegida mediante bcryptjs y vinculación mediante clienteId.

La modificación del correo electrónico de un cliente actualiza también el correo del usuario asociado, manteniendo la consistencia entre ambas colecciones.

Se incorporó la **baja lógica de clientes** mediante el campo activo. Los clientes nuevos se registran como activos y, al realizar una baja, el documento permanece almacenado en MongoDB con activo en false, conservando su identificador y las relaciones existentes.

También se implementó la **reactivación de clientes**, permitiendo cambiar nuevamente su estado a activo sin recrear el documento ni modificar sus relaciones.

Como regla de negocio, un cliente que tenga **entradas activas asociadas no puede darse de baja**. En ese caso, el sistema rechaza la operación e informa al administrador mediante un mensaje en la interfaz.

La vista permite consultar solamente clientes activos o visualizar todos los clientes mediante los filtros **Activos** y **Todos**. Los clientes inactivos se identifican visualmente y disponen de la opción **Reactivar**.

La búsqueda permite filtrar dinámicamente por nombre, apellido, DNI o email mientras el usuario escribe.

La interfaz utiliza **Fetch API** para realizar búsquedas, altas, modificaciones, bajas lógicas y reactivaciones sin necesidad de recargar completamente la página.

**Endpoints principales**

- GET /clientes: obtiene clientes activos por defecto y admite filtros de búsqueda y estado.
- GET /clientes/:id: obtiene un cliente por su identificador.
- POST /clientes: registra un cliente y crea su usuario visitante asociado.
- PUT /clientes/:id: modifica los datos del cliente y sincroniza el email del usuario.
- DELETE /clientes/:id: realiza la baja lógica del cliente si no posee entradas activas.
- PATCH /clientes/:id/reactivar: reactiva un cliente dado de baja.


**Ejemplo de registro de cliente**

```json
{
  "nombre": "Lucía",
  "apellido": "Fernández",
  "dni": "12345678",
  "email": "lucia@test.com",
  "telefono": "1165432189",
  "activo": true
}
```

### Módulo de Salas (/salas)

El módulo Salas fue migrado de **JSON a MongoDB** utilizando **Mongoose**.

Se adaptaron el modelo y el controlador para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

El CRUD completo fue probado utilizando la aplicación y Thunder Client.

**Endpoints principales**

- GET `/salas`.
- GET `/salas/:id`.
- POST `/salas`.
- PUT `/salas/:id`.
- DELETE `/salas/:id`.

**Ejemplo de registro de sala**

```json
{
  "nombre": "Sala Magna",
  "capacidad": 120
}
```

## Códigos de Respuesta HTTP Implementados

- **200 OK:** petición resuelta con éxito en consultas, modificaciones y bajas.
- **201 Created:** recurso creado exitosamente.
- **400 Bad Request:** datos incompletos, cadenas vacías, identificadores con formato inválido o conflicto de horario en la misma sala.
- **401 Unauthorized:** credenciales inválidas o solicitud a una ruta protegida sin haber iniciado sesión.
- **403 Forbidden:** el usuario inició sesión, pero su rol no tiene permiso para realizar la operación.
- **404 Not Found:** el recurso consultado, editado o borrado no existe.
- **500 Internal Server Error:** error inesperado del servidor al procesar la solicitud.

## Próximos Pasos

- Extender el uso de Fetch API al Entradas.
- Incorporar nuevas funcionalidades y mejoras en el módulo de Entradas.
- Implementar consultas de entradas vendidas y disponibles por evento.


## Uso de IA

Usamos IA como apoyo para resolver dudas puntuales, revisar alternativas técnicas y mejorar la documentación. Las propuestas fueron revisadas y adaptadas por el equipo antes de incorporarlas.


La consultamos principalmente para temas relacionados con MongoDB, Mongoose, MongoDB Atlas, operaciones sobre la base de datos, `async/await`, Fetch API, validaciones, JWT, roles, middlewares e integración entre Clientes, Usuarios y Entradas.

En particular, la consultamos para incorporar el manejo de sesiones con Express Session, tema presente en el módulo 10 del aula virtual (descargado el 10/10/2026), necesario para implementar el login con roles.

También se utilizó como apoyo para generar imágenes culturales, desarrollar las plantillas Pug y los estilos CSS, conectar la cartelera con MongoDB e interpretar errores y conflictos de Git.
