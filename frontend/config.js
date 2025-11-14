// Configuración automática de URLs según entorno
// Si estás en localhost, usa http://localhost:3000
// Si estás en producción (Render), usa la URL de producción

const getApiUrl = () => {
    // Si estás corriendo en localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    
    // URL de producción en Railway
    return 'https://formulariosystem-frontend-production.up.railway.app';
};

const API_BASE_URL = getApiUrl();

// Exportar para usar en otros archivos
window.API_BASE_URL = API_BASE_URL;

console.log('🌐 API URL:', API_BASE_URL);
