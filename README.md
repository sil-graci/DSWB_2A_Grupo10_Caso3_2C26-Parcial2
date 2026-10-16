Proyecto DSWB - SixForge Labs - Grupo 10 - Caso 3 - 2C26
# Urbana Cult - Gestión de Eventos Culturales

**Materia:** Desarrollo de Sistemas Web - Back End (DSWB)  
**Comisión:** 2A | **Grupo:** 10 | **Caso de Estudio:** 3 - Urbana Cult  
**Ciclo Lectivo:** 2C2026  

---

##  Descripción del Proyecto

**Urbana Cult** es una solución backend desarrollada con **Node.js** y **Express** bajo el patrón arquitectónico **Modelo-Vista-Controlador (MVC)**. Su propósito es centralizar la gestión operativa de espacios culturales, organizando de forma consistente los módulos de  **Eventos**, **Entradas**, **Clientes** y **Salas**.

Para esta **Segunda Entrega**, el sistema resuelve el núcleo del negocio mediante una **API REST**, persistencia datos en **MongoDB** utilizando **Mongoose**, validaciones de negocio implementadas en los controladores y una interfaz web con vistas dinámicas generadas a través del motor de plantillas **Pug**. Además, incorpora autenticación basada en usuarios y roles, manejo de sesiones y operaciones asincrónicas mediante **Fetch API** en los módulos de Clientes y Eventos, mejorando la experiencia de uso sin necesidad de recargar la página

---

##  Tecnologías Utilizadas

* **Entorno de ejecución:** Node.js
* **Framework web:** Express.js
* **Motor de plantillas:** Pug
* **Base de datos:** MongoDB
* **ODM:** Mongoose
* **Variables de entorno:** `dotenv`
* **Estilos:** CSS3 nativo

---

## Estructura del Proyecto

