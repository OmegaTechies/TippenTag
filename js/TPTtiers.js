// js/TPTtiers.js - Tippen Tag (DenkKraft)
// Sistema de Licencias y Tiers Comerciales (DLCs):
// Tier 1: Base (Solo niveles oficiales con etiqueta DENKKRAFT)
// Tier 2: Edición Creador (Tier 1 + Crear, Importar y Exportar niveles comunitarios)
// Tier 3: Edición Educativa (Tier 1 + Tier 2 + Certificados criptográficos y Portal Docente)

const TPTTiers = {
    TIER_1_BASE: 1,
    TIER_2_CREADOR: 2,
    TIER_3_DOCENTE: 3,

    // Obtener el tier activo (por defecto Tier 3 para habilitar todas las funciones en desarrollo)
    obtenerTierActual() {
        const guardado = localStorage.getItem('TPT_TIER_ACTIVO');
        const valor = guardado ? parseInt(guardado, 10) : this.TIER_3_DOCENTE;
        return [this.TIER_1_BASE, this.TIER_2_CREADOR, this.TIER_3_DOCENTE].includes(valor) 
            ? valor 
            : this.TIER_3_DOCENTE;
    },

    // Establecer el tier activo y aplicar cambios inmediatamente
    establecerTier(tier) {
        const tierNum = parseInt(tier, 10);
        if ([this.TIER_1_BASE, this.TIER_2_CREADOR, this.TIER_3_DOCENTE].includes(tierNum)) {
            localStorage.setItem('TPT_TIER_ACTIVO', tierNum.toString());
            if (window.TPTui && window.TPTui.aplicarReglasDeTier) {
                window.TPTui.aplicarReglasDeTier();
            }
        }
    },

    // Comprobar permisos
    tieneAccesoCreador() {
        return this.obtenerTierActual() >= this.TIER_2_CREADOR;
    },

    tieneAccesoDocente() {
        return this.obtenerTierActual() >= this.TIER_3_DOCENTE;
    },

    obtenerNombreTier(tier = this.obtenerTierActual()) {
        switch (tier) {
            case this.TIER_1_BASE: 
                return 'Tier 1: Juego Base (Solo Niveles Oficiales DENKKRAFT)';
            case this.TIER_2_CREADOR: 
                return 'Tier 2: Edición Creador (Importar/Exportar y Niveles Personalizados)';
            case this.TIER_3_DOCENTE: 
                return 'Tier 3: Edición Educativa (Certificados Anti-Trampas & Portal Docente)';
            default: 
                return 'Edición Desconocida';
        }
    }
};

window.TPTTiers = TPTTiers;
