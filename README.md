# Urbana Cult - Gestión de Eventos Culturales

**Proyecto:** SixForge Labs  
**Materia:** Desarrollo de Sistemas Web - Back End (DSWB)  
**Comisión:** 2A | **Grupo:** 10 | **Caso de Estudio:** 3 - Urbana Cult  
**Ciclo Lectivo:** 2C2026

---

## Descripción del Proyecto

**Urbana Cult** es una solución backend desarrollada con **Node.js** y **Express** bajo el patrón arquitectónico **Modelo-Vista-Controlador (MVC)**. Su propósito es centralizar la gestión operativa de espacios culturales, organizando los módulos de **Eventos**, **Entradas**, **Clientes** y **Salas**.

Para esta **Tercera Entrega**, el sistema mantiene la **API REST**, la persistencia de datos en **MongoDB** mediante **Mongoose**, ahora alojada en **MongoDB Atlas**, las validaciones de negocio en los controladores y una interfaz web con vistas generadas mediante **Pug**.

Además, incorpora autenticación con usuarios y roles, autenticación basada en JWT, middlewares personalizados y operaciones asincrónicas mediante **Fetch API** en los módulos de Clientes, Eventos, Entradas y Salas.
El módulo de Eventos también se actualiza en tiempo real mediante **WebSockets** con **Socket.IO**.

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
- **Tiempo real:** Socket.IO (WebSockets).
- **Servicio de email transaccional:** Resend.
- **Estilos:** CSS3 nativo.
- **Cotización del dólar oficial:** DolarAPI.

---

## Estructura del Proyecto

```text
DSWB_2A_Grupo10_Caso3_2C26-Parcial2/
├── public/
│   ├── js/
│   │   ├── cliente-form.js
│   │   ├── clientes.js
│   │   ├── entradas.js
│   │   ├── eventos.js
│   │   ├── nueva_entrada.js
│   │   ├── nuevo_evento.js
│   │   └── salas.js
│   ├── styles.css
│   └── imágenes utilizadas en la aplicación
├── scripts/
│   └── migrarFechaHora.js
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
│   │   ├── reservas.routes.js
│   │   └── salas.routes.js
│   ├── services/
│   │   ├── email.service.js
│   │   └── cotizacion.service.js
│   ├── sockets/
│   │   └── index.js
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
│       ├── reservas.pug
│       └── salas.pug
├── .env
├── .env.example
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
RESEND_API_KEY=<api-key-de-resend>
ADMIN_PASSWORD=admin123
VISITANTE_PASSWORD=visitante123
```

Esa dirección corresponde a una base **MongoDB local** (Compass). Para trabajar con la base compartida en la nube (**MongoDB Atlas**), reemplazar `MONGO_URI` por la cadena de conexión del cluster:

```env
PORT=3000
#MONGO_URI=mongodb://127.0.0.1:27017/urbanacult
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/urbanacult?retryWrites=true&w=majority
JWT_SECRET=mi-clave-secreta
RESEND_API_KEY=<api-key-de-resend>
ADMIN_PASSWORD=admin123
VISITANTE_PASSWORD=visitante123
```

Las credenciales reales de MongoDB, JWT y Resend no se publican en el repositorio. El archivo `.env` está incluido en `.gitignore` y los valores necesarios se comparten con el equipo mediante un canal privado.
El nombre de la base (`urbanacult`) va dentro de la URI, antes del `?`.

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
- **Colecciones:** `salas`, `eventos`, `clientes`, `entradas`, `usuarios` y `cotizaciones`.
- **Acceso:** un usuario de base de datos con permiso de lectura y escritura, y una lista de acceso de red que permite conexiones desde cualquier IP (`0.0.0.0/0`), solo por tratarse de un trabajo práctico.
- **Migración de datos:** cada colección se exportó desde MongoDB Compass en formato JSON y se importó en Atlas, respetando el orden salas → eventos → clientes → entradas → usuarios para conservar las referencias.
- **Cambios en el código:** ninguno. `src/config/db.js` ya leía la variable `MONGO_URI`, así que alcanzó con cambiar el `.env`.
- **Usuarios iniciales:** al arrancar, la aplicación crea el usuario administrador y el visitante si no existen.
- **Imágenes:** los archivos se guardan en `public/`. La base solo almacena la ruta.

## Navegación en el Navegador (Vistas Pug)

