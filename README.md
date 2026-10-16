# Urbana Cult - Gestión de Eventos Culturales

**Proyecto:** SixForge Labs  
**Materia:** Desarrollo de Sistemas Web - Back End (DSWB)  
**Comisión:** 2A | **Grupo:** 10 | **Caso de Estudio:** 3 - Urbana Cult  
**Ciclo Lectivo:** 2C2026

---

## Descripción del Proyecto

**Urbana Cult** es una solución backend desarrollada con **Node.js** y **Express** bajo el patrón arquitectónico **Modelo-Vista-Controlador (MVC)**. Su propósito es centralizar la gestión operativa de espacios culturales, organizando los módulos de **Eventos**, **Entradas**, **Clientes** y **Salas**.

Para esta **Segunda Entrega**, el sistema incorpora una **API REST**, persistencia de datos en **MongoDB** mediante **Mongoose**, validaciones de negocio en los controladores y una interfaz web con vistas generadas mediante **Pug**.

Además, incorpora autenticación con usuarios y roles, manejo de sesiones y operaciones asincrónicas mediante **Fetch API** en los módulos de Clientes y Eventos.

---

## Tecnologías Utilizadas

- **Entorno de ejecución:** Node.js.
- **Framework web:** Express.js.
- **Motor de plantillas:** Pug.
- **Base de datos:** MongoDB.
- **ODM:** Mongoose.
- **Sesiones:** express-session.
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
│   │   └── nuevo_evento.js
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
│   ├── models/
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
```

La dirección de MongoDB debe corresponder a la base utilizada en el entorno de ejecución.

### 4. Iniciar el servidor

Con MongoDB disponible, ejecutar:

```bash
node app.js
```

Abrir en el navegador:

http://localhost:3000

Si se configura otro puerto, reemplazar `3000` por el valor correspondiente.

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

La aplicación utiliza sesiones del servidor para mantener identificado al usuario después de iniciar sesión. En esta entrega no se utiliza JWT.

**Rutas de autenticación**

- GET `/login`: muestra el formulario de acceso.
- POST `/login`: verifica las credenciales y crea la sesión.
- POST `/logout`: destruye la sesión y elimina la cookie asociada.

El sistema busca el correo en MongoDB y compara la contraseña ingresada con el hash almacenado, utilizando `bcryptjs`. Si el usuario no existe o la contraseña no coincide, responde con el código 401 y el mensaje “Credenciales inválidas”.

Cuando las credenciales son correctas, se guardan en la sesión el correo, el rol y la referencia al cliente. El usuario administrador es dirigido a `/clientes/vista` y el visitante a `/eventos/vista`.

La sesión tiene una duración de 30 minutos. Al cerrar sesión, se destruye y se elimina la cookie asociada.

**Registro de visitantes**

El enlace “Regístrate” abre `/clientes/nuevo`. Al enviar el formulario, el sistema valida los datos, guarda el cliente y crea una cuenta asociada con rol `visitante`. La cuenta queda vinculada al cliente mediante `clienteId`.

Actualmente, las cuentas nuevas reciben la contraseña temporal `1234`, que se guarda protegida con `bcryptjs`. Esta contraseña fija es una limitación de seguridad pendiente de mejora.

**Permisos**

Las rutas protegidas verifican que exista una sesión y que el rol tenga autorización. Si no hay sesión, responden con 401; si el usuario no tiene permiso para esa operación, responden con 403.

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

El módulo Entradas fue creado para utilizarse con **MongoDB** y **Mongoose**. El módulo permite comprar entradas para eventos activos y consultar las entradas registradas. Cada entrada queda asociada a un evento y a un cliente, y puede tener estado activa o cancelada. Los administradores pueden ver todas las entradas, mientras que cada cliente ve únicamente las propias. La funcionalidad cuenta con vistas y una API REST para crear, consultar, actualizar y eliminar entradas.

Se adaptaron el modelo y el controlador para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

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

El módulo Clientes fue migrado de **JSON a MongoDB** utilizando **Mongoose**.

Se adaptaron el modelo y el controlador para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

Se incorporaron validaciones para el DNI y el correo electrónico, verificando formato, obligatoriedad y evitando registros duplicados.

También se implementó la creación automática de usuarios con rol `visitante` al registrar un cliente, generando una contraseña temporal y vinculando ambos registros mediante `clienteId`.

La modificación del correo electrónico de un cliente actualiza automáticamente el correo del usuario asociado, manteniendo la consistencia entre ambas colecciones.

Al eliminar un cliente, también se elimina el usuario asociado para evitar registros huérfanos.

La interfaz utiliza **Fetch API** para realizar búsquedas, altas, modificaciones y bajas sin necesidad de recargar la página.

El CRUD completo fue probado utilizando la aplicación y **Thunder Client**.

**Endpoints principales**

- GET `/clientes`.
- GET `/clientes/:id`.
- POST `/clientes`.
- PUT `/clientes/:id`.
- DELETE `/clientes/:id`.

**Ejemplo de registro de cliente**

```json
{
  "nombre": "Lucía",
  "apellido": "Fernández",
  "dni": "12345678",
  "email": "lucia@test.com",
  "telefono": "1165432189"
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

- Migrar los módulos restantes para utilizar Fetch API.
- Funcionalidad de cancelación de entradas con liberación de vacantes.
- Incorporación del módulo de Reservas con control de aforo por capacidad máxima de sala.
- Implementación de consultas de negocio dependientes del módulo de Entradas: entradas vendidas y entradas disponibles por evento.
- Permitir a los usuarios cambiar su contraseña.
- Integrar medios de pago.

## Uso de IA

Usamos IA como apoyo para resolver dudas puntuales, revisar alternativas técnicas y mejorar la documentación. Las propuestas fueron revisadas y adaptadas por el equipo antes de incorporarlas.

La consultamos principalmente para temas relacionados con MongoDB, Mongoose, operaciones sobre la base de datos, `async/await`, Fetch API, validaciones, sesiones, roles e integración Cliente-Usuario.

En particular, la consultamos para incorporar el manejo de sesiones con Express Session, tema presente en el módulo 10 del aula virtual (descargado el 10/10/2026), necesario para implementar el login con roles.

También se utilizó como apoyo para generar imágenes culturales, desarrollar las plantillas Pug y los estilos CSS, conectar la cartelera con MongoDB e interpretar errores y conflictos de Git.
