// --- Sales360 Main Entry Point ---
window.app = window.app || {};

// Initialize App on DOM Loaded
window.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.init) {
        window.app.init();
    }
});