| Módulo / Sección | Ruta Web | Vista Pug | Descripción |
| :--- | :--- | :--- | :--- |
| **Inicio** | `/` |  `inicio.pug` | Portada y cartelera pública de eventos activos próximos, con precio y selector Pesos/Dólares dentro de los detalles de cada evento, disponible sin iniciar sesión. |
| **Login** | `/login` | `login.pug` | Formulario de inicio de sesión |
| **Eventos** | `/eventos/vista` | `eventos.pug` | Grilla de eventos con estados y acciones según rol, actualizada en tiempo real |
| **Entradas** | `/entradas/vista` | `entradas.pug` | Consulta de entradas según el usuario y su rol |
| **Comprar entrada** | `/entradas/nueva/:eventoId` | `nueva_entrada.pug` | Formulario de compra para el evento seleccionado |
| **Nuevo Evento** | `/eventos/nuevo` | `nuevo_evento.pug` | Formulario de alta con selector de salas |
| **Clientes** | `/clientes/vista` | `clientes.pug` | Directorio de clientes registrados |
| **Nuevo Cliente** | `/clientes/nuevo` | `nuevo_cliente.pug` | Formulario de registro de clientes |
| **Salas** | `/salas/vista` | `salas.pug` | Listado de salas y sus capacidades |
| **Nueva Sala** | `/salas/nuevo` | `nueva_sala.pug` | Formulario de alta de salas |
| **Reservas** | `/reservas/vista` | `reservas.pug `| Módulo en desarrollo, disponible solo para administrador|

## Autenticación e Interfaz Web

### Inicio de sesión y control de acceso

La aplicación utiliza JSON Web Tokens (JWT) firmados con jsonwebtoken para autenticar al usuario y mantener su identidad mediante una cookie httpOnly (o mediante el encabezado Authorization: Bearer <token>).

**Usuarios de prueba iniciales**

| Rol | Email | Contraseña por defecto |
| :--- | :--- | :--- |
| **Administrador** | `admin@urbanacult.com` | `admin123` |
| **Visitante** | `visitante@urbanacult.com` | `visitante123` |

**Rutas de autenticación**

GET /login: muestra el formulario de acceso.
POST /login: valida los datos obligatorios (400), verifica las credenciales (401) y genera el token JWT firmado.
POST /logout: elimina la cookie token y redirige al inicio.

El sistema busca el correo en MongoDB y compara la contraseña ingresada con el hash almacenado, utilizando bcryptjs. Si faltan datos responde con 400; si el usuario no existe o la contraseña no coincide, responde con el código 401 y el mensaje “Credenciales inválidas”. Si el cliente tiene baja lógica (activo: false) devuelve 403 ("El cliente se encuentra inactivo").

Cuando las credenciales son correctas, se firma un token JWT (con expiración de 30 minutos) que incluye en su payload el correo, el rol y la referencia al cliente (clienteId), guardándolo en la cookie token. El usuario administrador es dirigido a /clientes/vista y el visitante a /eventos/vista.


**Registro de visitantes**

El enlace “Regístrate” abre `/clientes/nuevo`. Al enviar el formulario, el sistema valida los datos, guarda el cliente y crea una cuenta asociada con rol visitante. La cuenta queda vinculada al cliente mediante `clienteId`.

Las cuentas nuevas reciben la contraseña temporal `1234`, almacenada de forma protegida mediante bcryptjs. Además, se integró **Resend** para enviar un correo de bienvenida con el email registrado, la contraseña temporal y un recordatorio para modificarla.

El envío del correo se realiza luego de crear correctamente el Cliente y el Usuario. Si el servicio de email presenta un error, los registros creados en MongoDB se conservan.

La contraseña temporal fija continúa siendo una limitación de seguridad pendiente de mejora.

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

Las opciones Reservas, Clientes y Salas no se muestran para el visitante. Las opciones Reservas, Clientes y Salas no se muestran para el visitante. Reservas cuenta actualmente con una vista informativa protegida para el rol administrador, mientras que la implementación funcional del módulo continúa en desarrollo.

## Documentación de la API REST (JSON)

### Módulo de Entradas (/entradas)

El módulo Entradas fue creado para utilizarse con **MongoDB** y **Mongoose**. El módulo permite comprar entradas para eventos activos y consultar las entradas registradas. Cada entrada queda asociada a un evento y a un cliente, y puede tener estado **activa**, **cancelada** o **usada**. Los administradores pueden ver todas las entradas, mientras que cada cliente ve únicamente las propias. La funcionalidad cuenta con vistas y una API REST para crear, consultar, actualizar y eliminar entradas.

Se adaptaron el modelo y el controlador para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

