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
│   │   └── Usuarios.js
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
| **Login** | | | Pantalla de Login y Registro |
| **Eventos** | `/eventos/vista` | `eventos.pug` | Grilla de eventos en tarjetas con estados |
| **Entrada** | | |  |
| **Nuevo Evento** | `/eventos/nuevo` | `nuevo_evento.pug` | Formulario de alta con selector dinámico de salas |
| **Clientes** | `/clientes/vista` | `clientes.pug` | Directorio de clientes registrados |
| **Nuevo Cliente** | `/clientes/nuevo` | `nuevo_cliente.pug` | Formulario de registro de datos de clientes |
| **Salas** | `/salas/vista` | `salas.pug` | Listado visual de salas y sus capacidades |
| **Nueva Sala** | `/salas/nuevo` | `nueva_sala.pug` | Formulario de alta para registrar una nueva sala |


## Documentación de la API REST (JSON)

### Módulo de Entradas (/salas)

El módulo Entradas fue migrado de **JSON a MongoDB** utilizando **Mongoose**.

Se adaptaron el modelo y el controller para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

El CRUD completo fue probado correctamente utilizando la aplicación y Thunder Client.

**Endpoints principales**
- GET /entradas  
- GET /entradas/:id
- POST /entradas
- PUT /entradas/:id
- DELETE /entradas/:id

**Ejemplo de registro de entradas**
```json

 ```

### Módulo de Eventos (/eventos)

El módulo Eventos fue migrado de **JSON a MongoDB** utilizando **Mongoose**.

Se adaptaron el modelo y el controller para trabajar con operaciones asincrónicas mediante `async/await`, utilizando `find`, `findById`, `save`, `findByIdAndUpdate` y `findByIdAndDelete`.

También se incorporaron validaciones simples y manejo de errores con `try/catch`.

La interfaz utiliza **Fetch API** para realizar búsquedas, altas, modificaciones y bajas sin necesidad de recargar la página.

El CRUD completo fue probado correctamente utilizando la aplicación y **Thunder Client**.

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
  "salaId": 1,
  "estado": "activo"
}
 ```

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