```text
DSWB_2A_Grupo10_Caso3_2C26/
├
├── public/
│   └── styles.css
├── src/
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
│       ├── eventos.pug
│       ├── inicio.pug
│       ├── layout.pug
│       ├── login.pug
│       ├── nueva-entrada.pug
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

## Instalación y Puesta en Marcha
1. **Clonar el repositorio e ingresar a la carpeta**
    ```text
    Bash
    git clone <URL_DEL_REPOSITORIO>
    cd DSWB_2A_Grupo10_Caso3_2C26
    ```

2. **Instalar dependencias**
    ```text
    Bash
    npm install
    ```
3. **Configurar variables de entorno**
    Crear un archivo .env en la raíz del proyecto con la siguiente variable:

    PORT=3000

4. **Iniciar el servidor**
    ```text
    Bash
    npm start
 
    # O en modo desarrollo:
    npm run dev
   ```
El servidor quedará a la escucha en: http://localhost:3000

## Navegación en el Navegador (Vistas Pug)


| Módulo / Sección | Ruta Web | Vista Pug | Descripción |
| :--- | :--- | :--- | :--- |
| **Inicio** | `/` | `inicio.pug` | Pantalla principal de bienvenida al sistema |
| **Login** | `/login`|`login.pug`| Pantalla de Inicio de sesión|
| **Eventos** | `/eventos/vista` | `eventos.pug` | Grilla de eventos en tarjetas con estados |
| **Entrada** | `/entradas/vista` | `/entradas.pug`| Directorio de las entradas registradas en el sistema (según el rol) |
| **Nueva Entrada** | `/entradas/nueva/:eventoId` | `/nueva_entradas.pug`| Formulario para generar una nueva entrada |
| **Nuevo Evento** | `/eventos/nuevo` | `nuevo_evento.pug` | Formulario de alta con selector dinámico de salas |
| **Clientes** | `/clientes/vista` | `clientes.pug` | Directorio de clientes registrados |
| **Nuevo Cliente** | `/clientes/nuevo` | `nuevo_cliente.pug` | Formulario de registro de datos de clientes |
| **Salas** | `/salas/vista` | `salas.pug` | Listado visual de salas y sus capacidades |
| **Nueva Sala** | `/salas/nuevo` | `nueva_sala.pug` | Formulario de alta para registrar una nueva sala |


## Documentación de la API REST (JSON)

### Inicio de sesión y control de acceso

La aplicación utiliza sesiones del servidor para mantener identificado al usuario después de iniciar sesión. En esta entrega no se utiliza JWT.

**Rutas de autenticación**
- GET `/login`: muestra el formulario de acceso.
- POST `/login`: verifica las credenciales y crea la sesión.
- POST `/logout`: destruye la sesión y cierra el acceso.

El sistema busca el correo en MongoDB y compara la contraseña ingresada con la contraseña protegida almacenada, utilizando `bcryptjs`. Si el usuario no existe o la contraseña no coincide, responde con el código 401 y el mensaje “Credenciales inválidas”.

Cuando las credenciales son correctas, se guardan en la sesión el correo, el rol y la referencia al cliente. El usuario administrador es dirigido a `/clientes/vista` y el visitante a `/eventos/vista`.

La sesión tiene una duración de 30 minutos. Al cerrar sesión, se destruye y se elimina la cookie asociada.

**Registro de visitantes**
El enlace “Regístrate” abre `/clientes/nuevo`. Al enviar el formulario, el sistema valida los datos, guarda el cliente y crea una cuenta asociada con rol `visitante`. La cuenta queda vinculada al cliente mediante `clienteId`.

Actualmente, las cuentas nuevas reciben la contraseña temporal `1234`, que se guarda protegida con `bcryptjs`. Esta contraseña fija es una limitación de seguridad pendiente de mejora.

**Permisos**
Las rutas protegidas verifican que exista una sesión y que el rol tenga autorización. Si no hay sesión, responden con 401; si el usuario no tiene permiso para esa operación, responden con 403.

### Módulo de Entradas (/entradas)

El módulo Entradas fue creado para utilizarse con **MongoDB** y **Mongoose**. El módulo permite comprar entradas para eventos activos y consultar las entradas registradas. Cada entrada queda asociada a un evento y a un cliente, y puede tener estado activa o cancelada. Los administradores pueden ver todas las entradas, mientras que cada cliente ve únicamente las propias. La funcionalidad cuenta con vistas y una API REST para crear, consultar, actualizar y eliminar entradas.

Se adaptaron el modelo y el controller para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

El CRUD completo fue probado correctamente utilizando Thunder Client. En próximas iteraciones se añadirá la funcionalidad de eliminar y modificar entradas dentro del programa (desde la web), ya que desde la interfaz del programa todavía no es posible modificar ni eliminar entradas; esas acciones están disponibles mediante la API REST.

**Endpoints principales**
- GET /entradas  
- GET /entradas/:id
- POST /entradas
- PUT /entradas/:id
- DELETE /entradas/:id

**Ejemplo de registro de entradas**
```json
{
  "eventoId": "6ace7c2e990e444e3cc9e8bf",
  "clienteId": "6ace7c86990e444e3cc9e8c0",
  "estado": "activa",
}
 ```

### Módulo de Eventos (/eventos)

El módulo Eventos fue migrado de **JSON a MongoDB** utilizando **Mongoose**. Cada evento guarda título, descripción, imagen, fecha, hora, sala (`salaId`, referencia a Salas) y estado (`activo`, `lleno` o `finalizado`).

El controller trabaja con `async/await` y usa `find`, `findById`, `findOne`, `create`, `save` y `findByIdAndDelete`. La modificación usa `findById` + `save` para poder controlar conflictos de horario y ejecutar las validaciones del esquema.

**Validaciones y manejo de errores**
- Campos obligatorios, `salaId` con formato de ObjectId válido y estado dentro de los valores permitidos (400).
- La sala indicada debe existir (404).
- No se permite otro evento en la misma sala, fecha y hora (400). El solapamiento parcial de horarios no se controla.
- Todo con `try/catch`, devolviendo 500 ante errores inesperados.
- Al consultar los eventos, los que ya pasaron se actualizan a `finalizado`.
- `GET /eventos/proximos` devuelve los eventos futuros ordenados cronológicamente.

**Interfaz con Fetch API**
`public/js/eventos.js` pide eventos y salas en paralelo (`Promise.all`), arma las tarjetas con el nombre de cada sala y permite filtrar próximos y eliminar sin recargar. `public/js/nuevo_evento.js` envía el formulario con POST (alta) o PUT (modificación).
El CRUD completo fue probado correctamente utilizando la aplicación y **Thunder Client**.

**Permisos**
Alta, modificación y baja son solo para el rol `admin`. El botón "Comprar entrada" aparece para `admin` y `visitante` en los eventos activos.

**Endpoints principales**
- GET /eventos
- GET /eventos/:id
- GET /eventos/proximos
- POST /eventos
- PUT /eventos/:id
- DELETE /eventos/:id

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

Se adaptaron el modelo y el controller para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

Se incorporaron validaciones para el DNI y el correo electrónico, verificando formato, obligatoriedad y evitando registros duplicados.

También se implementó la creación automática de usuarios con rol visitante al registrar un cliente, generando una contraseña temporal y vinculando ambos registros mediante clienteId.

La modificación del correo electrónico de un cliente actualiza automáticamente el correo del usuario asociado, manteniendo la consistencia entre ambas colecciones.
Al eliminar un cliente, también se elimina el usuario asociado para evitar registros huérfanos.

La interfaz utiliza **Fetch API** para realizar búsquedas, altas, modificaciones y bajas sin necesidad de recargar la página.

El CRUD completo fue probado correctamente utilizando la aplicación y **Thunder Client**.

**Endpoints principales**
- GET /clientes
- GET /clientes/:id
- POST /clientes
- PUT /clientes/:id
- DELETE /clientes/:id

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

Se adaptaron el modelo y el controller para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

El CRUD completo fue probado correctamente utilizando la aplicación y Thunder Client.

**Endpoints principales**
- GET /salas 
- GET /salas/:id 
- POST /salas 
- PUT /salas/:id 
- DELETE /salas/:id 

**Ejemplo de registro de cliente**
```json
{
  "nombre": "Sala Magna",
  "capacidad": 120
}
 ```

### Menú según rol de usuario

El sistema implementa autenticación basada en roles. 
El menú de navegación se adapta según el rol del usuario autenticado.

Roles disponibles:
- admin
- visitante

Los usuarios visitantes se generan automáticamente al registrar un cliente.

Cada usuario almacena:
- email
- passwordHash
- rol
- clienteId

#### Administrador

El usuario con rol `admin` puede visualizar:
* Inicio
* Eventos
* Entradas
* Reservas
* Clientes
* Salas

#### Visitante

El usuario con rol `visitante` puede visualizar:
* Inicio
* Eventos
* Entradas

Las opciones Reservas, Clientes y Salas no se muestran para el visitante.


## Códigos de Respuesta HTTP Implementados
* 200 OK: Petición resuelta con éxito (consultas, modificaciones y bajas).  
* 201 Created: Recurso creado exitosamente (altas).  
* 400 Bad Request: Datos incompletos, cadenas vacías, ID no numérico o conflicto de horario en la misma sala.  
* 404 Not Found: El recurso consultado, editado o borrado no existe en el registro.
* 401 Unauthorized: Credenciales inválidas o solicitud a una ruta protegida sin haber iniciado sesión.
* 403 Forbidden: El usuario inició sesión, pero su rol no tiene permiso para realizar la operación.
* 500 Internal Server Error: Error inesperado del servidor al procesar la solicitud.(Respuesta general del servidor)

## Próximos Pasos 
* Migrar los módulos restantes para utilizar Fetch API.
* Funcionalidad de Cancelación de Entradas con liberación de vacantes.
* Incorporación del módulo de Reservas con control de aforo por capacidad máxima de sala.
* Implementación de consultas de negocio dependientes del módulo de Entradas: entradas vendidas y entradas disponibles por evento.
* Permitir a los usuarios cambiar su contraseña.
* Integrar medios de Pago

## Uso de IA

Usamos IA como apoyo para resolver dudas puntuales durante el desarrollo.

La consultamos principalmente para temas relacionados con MongoDB, Mongoose, operaciones sobre la base de datos, async/await y manejo de roles.