Como regla de negocio, la compra y asignación de entradas solo puede realizarse a clientes activos. En el caso del administrador, el formulario de compra muestra únicamente clientes con estado activo. Además, el backend valida el estado del cliente antes de crear o reasignar una entrada, evitando que la restricción dependa únicamente de la interfaz.

El CRUD completo fue probado correctamente utilizando Thunder Client. 

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

El módulo Eventos fue migrado de **JSON a MongoDB** utilizando **Mongoose**. Cada evento guarda título, descripción, imagen, fecha, hora, `fechaHora`, precio, sala (`salaId`, referencia a Salas) y estado (`activo`, `lleno` o `finalizado`).

El controlador trabaja con `async/await` y usa `find`, `findById`, `findOne`, `create`, `save`, `updateMany` y `findByIdAndDelete`. La modificación usa `findById` + `save` para controlar conflictos de horario y ejecutar las validaciones del esquema.

**Mejoras de la Tercera Entrega**

- **Campo `fechaHora` (Date):** `fecha` y `hora` se mantienen como texto, porque las usan el formulario, la portada y el módulo Entradas. Un hook `pre("validate")` del modelo calcula `fechaHora` una sola vez al guardar, con zona horaria fija de Argentina (`-03:00`). MongoDB lo guarda en UTC, por lo que en Compass se ve con 3 horas más.
- **Validación de fecha y hora:** se controla el formato (`AAAA-MM-DD` y `HH:MM`) y que la fecha exista en el calendario (se rechaza, por ejemplo, el 31/02).
- **Consultas en la base de datos:** los eventos vencidos pasan a `finalizado` con una sola operación `updateMany`, y `/eventos/proximos` filtra y ordena con `find`, `$gt` y `sort` usando un índice sobre `fechaHora`. Antes se filtraba y ordenaba en JavaScript.
- **Precio:** campo numérico `precio`, no negativo y con valor por defecto `0`. El precio es del evento y no se modificó el módulo Entradas.
- **Precio en la interfaz:** se carga en el formulario y las tarjetas muestran el importe en pesos y su equivalente en dólares. Si el precio es 0, muestran «Gratis».
- **Errores de validación:** responden 400 con el mensaje correspondiente, en lugar de 500.
- **Seguridad:** `public/js/eventos.js` escapa los datos con `escaparHTML` antes de insertarlos con `innerHTML`, para evitar la inyección de HTML (XSS almacenado).
- **Tiempo real:** los cambios en los eventos se notifican a los usuarios conectados mediante WebSockets (ver la sección *Tiempo real con WebSockets*).
- **Conversión con DolarAPI:** `cotizacion.service.js` consulta la cotización de venta del dólar oficial y calcula `precioUSD = precio / cotizacion`. La consulta tiene un tiempo máximo de espera de dos segundos. La conversión es informativa y no modifica el precio almacenado en pesos.
- **Respaldo de cotización:** la última cotización válida y su fecha de consulta se guardan en la colección auxiliar `cotizaciones` de MongoDB. Si la API falla, se utiliza ese respaldo, incluso después de reiniciar el servidor. El equivalente en dólares se calcula al consultar y no se guarda en el evento.

**Migración de eventos existentes**

Los eventos cargados antes de este cambio no tienen `fechaHora`. Con MongoDB disponible, se ejecuta una sola vez:

```bash
node --env-file=.env scripts/migrarFechaHora.js
```

El script calcula `fechaHora` para esos eventos e informa cuántos actualizó. Es seguro repetirlo, y no hace falta si la base se carga desde cero.

**Validaciones y manejo de errores**

- Campos obligatorios, `salaId` con formato de ObjectId válido y estado dentro de los valores permitidos (400).
- Fecha y hora con formato válido, fecha existente en el calendario y precio no negativo (400).
- La sala indicada debe existir (404).
- No se permite otro evento en la misma sala, fecha y hora (400). El solapamiento parcial de horarios no se controla.
- Manejo de errores mediante `try/catch`, devolviendo 500 ante errores inesperados.
- Al consultar los eventos, los que ya pasaron se actualizan a `finalizado`.
- GET `/eventos/proximos` devuelve los eventos futuros ordenados cronológicamente.

**Interfaz con Fetch API**

`public/js/eventos.js` pide eventos y salas en paralelo mediante `Promise.all`, arma las tarjetas con el nombre de cada sala y permite filtrar próximos y eliminar sin recargar.

`public/js/nuevo_evento.js` envía el formulario con POST para el alta o PUT para la modificación.

El CRUD completo, el precio y las validaciones de fecha fueron probados utilizando la aplicación, **Thunder Client** y **MongoDB Compass**.

