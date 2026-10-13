// js/TPTlevelParser.js

window.TPTlevelParser = {
    
    // Función auxiliar: Convierte un archivo crudo (Blob) a texto (Base64)
    blobToBase64: function(blob) {
        return new Promise((resolve, reject) => {
            if (!blob) {
                resolve(null);
                return;
            }
            if (typeof blob === 'string') {
                resolve(blob);
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
        if (base64URI instanceof Blob) return base64URI;
        if (typeof base64URI === 'string' && (base64URI.startsWith('assets/') || !base64URI.startsWith('data:'))) {
            return base64URI;
        }
        try {
            const response = await fetch(base64URI);
            return await response.blob();
        } catch (e) {
            console.error("Error convirtiendo base64 a blob", e);
            return base64URI;
        }
    },

    // --- EXPORTAR NIVEL (Descargar .json) ---
    exportar: async function(nivel) {
        if (window.TPTTiers && !window.TPTTiers.tieneAccesoCreador()) {
            if (window.TPTui && window.TPTui.mostrarAlerta) {
                window.TPTui.mostrarAlerta(
                    "La exportación de niveles forma parte de la Edición Creador (Tier 2). En la versión base solo están disponibles los niveles oficiales DENKKRAFT.",
                    "Función de Edición Creador",
                    "alerta"
                );
            }
            return;
        }

        // 1. Transformamos todos los posibles archivos multimedia a texto
        const audioB64 = await this.blobToBase64(nivel.archivoAudio);
        const imgInicioB64 = await this.blobToBase64(nivel.imgInicio);
        const imgFinB64 = await this.blobToBase64(nivel.imgFin);

        // Huella criptográfica del texto para asegurar que no pueda ser alterado
        const hashTexto = (window.TPTui && window.TPTui.generarHashTexto) 
            ? await window.TPTui.generarHashTexto(nivel.texto) 
            : (nivel.hashTexto || '');

        // 2. Creamos una copia del nivel con los archivos transformados y metadatos de autor intactos
        const nivelExportar = {
            ...nivel,
            id: nivel.id,
            autorId: nivel.autorId || 'docente_creador',
            autorNombre: nivel.autorNombre || 'Docente / Creador',
            hashTexto: hashTexto,
            caracteresTexto: (nivel.texto || '').trim().length,
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
        if (window.TPTTiers && !window.TPTTiers.tieneAccesoCreador()) {
            if (window.TPTui && window.TPTui.mostrarAlerta) {
                window.TPTui.mostrarAlerta(
                    "La importación de niveles comunitarios forma parte de la Edición Creador (Tier 2). En el juego base solo están disponibles los niveles oficiales DENKKRAFT.",
                    "Función de Edición Creador",
                    "alerta"
                );
            }
            return;
        }

        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                // 1. Leemos el texto del JSON
                const nivelImportado = JSON.parse(event.target.result);
                
                // 2. Preservamos estrictamente el ID original del nivel para asegurar trazabilidad académica
                if (!nivelImportado.id || typeof nivelImportado.id !== 'string') {
                    nivelImportado.id = "lvl_" + Date.now();
                }

                // Preservamos el autor original y metadatos de integridad
                if (!nivelImportado.autorNombre) {
                    nivelImportado.autorNombre = 'Docente / Creador';
                }
                if (!nivelImportado.autorId) {
                    nivelImportado.autorId = 'autor_externo';
                }
                if (window.TPTui && window.TPTui.generarHashTexto && nivelImportado.texto) {
                    nivelImportado.hashTexto = await window.TPTui.generarHashTexto(nivelImportado.texto);
                }
                nivelImportado.caracteresTexto = (nivelImportado.texto || '').trim().length;
                nivelImportado.esOficial = false; // Por seguridad los niveles importados nunca pueden adjudicarse la firma DenkKraft oficial

                // 3. Revertimos los textos Base64 a Blobs para que la base de datos lo guarde en su formato original
                nivelImportado.archivoAudio = await this.base64ToBlob(nivelImportado.archivoAudio);
                nivelImportado.imgInicio = await this.base64ToBlob(nivelImportado.imgInicio);
                nivelImportado.imgFin = await this.base64ToBlob(nivelImportado.imgFin);

                // 4. Guardamos en la base de datos (sobrescribiendo de forma segura si ya existía con ese ID)
                await window.TPTDatabase.guardarNivel(nivelImportado);
                if (window.TPTui && window.TPTui.mostrarAlerta) {
                    window.TPTui.mostrarAlerta(
                        `¡Nivel "${nivelImportado.titulo}" importado con éxito!\nAutor: ${nivelImportado.autorNombre}\nID: ${nivelImportado.id}`, 
                        "Nivel Importado", 
                        "exito"
                    );
                }
                
                if (callbackExito) callbackExito();

            } catch (error) {
                console.error("Error al importar nivel:", error);
                if (window.TPTui && window.TPTui.mostrarAlerta) {
                    window.TPTui.mostrarAlerta("El archivo está corrupto o no es un formato válido de Tippen Tag.", "Error de Importación", "peligro");
                }
            }
        };
        reader.readAsText(archivo);
    }
};