SISTEMA DE RESERVAS DE CANCHAS DE TENIS - PROYECTO FINAL WEB III

Este proyecto es una aplicación completa (Full Stack) para gestionar reservas de canchas de tenis, con roles de usuario y administrador, sistema de autenticación, administración de canchas, reserva de turnos y panel de control.

🗄📁 Carpeta /database: Estructura y Datos de la BD

La carpeta /database contiene el archivo necesario para que cualquier persona pueda crear la base de datos y ejecutarla sin problemas.

full_backup.sql tiene la base de datos con algunos datos ya cargados para pruebas.

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

## Diagrama Entidad-Relación (DER)

El archivo DER-sistema_reservas.png muestra la estructura completa de la base de datos desarrollada (incluyendo las relaciones entre usuarios, canchas y reservas)