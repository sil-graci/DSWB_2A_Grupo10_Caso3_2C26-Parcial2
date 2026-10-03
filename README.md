

Proyecto DSWB - SixForge Labs - Grupo 10 - Caso 3 - 2C26
# Urbana Cult - Gestión de Eventos Culturales

**Materia:** Desarrollo de Sistemas Web - Back End (DSWB)  
**Comisión:** 2A | **Grupo:** 10 | **Caso de Estudio:** 3 - Urbana Cult  
**Ciclo Lectivo:** 2C2026  

---

##  Descripción del Proyecto

**Urbana Cult** es una solución backend desarrollada con **Node.js** y **Express** bajo el patrón arquitectónico **Modelo-Vista-Controlador (MVC)**. Su propósito es centralizar la gestión operativa de espacios culturales, organizando de forma consistente los módulos de **Salas**, **Eventos** y **Clientes**.

Para esta **Primera Entrega**, el sistema resuelve el núcleo del negocio mediante una **API REST**, persistencia local en archivos **JSON** (operada mediante el módulo nativo `fs` de Node.js, sin base de datos externa), validaciones de negocio en controladores y una interfaz web con vistas dinámicas generadas a través del motor de plantillas **Pug**.

---

##  Tecnologías Utilizadas

* **Entorno de ejecución:** Node.js
* **Framework web:** Express.js
* **Motor de plantillas:** Pug
* **Persistencia de datos:** JSON plano (manipulado con `fs.readFileSync` y `fs.writeFileSync`)
* **Variables de entorno:** `dotenv`
* **Estilos:** CSS3 nativo

---

## Estructura del Proyecto

```text
DSWB_2A_Grupo10_Caso3_2C26/
├── data/
│   ├── clientes.json
│   ├── eventos.json
│   └── salas.json
├── public/
│   └── styles.css
├── src/
│   ├── controllers/
│   │   ├── clientes.controllers.js
│   │   ├── eventos.controllers.js
│   │   └── salas.controllers.js
│   ├── models/
│   │   ├── Cliente.js
│   │   ├── Evento.js
│   │   └── Salas.js
│   ├── routes/
│   │   ├── clientes.routes.js
│   │   ├── eventos.routes.js
│   │   └── salas.routes.js
│   └── views/
│       ├── clientes.pug
│       ├── eventos.pug
│       ├── inicio.pug
│       ├── layout.pug
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
| **Salas** | `/salas/vista` | `salas.pug` | Listado visual de salas y sus capacidades |
| **Nueva Sala** | `/salas/nuevo` | `nueva_sala.pug` | Formulario de alta para registrar una nueva sala |
| **Eventos** | `/eventos/vista` | `eventos.pug` | Grilla de eventos en tarjetas con estados |
| **Nuevo Evento** | `/eventos/nuevo` | `nuevo_evento.pug` | Formulario de alta con selector dinámico de salas |
| **Clientes** | `/clientes/vista` | `clientes.pug` | Directorio de clientes registrados |
| **Nuevo Cliente** | `/clientes/nuevo` | `nuevo_cliente.pug` | Formulario de registro de datos de clientes |

## Documentación de la API REST (JSON)
### Módulo de Salas (/salas)

* GET /salas - Obtener todas las salas.
* GET /salas/:id - Obtener sala por ID.
* POST /salas - Crear una sala.
 ```text
JSON
{
  "nombre": "Sala Magna",
  "capacidad": 120
}
 ```
* PUT /salas/:id - Actualizar datos de una sala.
* DELETE /salas/:id - Eliminar una sala por ID.

### Módulo de Eventos (/eventos)
* GET /eventos - Obtener todos los eventos (actualiza automáticamente el estado a finalizado si ya transcurrieron).
* GET /eventos/:id - Obtener evento por ID.
* GET /eventos/proximos - Consulta de negocio: devuelve los eventos cuya fecha y hora aún no transcurrieron, ordenados cronológicamente.
* POST /eventos - Crear un nuevo evento (valida existencia de la sala y previene solapamientos de horario).
 ```text
{
  "titulo": "Recital Acústico",
  "descripcion": "Presentación íntima en vivo.",
  "fecha": "2026-11-20",
  "hora": "21:00",
  "salaId": 1,
  "estado": "activo"
}
 ```

* PUT /eventos/:id - Modificar datos de un evento.
* DELETE /eventos/:id - Eliminar un evento por ID.

### Módulo de Clientes (/clientes)
* GET /clientes - Obtener listado de clientes.
* GET /clientes/:id - Obtener ficha de cliente por ID.
* POST /clientes - Registrar un nuevo cliente.
 ```text
JSON
{
  "nombre": "Lucía",
  "apellido": "Fernández",
  "email": "lucia@test.com",
  "telefono": "1165432189"
}
 ```
* PUT /clientes/:id - Actualizar información de contacto del cliente.
* DELETE /clientes/:id - Dar de baja un cliente por ID.

## Códigos de Respuesta HTTP Implementados
* 200 OK: Petición resuelta con éxito (consultas, modificaciones y bajas).  
* 201 Created: Recurso creado exitosamente (altas).  
* 400 Bad Request: Datos incompletos, cadenas vacías, ID no numérico o conflicto de horario en la misma sala.  
* 404 Not Found: El recurso consultado, editado o borrado no existe en el registro.

## Próximos Pasos (Segunda y Tercera Entrega)
* Incorporación del módulo de Entradas y Reservas con control de aforo por capacidad máxima de sala. 
* Funcionalidad de Cancelación de Entradas con liberación de vacantes.
* Implementación de consultas de negocio dependientes del módulo de Entradas: entradas vendidas y entradas disponibles por evento.
* Migración de persistencia de archivos JSON hacia base de datos MongoDB.