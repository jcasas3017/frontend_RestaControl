/* =====================================================
   RestaControl — Configuración global del frontend
   Único lugar donde se define la URL del backend.
   Para apuntar a otro entorno (por ejemplo la nube) cambiar solo API_BASE_URL.
   ===================================================== */

window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:7070',
    FOOTER_HTML: `
        <span>&copy; 2026 RestaControl &mdash; Sistema de Gesti&oacute;n de Restaurante</span>
        <span>Universidad Tecnol&oacute;gica del Per&uacute;</span>
    `
};