El escape de HTML se verificó creando un evento con el título `<b>prueba</b>`, que se muestra como texto y no como formato.

También se verificó que el contador de conexiones activas sube al conectarse un segundo navegador y baja al cerrarlo.

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

El valor de `salaId` debe corresponder a una sala existente. `fechaHora` no se envía: la calcula el modelo. El campo `precio` es opcional (0 por defecto).

```json
{
  "titulo": "Recital Acústico",
  "descripcion": "Presentación íntima en vivo.",
  "imagen": "/portada.png",
  "fecha": "2026-11-20",
  "hora": "21:00",
  "precio": 8500,
  "salaId": "665f1c2e9b1e8a3d4c5b6a78",
  "estado": "activo"
}
```

**Tiempo real con WebSockets (Socket.IO)**

Con HTTP el navegador solo recibe datos cuando los pide: si el administrador cambia un evento, quien ya tiene abierta la lista sigue viendo información vieja hasta que recarga. Para evitarlo, el módulo Eventos usa **WebSockets** mediante **Socket.IO**: el servidor mantiene una conexión abierta con cada navegador y avisa en el momento en que algo cambia.

El servidor se crea con `http.createServer(app)` y Socket.IO se inicializa en `src/sockets/index.js`. No requiere variables de entorno nuevas: usa el mismo puerto y el mismo `JWT_SECRET` que la API. El socket solo **notifica**: las altas, modificaciones y bajas siguen viajando por la API REST, con sus validaciones y permisos por rol.

*Autenticación:* al conectarse, el servidor lee la cookie `token` del handshake y verifica el JWT con el mismo secreto que usa la API REST. Si falta o es inválido, la conexión se rechaza con el mensaje `No estás logueado` o `Token inválido o vencido`. Pueden conectarse los roles `admin` y `visitante`.

*Mensajes emitidos por el servidor:* los de eventos se envían a la sala `eventos`, siempre después de confirmar el cambio en MongoDB. El controlador solo llama a la función `emitirEvento`, sin conocer los detalles de Socket.IO.

| Mensaje | Cuándo se emite | Datos enviados |
| :--- | :--- | :--- |
| `evento:creado` | POST `/eventos` exitoso | `{ id, titulo }` |
| `evento:actualizado` | PUT `/eventos/:id` exitoso | `{ id, titulo, estado }` |
| `evento:eliminado` | DELETE `/eventos/:id` exitoso | `{ id, titulo }` |
| `eventos:estados-actualizados` | Al consultar la API, eventos activos vencidos pasan a `finalizado` | `{ cantidad }` |
| `usuarios:conectados` | Alguien se conecta o se desconecta (broadcast con `io.emit`) | `{ cantidad }` |

*Cliente:* `public/js/eventos.js` escucha estos mensajes. Ante un cambio de eventos muestra un aviso durante unos segundos (por ejemplo, “Evento actualizado: Recital Acústico”) y vuelve a llamar a `cargarEventos()`, que conserva el filtro activo (Todos / Próximos). Con `usuarios:conectados` actualiza el contador de conexiones activas que se ve junto a los filtros. Los avisos se arman con `textContent`, por lo que los datos nunca se interpretan como HTML.

*Cómo probarlo:* abrir `/eventos/vista` en dos navegadores con usuarios distintos (uno como `admin` y otro como `visitante`), crear, modificar o eliminar un evento como `admin` y verificar que la otra ventana se actualiza sola. El aviso aparece en la ventana que **no** hizo el cambio. La conexión puede verse en las herramientas de desarrollo del navegador, en la pestaña de red, filtrando por WS.

*Limitaciones del tiempo real:* el token vence a los 30 minutos, pero una conexión ya abierta no se corta; se revalida al reconectar. Los avisos solo se muestran en `/eventos/vista`, no en la portada pública. El cliente recarga la lista completa en lugar de aplicar cambios individuales. El contador cuenta conexiones, no personas (dos pestañas cuentan dos). Los eventos vencidos pasan a `finalizado` cuando alguien consulta la API, y recién ahí se notifica por socket; no hay un temporizador en el servidor.

**Limitaciones conocidas**

La disponibilidad de entradas por evento depende del módulo Entradas, por lo que el estado `lleno` se marca manualmente. Las imágenes se guardan como archivos en `public/` y la base solo almacena su ruta.

### Módulo de Clientes (/clientes)

El módulo Clientes utiliza **MongoDB** y **Mongoose** para la persistencia de datos.

Se adaptaron el modelo y el controlador para trabajar con operaciones asincrónicas mediante async/await y se incorporaron validaciones para el DNI, el correo electrónico y el teléfono, verificando formato, obligatoriedad y registros duplicados.

