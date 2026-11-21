# RestaControl – Frontend

Interfaz web del sistema de gestión de restaurantes **RestaControl** (curso Herramientas de Desarrollo, UTP).
Es una aplicación estática (HTML5, CSS3 y JavaScript) que consume el API REST del backend con `fetch`.

- Backend: [backend_RestaControl](https://github.com/jcasas3017/backend_RestaControl) (Java 17, Spring Boot, Spring Security, PostgreSQL)

## Requisitos

- Un navegador moderno.
- El backend en ejecución (ver su README).
- Un servidor estático para abrir las páginas, por ejemplo la extensión **Live Server** de VS Code (puerto 5500) o `npx serve`.

## Ejecución local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/jcasas3017/frontend_RestaControl.git
   cd frontend_RestaControl
   ```

2. Levantar el backend. Por defecto escucha en el puerto `8080`; el frontend apunta a `7070`, así que hay dos opciones:
   - arrancar el backend con la variable `PORT=7070`, o
   - cambiar `API_BASE_URL` en `js/config.js` al puerto que use el backend.

3. Abrir `index.html` con Live Server (por ejemplo `http://localhost:5500/index.html`) e iniciar sesión.
   El backend acepta peticiones desde cualquier `http://localhost:*` (CORS).

## Configuración

La URL del backend está en un único lugar: [`js/config.js`](js/config.js).

```js
window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:7070',
    // ...
};
```

Para apuntar a otro entorno (por ejemplo la nube) basta con cambiar `API_BASE_URL`. Todas las páginas deben cargar `config.js` antes que `auth.js`.

## Estructura

```
index.html            Inicio de sesión
css/                  Estilos (styles.css, login.css)
js/                   Lógica de cada pantalla (clientes.js, usuarios.js, dashboard.js, ...)
  config.js           URL del API y texto del pie de página
  auth.js             Sesión, login y logout
  layout.js           Menú lateral, permisos por rol y barra superior
pages/                Pantallas HTML
  partials/sidebar.html   Menú lateral compartido
```

## Pantallas y roles

| Pantalla | Roles con acceso |
|---|---|
| Dashboard | Todos los usuarios autenticados |
| Categorías, Platos, Productos, Usuarios | Administrador |
| Clientes, Mesas, Reservas, Reporte de reservas | Administrador, Recepción |
| Lista de mesas, Atenciones, Pedidos, Pedidos por mesa | Administrador, Mozo |
| Detalle de pedidos | Administrador, Mozo, Cocinero |
| Cocina | Administrador, Cocinero |
| Reporte de ventas, Caja | Administrador, Cajero |

Los permisos del menú están en `PAGE_PERMISSIONS` (`js/layout.js`) y reflejan las reglas de `SecurityConfig` del backend. El backend es quien finalmente autoriza cada petición.

## Notas

- `atenciones.html` y `pedidos.html` son aún maquetas estáticas sin conexión al API.
- Los scripts SQL y el diagrama ER se encuentran en el backend (`database/legacy` y `docs`).

## Flujo de trabajo

Cada requerimiento (`REQ-XX`) se desarrolla en una rama `N-req-XX-nombre`, con commits `tipo(REQ-XX): descripción` y se integra mediante Pull Request.
