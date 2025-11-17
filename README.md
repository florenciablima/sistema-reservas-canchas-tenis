SISTEMA DE RESERVAS DE CANCHAS DE TENIS - PROYECTO FINAL WEB III

Este proyecto es una aplicación completa (Full Stack) para gestionar reservas de canchas de tenis, con roles de usuario y administrador, sistema de autenticación, administración de canchas, reserva de turnos y panel de control.

🗄📁 Carpeta /database: Estructura y Datos de la BD

La carpeta /database contiene los archivos necesarios para que cualquier persona pueda crear la base de datos y ejecutarla sin problemas.

📌 1. create_schema.sql (Estructura)

Este archivo contiene solo la estructura:

Creación de la base reservas_tenis

Tablas:

usuarios

canchas

reservas


Claves primarias y foráneas

Tipos de datos

Índices


Sirve para crear la base desde cero, sin datos internos.


---

📌 2. insert_data.sql (Datos iniciales)

Este archivo contiene todos los INSERTS:

Usuarios de ejemplo

Canchas con precios, tipos y disponibilidad

Reservas de prueba (si las había)


Este archivo permite que se cargue datos reales rápidamente para probar el sistema.

🔐 Autenticación y Roles

El sistema utiliza:

Tokens JWT

Persistencia de sesión con localStorage

Middleware auth para validar token

Middleware admin para restringir áreas


Rol usuario:

✔ Reservar cancha
✔ Ver sus reservas
✔ Cancelar reservas
✔ Consultar disponibilidad

Rol administrador:

✔ Panel de estadísticas
✔ Crear / editar / poner en mantenimiento canchas
✔ Ver todas las reservas
✔ Filtrar reservas
✔ Editar precios
✔ Cambiar disponibilidad de canchas


---

🏟 Funciones Principales

👤 Usuarios

Registro

Login con token JWT

Persistencia de sesión

Cierre de sesión


🎾 Canchas

Listado con precios

Filtro por tipo

Panel de mantenimiento

Edición de precio y nombre

Paginación


📅 Reservas

Reserva seleccionando fecha, hora y cancha

Validación de horarios ocupados

Cancelación de reserva

Vista de “Mis Reservas” con paginación

Precio visible siempre


🖥 Panel Admin

Dashboard de estadísticas

Gestión de canchas con tabla editable

Gestión de reservas con filtros



---

➕ Usuarios de ejemplo

Admin

email: admin@gmail.com
password: admin123

Usuario común (ejemplo ya cargado)

email: rodolfolopez@gmail.com
password: rodolfo123

