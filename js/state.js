// --- Sales360 Module: state.js ---
window.app = window.app || {};

window.app.currentUser = null;

window.app.isSystemSettingsAuthorized = false;

window.app.currentMonth = localStorage.getItem('aci_current_month') || 'April';

window.app.lastMonth = localStorage.getItem('aci_last_month') || 'March';

window.app.currentFY = localStorage.getItem('aci_current_fy') || '2025-26';

window.app.selectedFY = null;

window.app.getYtdMonths = (currentMonth) => {
                const monthsList = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const idx = monthsList.indexOf(currentMonth);
                if (idx <= 0) return [];
                return monthsList.slice(0, idx);
            };

window.app.currentSOView = 'dashboard';

window.app.soBrandTab = 'Foton';

window.app.soSaleTypeTab = 'New Sale';

window.app.soMonthTab = null, // Dynamically defaults to last month;

window.app.adminBrandTab = 'Foton';

window.app.adminSaleTypeTab = 'New Sale';

window.app.aiBrandTab = 'Foton', // State for new AI tab;

window.app.analyticsFY1 = '2024-25', // Default Historical FY;

window.app.analyticsFY2 = '2025-26', // Default Compare FY;

window.app.analyticsBrand = 'All';

window.app.analyticsTerritory = 'All';

window.app.analyticsModel = 'All';

window.app.analyticsUpazila = 'All';

window.app.yoyBrandTab = 'Foton', // State for YOY Chart Brand Filter (Default: Foton);

window.app.yoyTerritoryFilter = 'All', // State for YOY Chart Territory Filter (Default: All);

window.app.yoyShowLY = false,   // State for Last Year Line Toggle;

window.app.adminShowYTD = false;

window.app.adminShowLastMonth = false;

window.app.performanceFilterMonth = null;

window.app.pulseDetailedView = false;

window.app.pulseMobileQuarter = 'Q1';

window.app.pulseSortCol = 'sortVal_curr_ach';

window.app.pulseSortDir = 'desc';

window.app.pulseFilterTerritories = [];

window.app.mapBrandTab = 'All', // State for Sales Map;

window.app.mapModelTab = 'All', // State for Sales Map;

window.app.mapDistrictTab = 'All', // State for District Filter;

window.app.mapViewMode = 'district', // 'district' or 'upazila';

window.app.mapMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'], // State for Multi-Month map filter;

window.app.geoJsonCache = {}, // Cache for large map polygons;

window.app.charts = {};