Al registrar un cliente, el sistema crea automáticamente un usuario asociado con rol visitante, contraseña temporal protegida mediante bcryptjs y vinculación mediante clienteId.

También se incorporó el envío de un **correo de bienvenida mediante Resend**. Una vez creados correctamente el Cliente y el Usuario, el sistema intenta enviar al correo registrado las credenciales iniciales y un recordatorio para modificar la contraseña temporal.

La lógica de envío se encuentra separada en `src/services/email.service.js`. Si el envío del correo falla, el alta del Cliente y del Usuario no se revierte.

La modificación del correo electrónico de un cliente actualiza también el correo del usuario asociado, manteniendo la consistencia entre ambas colecciones.

Se incorporó la **baja lógica de clientes** mediante el campo activo. Los clientes nuevos se registran como activos y, al realizar una baja, el documento permanece almacenado en MongoDB con activo en false, conservando su identificador y las relaciones existentes.

También se implementó la **reactivación de clientes**, permitiendo cambiar nuevamente su estado a activo sin recrear el documento ni modificar sus relaciones.

Como regla de negocio, un cliente que tenga **entradas activas asociadas no puede darse de baja**. En ese caso, el sistema rechaza la operación e informa al administrador mediante un mensaje en la interfaz.

La vista permite consultar solamente clientes activos o visualizar todos los clientes mediante los filtros **Activos** y **Todos**. Los clientes inactivos se identifican visualmente y disponen de la opción **Reactivar**.

La búsqueda permite filtrar dinámicamente por nombre, apellido, DNI o email mientras el usuario escribe.

La interfaz utiliza **Fetch API** para realizar búsquedas, altas, modificaciones, bajas lógicas y reactivaciones sin necesidad de recargar completamente la página.

**Servicio de email**

La integración con Resend fue probada correctamente en su entorno de prueba. Actualmente se utiliza el remitente de prueba proporcionado por Resend, que limita los envíos al correo asociado a la cuenta. Para habilitar el envío de emails a cualquier cliente será necesario configurar y verificar un dominio propio.

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

- Incorporar nuevas funcionalidades y mejoras en el módulo de Entradas.
- Implementar consultas de entradas vendidas y disponibles por evento.
- Extender las notificaciones en tiempo real al módulo Entradas (entradas vendidas y disponibles por evento).
- Actualizar automáticamente el estado de los eventos vencidos con un temporizador en el servidor.
- Implementar el cambio de contraseña temporal para los usuarios visitantes.
- Configurar un dominio verificado para habilitar el envío de emails de bienvenida a cualquier cliente mediante Resend.


## Uso de IA

Usamos IA como apoyo para resolver dudas puntuales, revisar alternativas técnicas y mejorar la documentación. Las propuestas fueron revisadas y adaptadas por el equipo antes de incorporarlas.


La consultamos principalmente para temas relacionados con MongoDB, Mongoose, MongoDB Atlas, operaciones sobre la base de datos, `async/await`, Fetch API, validaciones, JWT, roles, middlewares e integración entre Clientes, Usuarios y Entradas.

Se utilizó como apoyo para generar imágenes culturales, desarrollar las plantillas Pug y los estilos CSS, conectar la cartelera con MongoDB e interpretar errores y conflictos de Git. También para analizar la migración del esquema de autenticación hacia JWT y la integración del servicio externo de email transaccional mediante Resend.

Para los WebSockets nos basamos en el Bloque 11.0 del aula virtual (Comunicación en Tiempo Real con WebSockets) y consultamos a la IA para adaptarlo a módulos ESM (`import`), autenticar la conexión con el JWT de la cookie y notificar los cambios del módulo Eventos.

En el módulo Eventos la utilizamos para evaluar cómo guardar la fecha y la hora (campo `fechaHora` calculado con un hook de Mongoose), mejorar las consultas con `updateMany` y `find`/`sort`, incorporar el precio y los errores de validación como 400, y planificar la migración de MongoDB local a MongoDB Atlas. También la usamos para generar el script de migración y para que nos explicara cada concepto. Todas las propuestas se revisaron, se probaron en la aplicación, con Thunder Client y con Compass, y se ajustaron antes de incorporarlas. Durante las pruebas se detectó un error en la primera versión del hook (aceptaba fechas inexistentes como el 31/02) y se corrigió. Se utilizó IA como apoyo para identificar DolarAPI como fuente de cotización, orientar la conexión con el servicio y mostrar el equivalente en dólares de los precios en pesos.
