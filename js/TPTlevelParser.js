// js/TPTlevelParser.js

window.TPTlevelParser = {
    
    // Función auxiliar: Convierte un archivo crudo (Blob) a texto (Base64)
    blobToBase64: function(blob) {
        return new Promise((resolve, reject) => {
            if (!blob) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    // Función auxiliar: Convierte texto (Base64) de vuelta a archivo crudo (Blob)
    base64ToBlob: async function(base64URI) {
        if (!base64URI) return null;
        try {
            const response = await fetch(base64URI);
            return await response.blob();
        } catch (e) {
            console.error("Error convirtiendo base64 a blob", e);
            return null;
        }
    },

    // --- EXPORTAR NIVEL (Descargar .json) ---
    exportar: async function(nivel) {
        // 1. Transformamos todos los posibles archivos multimedia a texto
        const audioB64 = await this.blobToBase64(nivel.archivoAudio);
        const imgInicioB64 = await this.blobToBase64(nivel.imgInicio);
        const imgFinB64 = await this.blobToBase64(nivel.imgFin);

        // 2. Creamos una copia del nivel con los archivos transformados
        const nivelExportar = {
            ...nivel,
            archivoAudio: audioB64,
            imgInicio: imgInicioB64,
            imgFin: imgFinB64
        };

        // 3. Empaquetamos todo en un .json y forzamos la descarga en el navegador
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nivelExportar));
        const etiquetaDescarga = document.createElement('a');
        etiquetaDescarga.setAttribute("href", dataStr);
        // Limpiamos el título para que no tenga espacios en el nombre del archivo
        etiquetaDescarga.setAttribute("download", `TippenTag_${nivel.titulo.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(etiquetaDescarga);
        etiquetaDescarga.click();
        etiquetaDescarga.remove();
    },

    // --- IMPORTAR NIVEL (Subir .json) ---
    importar: function(archivo, callbackExito) {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                // 1. Leemos el texto del JSON
                const nivelImportado = JSON.parse(event.target.result);
                
                // 2. Le asignamos un ID completamente nuevo para evitar conflictos si el usuario importa el mismo nivel 2 veces
                nivelImportado.id = "lvl_" + Date.now() + Math.floor(Math.random() * 1000);
                nivelImportado.esOficial = false; // Por seguridad

                // 3. Revertimos los textos Base64 a Blobs para que la base de datos lo guarde en su formato original
                nivelImportado.archivoAudio = await this.base64ToBlob(nivelImportado.archivoAudio);
                nivelImportado.imgInicio = await this.base64ToBlob(nivelImportado.imgInicio);
                nivelImportado.imgFin = await this.base64ToBlob(nivelImportado.imgFin);

                // 4. Guardamos en la base de datos
                await window.TPTDatabase.guardarNivel(nivelImportado);
                alert(`¡Nivel "${nivelImportado.titulo}" importado con éxito!`);
                
                if (callbackExito) callbackExito();

            } catch (error) {
                console.error("Error al importar nivel:", error);
                alert("El archivo está corrupto o no es un nivel válido de Tippen Tag.");
            }
        };
        reader.readAsText(archivo);
    }
};