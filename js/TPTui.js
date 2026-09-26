// ==========================================================================
// js/TPTui.js - Tippen Tag (DenkKraft)
// Controlador de interfaz, Drag & Drop, tienda, perfiles, atajos y creador
// ==========================================================================

// ==========================================================================
// RUTAS CONFIGURABLES PARA LA MÚSICA DEL MENÚ Y DE LA TIENDA:
// ==========================================================================
const RUTA_MUSICA_MENU = "assets/audio/TPTBG1.mp3";   // Música ambiental del menú
const RUTA_MUSICA_TIENDA = "assets/audio/TPTBG2.mp3"; // Música ambiental de la tienda

document.addEventListener('DOMContentLoaded', () => {
    
    // --- GESTIÓN GLOBAL DE AJUSTES (AUDIO, VOLUMEN Y GUÍA) ---
    const CONFIG_PREDETERMINADA = {
        musicaMenuActiva: true,
        volumenMenu: 50,       // 0 a 100
        volumenNiveles: 80,    // 0 a 100
        sfxActivo: true,
        volumenSFX: 70,        // 0 a 100
        guiaTecladoActiva: true
    };

    let configApp = { ...CONFIG_PREDETERMINADA };

    function cargarConfiguracion() {
        try {
            const guardado = localStorage.getItem('tippen_tag_config');
            if (guardado) {
                configApp = { ...CONFIG_PREDETERMINADA, ...JSON.parse(guardado) };
            }
        } catch (e) {
            configApp = { ...CONFIG_PREDETERMINADA };
        }
        window.TPTConfig = configApp;
    }

    function guardarConfiguracion() {
        try {
            localStorage.setItem('tippen_tag_config', JSON.stringify(configApp));
        } catch (e) {}
        window.TPTConfig = configApp;
    }

    cargarConfiguracion();

    // --- ELEMENTOS Y CONTROL DE MÚSICA DE FONDO (MENÚ Y TIENDA) ---
    const audioBgmMenu = document.getElementById('audio-bgm-menu');
    const audioBgmTienda = document.getElementById('audio-bgm-tienda');
    const btnQuickBgm = document.getElementById('btn-quick-bgm');
    const txtQuickBgm = document.getElementById('txt-quick-bgm');

    function actualizarQuickBgmUI() {
        if (!txtQuickBgm || !btnQuickBgm) return;
        if (configApp.musicaMenuActiva) {
            txtQuickBgm.textContent = 'Música: ON';
            btnQuickBgm.classList.add('activo');
        } else {
            txtQuickBgm.textContent = 'Música: OFF';
            btnQuickBgm.classList.remove('activo');
        }
    }

    function sincronizarBgmMenu() {
        if (!audioBgmMenu) return;
        if (RUTA_MUSICA_MENU) {
            try {
                const targetUrl = new URL(RUTA_MUSICA_MENU, window.location.href).href;
                if (audioBgmMenu.src !== targetUrl) {
                    audioBgmMenu.src = RUTA_MUSICA_MENU;
                }
            } catch (err) {
                audioBgmMenu.src = RUTA_MUSICA_MENU;
            }
        }
        audioBgmMenu.volume = (configApp.volumenMenu / 100);
        actualizarQuickBgmUI();
    }

    function sincronizarBgmTienda() {
        if (!audioBgmTienda) return;
        if (RUTA_MUSICA_TIENDA) {
            try {
                const targetUrl = new URL(RUTA_MUSICA_TIENDA, window.location.href).href;
                if (audioBgmTienda.src !== targetUrl) {
                    audioBgmTienda.src = RUTA_MUSICA_TIENDA;
                }
            } catch (err) {
                audioBgmTienda.src = RUTA_MUSICA_TIENDA;
            }
        }
        audioBgmTienda.volume = (configApp.volumenMenu / 100);
    }

    function reproducirMusicaMenu() {
        if (!audioBgmMenu || !RUTA_MUSICA_MENU || !configApp.musicaMenuActiva) return;
        sincronizarBgmMenu();
        const playPromise = audioBgmMenu.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                const reproducirAlInteractuar = () => {
                    if (configApp.musicaMenuActiva && audioBgmMenu.paused) {
                        audioBgmMenu.play().catch(() => {});
                    }
                    window.removeEventListener('click', reproducirAlInteractuar);
                    window.removeEventListener('keydown', reproducirAlInteractuar);
                };
                window.addEventListener('click', reproducirAlInteractuar, { once: true });
                window.addEventListener('keydown', reproducirAlInteractuar, { once: true });
            });
        }
    }

    function pausarMusicaMenu() {
        if (audioBgmMenu && !audioBgmMenu.paused) {
            audioBgmMenu.pause();
        }
    }

    function reproducirMusicaTienda() {
        if (!audioBgmTienda || !RUTA_MUSICA_TIENDA || !configApp.musicaMenuActiva) return;
        sincronizarBgmTienda();
        const playPromise = audioBgmTienda.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    }

    function pausarMusicaTienda() {
        if (audioBgmTienda && !audioBgmTienda.paused) {
            audioBgmTienda.pause();
        }
    }

    sincronizarBgmMenu();
    sincronizarBgmTienda();

    if (btnQuickBgm) {
        btnQuickBgm.addEventListener('click', () => {
            configApp.musicaMenuActiva = !configApp.musicaMenuActiva;
            guardarConfiguracion();
            actualizarQuickBgmUI();
            if (configApp.musicaMenuActiva) {
                if (modalTienda && modalTienda.classList.contains('tienda-overlay-activo')) {
                    reproducirMusicaTienda();
                } else {
                    reproducirMusicaMenu();
                }
            } else {
                pausarMusicaMenu();
                pausarMusicaTienda();
            }
            sincronizarAjustesModalUI();
        });
    }

    // --- NAVEGACIÓN ENTRE VISTAS ---
    const vistas = {
        landing: document.getElementById('vista-landing'),
        menu: document.getElementById('vista-menu'),
        creador: document.getElementById('vista-creador'),
        juego: document.getElementById('vista-juego'),
        prejuego: document.getElementById('vista-prejuego'),
        crearUsuario: document.getElementById('vista-crear-usuario'),
        narrativa: document.getElementById('vista-narrativa')
    };

    function cambiarVista(vistaDestino) {
        for (const clave in vistas) {
            if (vistas[clave]) {
                vistas[clave].classList.remove('vista-activa');
                vistas[clave].classList.add('vista-oculta');
            }
        }
        if (vistas[vistaDestino]) {
            vistas[vistaDestino].classList.remove('vista-oculta');
            vistas[vistaDestino].classList.add('vista-activa');
        }

        // Si se entra a la partida o cinemática, pausar música del menú y de la tienda
        if (vistaDestino === 'juego' || vistaDestino === 'narrativa') {
            pausarMusicaMenu();
            pausarMusicaTienda();
            if (modalTienda && modalTienda.classList.contains('tienda-overlay-activo')) {
                cerrarTienda();
            }
        } else {
            if (modalTienda && modalTienda.classList.contains('tienda-overlay-activo')) {
                pausarMusicaMenu();
                reproducirMusicaTienda();
            } else if (configApp.musicaMenuActiva) {
                reproducirMusicaMenu();
            }
        }
    }

    // --- VARIABLES DE USUARIO ACTIVO ---
    let usuarioActivo = null;

    async function sumarPuntos(puntosGanados) {
        if (!usuarioActivo) return;
        usuarioActivo.puntos = (usuarioActivo.puntos || 0) + puntosGanados;
        await window.TPTDatabase.guardarUsuario(usuarioActivo);
        actualizarPuntosTienda();
        actualizarInfoUsuarioMenu();
    }

    function actualizarPuntosTienda() {
        const display = document.getElementById('display-puntos-tienda');
        if (display && usuarioActivo) {
            display.textContent = `${usuarioActivo.puntos} pts`;
        }
    }

    function actualizarInfoUsuarioMenu() {
        if (!usuarioActivo) return;
        const nombreDisplay = document.getElementById('menu-nombre-usuario');
        const puntosDisplay = document.getElementById('menu-puntos-usuario');
        const avatarDisplay = document.getElementById('menu-avatar-display');

        if (nombreDisplay) nombreDisplay.textContent = usuarioActivo.nombre;
        if (puntosDisplay) puntosDisplay.textContent = `${usuarioActivo.puntos} pts`;
        
        if (avatarDisplay) {
            if (usuarioActivo.avatarBlob) {
                const url = URL.createObjectURL(usuarioActivo.avatarBlob);
                avatarDisplay.style.backgroundImage = `url(${url})`;
                avatarDisplay.textContent = '';
            } else {
                avatarDisplay.style.backgroundImage = 'none';
                avatarDisplay.textContent = usuarioActivo.nombre.charAt(0).toUpperCase();
            }
        }
    }

    function aplicarCosmetico(tipo, valor) {
        if (tipo === 'tema') {
            document.body.classList.remove('tema-claro', 'tema-oscuro', 'tema-espacio');
            document.body.classList.add(`tema-${valor}`);
        } else if (tipo === 'mascota') {
            const mascotaDisplay = document.getElementById('mascota-display');
            if (mascotaDisplay) {
                mascotaDisplay.className = `mascota-img mascota-${valor}`;
            }
        }
    }

    // --- VARIABLES DE PARTIDA Y CREADOR ---
    let nivelSeleccionado = null; 
    let idNivelEnEdicion = null; 
    let audioEnEdicion = null;   
    let imgInicioEnEdicion = null;
    let imgFinEnEdicion = null;

    let modTiempoActivo = true;
    let modVidasActivo = false;
    let modViajeActivo = false;
    let modOriginalActivo = true;
    let modoCalculado = 'normal';

    // --- SISTEMA REUTILIZABLE DE DRAG AND DROP ---
    function configurarDropzone(dropzoneId, inputId, labelNombreId, callback) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);
        const labelNombre = labelNombreId ? document.getElementById(labelNombreId) : null;
        if (!dropzone || !input) return;

        function mostrarNombre(archivo) {
            if (labelNombre && archivo) {
                labelNombre.textContent = archivo.name;
                labelNombre.style.display = 'inline-block';
            }
        }

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const archivo = e.dataTransfer.files[0];
                try {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(archivo);
                    input.files = dataTransfer.files;
                } catch (err) {
                    // Fallback para navegadores antiguos
                }
                mostrarNombre(archivo);
                if (callback) callback(archivo);
            }
        });

        dropzone.addEventListener('click', () => {
            input.click();
        });

        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const archivo = e.target.files[0];
                mostrarNombre(archivo);
                if (callback) callback(archivo);
            }
        });
    }

    // Inicializar Dropzones
    configurarDropzone('dropzone-avatar', 'avatar-usuario-input', 'avatar-nombre-archivo');
    configurarDropzone('dropzone-audio', 'audio-input', 'audio-nombre-archivo');
    configurarDropzone('dropzone-img-inicio', 'img-inicio-input', 'img-inicio-nombre-archivo');
    configurarDropzone('dropzone-img-fin', 'img-fin-input', 'img-fin-nombre-archivo');
    
    // Dropzone para Importar Nivel .json
    configurarDropzone('dropzone-importar', 'input-archivo-importar', null, (archivo) => {
        if (archivo && window.TPTlevelParser) {
            window.TPTlevelParser.importar(archivo, async () => {
                await cargarTarjetasDeNiveles();
            });
        }
    });

    // --- SISTEMA DE CONSEJOS ROTATIVOS (LANDING) ---
    const consejosMecanografia = [
        "Acentos y Tildes: Presiona y suelta la tecla de tilde [ ´ ] (a la derecha de la P) y luego pulsa la vocal deseada (á, é, í, ó, ú).",
        "Paréntesis: Para abrir y cerrar paréntesis ( ), mantén presionado Shift y pulsa las teclas 8 o 9 en la fila numérica superior.",
        "Comillas y Signos: Presiona Shift + 2 para comillas dobles (\"), y Shift + 1 para signo de admiración de cierre (!).",
        "Diéresis: Para escribir la diéresis ( ü ), presiona Shift + [ ¨ ] (junto a la P), suéltala y pulsa la letra u.",
        "Posición Base de Manos: Coloca tus dedos índices en las teclas guía F y J (tienen marcas táctiles) para ubicar tus manos sin mirar.",
        "Atajo de Música: Durante canciones o dictados, puedes pausar o continuar la pista de audio rápidamente pulsando Alt + P."
    ];

    let indiceConsejoActual = 0;
    let intervaloConsejos = null;

    function iniciarConsejosRotativos() {
        const textoEl = document.getElementById('landing-consejo-texto');
        const indicadoresEl = document.getElementById('consejo-indicadores');
        if (!textoEl || !indicadoresEl) return;

        indicadoresEl.innerHTML = '';
        consejosMecanografia.forEach((_, idx) => {
            const punto = document.createElement('span');
            punto.className = `consejo-punto ${idx === 0 ? 'activo' : ''}`;
            punto.title = `Consejo ${idx + 1}`;
            punto.addEventListener('click', () => {
                mostrarConsejo(idx);
                reiniciarIntervaloConsejos();
            });
            indicadoresEl.appendChild(punto);
        });

        function mostrarConsejo(idx) {
            indiceConsejoActual = idx;
            textoEl.style.opacity = '0';
            setTimeout(() => {
                textoEl.textContent = consejosMecanografia[indiceConsejoActual];
                textoEl.style.opacity = '1';
                const puntos = indicadoresEl.querySelectorAll('.consejo-punto');
                puntos.forEach((p, i) => {
                    p.classList.toggle('activo', i === indiceConsejoActual);
                });
            }, 220);
        }

        function siguienteConsejo() {
            const siguiente = (indiceConsejoActual + 1) % consejosMecanografia.length;
            mostrarConsejo(siguiente);
        }

        function reiniciarIntervaloConsejos() {
            clearInterval(intervaloConsejos);
            intervaloConsejos = setInterval(siguienteConsejo, 6500);
        }

        mostrarConsejo(0);
        reiniciarIntervaloConsejos();
    }

    // --- CARGA DE PERFILES Y PAGINACIÓN (LANDING) ---
    let paginaPerfilesActual = 1;
    const perfilesPorPagina = 4;

    const btnPerfilesPrev = document.getElementById('btn-perfiles-prev');
    const btnPerfilesNext = document.getElementById('btn-perfiles-next');

    if (btnPerfilesPrev) {
        btnPerfilesPrev.addEventListener('click', async () => {
            if (paginaPerfilesActual > 1) {
                paginaPerfilesActual--;
                await cargarPerfiles();
            }
        });
    }

    if (btnPerfilesNext) {
        btnPerfilesNext.addEventListener('click', async () => {
            paginaPerfilesActual++;
            await cargarPerfiles();
        });
    }

    async function cargarPerfiles() {
        const contenedor = document.getElementById('grid-perfiles');
        if (!contenedor) return;
        contenedor.innerHTML = '';

        try {
            const usuarios = await window.TPTDatabase.obtenerUsuarios();
            const totalPaginasPerfiles = Math.ceil(usuarios.length / perfilesPorPagina) || 1;
            paginaPerfilesActual = Math.min(Math.max(1, paginaPerfilesActual), totalPaginasPerfiles);

            const inicio = (paginaPerfilesActual - 1) * perfilesPorPagina;
            const paginaUsuarios = usuarios.slice(inicio, inicio + perfilesPorPagina);

            paginaUsuarios.forEach(usuario => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'perfil-card';

                const circulo = document.createElement('div');
                circulo.className = 'perfil-circulo';
                
                if (usuario.avatarBlob) {
                    const urlImagen = URL.createObjectURL(usuario.avatarBlob);
                    circulo.style.backgroundImage = `url(${urlImagen})`;
                } else {
                    circulo.textContent = usuario.nombre.charAt(0).toUpperCase();
                }

                const nombre = document.createElement('div');
                nombre.className = 'perfil-nombre';
                nombre.textContent = usuario.nombre;

                const puntos = document.createElement('div');
                puntos.className = 'perfil-puntos';
                puntos.textContent = `${usuario.puntos || 0} pts`;

                tarjeta.appendChild(circulo);
                tarjeta.appendChild(nombre);
                tarjeta.appendChild(puntos);

                tarjeta.addEventListener('click', async () => {
                    usuarioActivo = usuario;
                    usuarioActivo.inventario = usuarioActivo.inventario || ['tema_claro', 'mascota_gato'];
                    
                    aplicarCosmetico('tema', usuarioActivo.temaEquipado || 'claro');
                    aplicarCosmetico('mascota', usuarioActivo.mascotaEquipada || 'gato');
                    actualizarPuntosTienda();
                    actualizarInfoUsuarioMenu();
                    
                    await cargarTarjetasDeNiveles();
                    cambiarVista('menu');
                });

                contenedor.appendChild(tarjeta);
            });

            const tarjetaAdd = document.createElement('div');
            tarjetaAdd.className = 'perfil-card perfil-add';
            tarjetaAdd.innerHTML = `
                <div class="perfil-circulo">+</div>
                <div class="perfil-nombre">Nuevo Perfil</div>
                <div class="perfil-puntos">Crear Jugador</div>
            `;
            tarjetaAdd.addEventListener('click', () => cambiarVista('crearUsuario'));
            contenedor.appendChild(tarjetaAdd);

            // Actualizar paginador de perfiles
            const paginacionPerfiles = document.getElementById('paginacion-perfiles');
            const indicadorPagPerfiles = document.getElementById('indicador-pag-perfiles');

            if (paginacionPerfiles && indicadorPagPerfiles && btnPerfilesPrev && btnPerfilesNext) {
                if (totalPaginasPerfiles > 1) {
                    paginacionPerfiles.style.display = 'flex';
                    indicadorPagPerfiles.textContent = `Página ${paginaPerfilesActual} de ${totalPaginasPerfiles}`;
                    btnPerfilesPrev.disabled = (paginaPerfilesActual <= 1);
                    btnPerfilesNext.disabled = (paginaPerfilesActual >= totalPaginasPerfiles);
                } else {
                    paginacionPerfiles.style.display = 'none';
                }
            }

        } catch (error) {
            console.error("Error al cargar usuarios de IndexedDB:", error);
        }
    }

    const formCrearUsuario = document.getElementById('form-crear-usuario');
    if (formCrearUsuario) {
        formCrearUsuario.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nuevoUsuario = {
                id: "usr_" + Date.now(),
                nombre: document.getElementById('nombre-usuario-input').value.trim(),
                avatarBlob: document.getElementById('avatar-usuario-input').files[0] || null,
                puntos: 0,
                temaEquipado: 'claro',
                mascotaEquipada: 'gato',
                inventario: ['tema_claro', 'mascota_gato'],
                highscores: {}
            };

            await window.TPTDatabase.guardarUsuario(nuevoUsuario);
            formCrearUsuario.reset();
            const lblAvatar = document.getElementById('avatar-nombre-archivo');
            if (lblAvatar) lblAvatar.style.display = 'none';

            await cargarPerfiles();
            cambiarVista('landing');
        });
    }

    const btnCancelarUsuario = document.getElementById('btn-cancelar-usuario');
    if (btnCancelarUsuario) btnCancelarUsuario.addEventListener('click', () => cambiarVista('landing'));

    // --- CREADOR / EDITOR DE NIVELES ---
    const formCreador = document.getElementById('form-crear-nivel');
    const selectModoCreador = document.getElementById('modo-juego-input');
    const inputTiempoCreador = document.getElementById('tiempo-input');
    const inputVidasCreador = document.getElementById('vidas-input');
    const btnEliminarNivel = document.getElementById('btn-eliminar-nivel');

    // Deshabilitar campos automáticamente al escoger Modo Viaje en Creador
    function actualizarCamposModoCreador() {
        if (!selectModoCreador) return;
        const modo = selectModoCreador.value;
        if (modo === 'viaje') {
            if (inputTiempoCreador) { inputTiempoCreador.disabled = true; inputTiempoCreador.value = 0; }
            if (inputVidasCreador) { inputVidasCreador.disabled = true; inputVidasCreador.value = 0; }
        } else if (modo === 'vital') {
            if (inputTiempoCreador) { inputTiempoCreador.disabled = true; inputTiempoCreador.value = 0; }
            if (inputVidasCreador) { inputVidasCreador.disabled = false; if (inputVidasCreador.value <= 0) inputVidasCreador.value = 3; }
        } else if (modo === 'normal') {
            if (inputTiempoCreador) { inputTiempoCreador.disabled = false; if (inputTiempoCreador.value <= 0) inputTiempoCreador.value = 45; }
            if (inputVidasCreador) { inputVidasCreador.disabled = true; inputVidasCreador.value = 0; }
        } else {
            // Difícil
            if (inputTiempoCreador) { inputTiempoCreador.disabled = false; if (inputTiempoCreador.value <= 0) inputTiempoCreador.value = 45; }
            if (inputVidasCreador) { inputVidasCreador.disabled = false; if (inputVidasCreador.value <= 0) inputVidasCreador.value = 3; }
        }
    }

    if (selectModoCreador) {
        selectModoCreador.addEventListener('change', actualizarCamposModoCreador);
    }

    if (formCreador) {
        formCreador.addEventListener('submit', async (event) => {
            event.preventDefault();

            const idNivel = idNivelEnEdicion ? idNivelEnEdicion : "lvl_" + Date.now();
            const titulo = document.getElementById('titulo-input').value.trim();
            const texto = document.getElementById('texto-input').value.trim();
            const dificultad = document.getElementById('dificultad-input').value;
            const modoJuego = document.getElementById('modo-juego-input').value;
            
            let tiempoLimite = parseInt(document.getElementById('tiempo-input').value) || 0; 
            let vidas = parseInt(document.getElementById('vidas-input').value) || 0;
            if (modoJuego === 'viaje') {
                tiempoLimite = 0;
                vidas = 0;
            }

            const historiaInicio = document.getElementById('historia-inicio-input').value;
            const historiaFin = document.getElementById('historia-fin-input').value;
            const animacionGolpe = document.getElementById('animacion-golpe-input').checked;

            let archivoAudioNuevo = document.getElementById('audio-input').files[0];
            let audioFinal = archivoAudioNuevo ? archivoAudioNuevo : audioEnEdicion;

            let archivoImgInicioNuevo = document.getElementById('img-inicio-input').files[0];
            let imgInicioFinal = archivoImgInicioNuevo ? archivoImgInicioNuevo : imgInicioEnEdicion;

            let archivoImgFinNuevo = document.getElementById('img-fin-input').files[0];
            let imgFinFinal = archivoImgFinNuevo ? archivoImgFinNuevo : imgFinEnEdicion;

            const nivelProcesado = {
                id: idNivel,
                titulo: titulo,
                dificultad: dificultad, 
                modo: modoJuego, 
                tiempo_limite: tiempoLimite,
                vidas: vidas,
                texto: texto,
                archivoAudio: audioFinal,
                esOficial: false,
                historiaInicio: historiaInicio,
                historiaFin: historiaFin,       
                imgInicio: imgInicioFinal,           
                imgFin: imgFinFinal,                
                animacionGolpe: animacionGolpe
            };

            try {
                if (idNivelEnEdicion) {
                    await window.TPTDatabase.actualizarNivel(nivelProcesado);
                } else {
                    await window.TPTDatabase.guardarNivel(nivelProcesado);
                }
                
                formCreador.reset(); 
                idNivelEnEdicion = null; 
                audioEnEdicion = null;
                imgInicioEnEdicion = null;
                imgFinEnEdicion = null;
                
                ['audio-nombre-archivo', 'img-inicio-nombre-archivo', 'img-fin-nombre-archivo'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });
                
                const creadorTitulo = document.querySelector('.creador-cabecera h2');
                if (creadorTitulo) creadorTitulo.textContent = "Estudio de Creación de Niveles";
                if (btnEliminarNivel) btnEliminarNivel.style.display = 'none';
                
                await cargarTarjetasDeNiveles(); 
                cambiarVista('menu');
            } catch (error) {
                console.error("Error al guardar nivel en BD:", error);
                alert("Hubo un problema al guardar el nivel.");
            }
        });
    }

    // Botón Eliminar Nivel (Dentro del creador para evitar accidentes)
    if (btnEliminarNivel) {
        btnEliminarNivel.addEventListener('click', async () => {
            if (!idNivelEnEdicion) return;
            const confirmado = confirm("¿Estás seguro de que deseas eliminar este nivel permanentemente? Esta acción no se puede deshacer.");
            if (confirmado) {
                try {
                    await window.TPTDatabase.eliminarNivel(idNivelEnEdicion);
                    formCreador.reset();
                    idNivelEnEdicion = null;
                    btnEliminarNivel.style.display = 'none';
                    await cargarTarjetasDeNiveles();
                    cambiarVista('menu');
                } catch (e) {
                    console.error("Error al eliminar nivel:", e);
                    alert("No se pudo eliminar el nivel.");
                }
            }
        });
    }

    const btnCancelarCreacion = document.getElementById('btn-cancelar-creacion');
    if (btnCancelarCreacion) {
        btnCancelarCreacion.addEventListener('click', () => {
            if (formCreador) formCreador.reset();
            idNivelEnEdicion = null;
            if (btnEliminarNivel) btnEliminarNivel.style.display = 'none';
            cambiarVista('menu');
        });
    }

    const btnCancelarCreacionTop = document.getElementById('btn-cancelar-creacion-top');
    if (btnCancelarCreacionTop) {
        btnCancelarCreacionTop.addEventListener('click', () => {
            if (formCreador) formCreador.reset();
            idNivelEnEdicion = null;
            if (btnEliminarNivel) btnEliminarNivel.style.display = 'none';
            cambiarVista('menu');
        });
    }

    // --- SELECTOR DE MODOS CON ICONOS (PRE-JUEGO) ---
    const btnModOriginal = document.getElementById('btn-mod-original');
    const btnModTiempo = document.getElementById('btn-mod-tiempo');
    const btnModVidas = document.getElementById('btn-mod-vidas');
    const btnModViaje = document.getElementById('btn-mod-viaje');
    const descModoActivo = document.getElementById('mod-descripcion-activa');
    const contTiempo = document.getElementById('contenedor-jugador-tiempo');
    const inputTiempo = document.getElementById('jugador-tiempo-input');

    function actualizarModosUI() {
        if (!nivelSeleccionado) return;

        if (modViajeActivo) {
            modoCalculado = 'viaje';
        } else if (modTiempoActivo && modVidasActivo) {
            modoCalculado = 'dificil';
        } else if (modVidasActivo) {
            modoCalculado = 'vital';
        } else if (modTiempoActivo) {
            modoCalculado = 'normal';
        } else {
            modoCalculado = 'viaje';
        }

        if (btnModOriginal) btnModOriginal.classList.toggle('activo', modOriginalActivo);
        if (btnModTiempo) btnModTiempo.classList.toggle('activo', modTiempoActivo);
        if (btnModVidas) btnModVidas.classList.toggle('activo', modVidasActivo);
        if (btnModViaje) btnModViaje.classList.toggle('activo', modViajeActivo);

        if (contTiempo) {
            contTiempo.style.display = modTiempoActivo ? 'block' : 'none';
        }

        if (descModoActivo) {
            if (modOriginalActivo) {
                const modoBase = (nivelSeleccionado.modo || 'normal').toUpperCase();
                if (nivelSeleccionado.modo === 'viaje') {
                    descModoActivo.textContent = `Modo Original del Nivel: VIAJE (Relajado, sin límite de tiempo ni vidas)`;
                } else if (nivelSeleccionado.modo === 'vital') {
                    descModoActivo.textContent = `Modo Original del Nivel: VITAL (${nivelSeleccionado.vidas || 3} vidas)`;
                } else if (nivelSeleccionado.modo === 'dificil') {
                    descModoActivo.textContent = `Modo Original del Nivel: DIFÍCIL (${nivelSeleccionado.tiempo_limite || 45}s / ${nivelSeleccionado.vidas || 3} vidas)`;
                } else {
                    descModoActivo.textContent = `Modo Original del Nivel: CONTRARRELOJ (${nivelSeleccionado.tiempo_limite || 45}s)`;
                }
            } else if (modoCalculado === 'viaje') {
                descModoActivo.textContent = `Modo Viaje: Relajación total, sin límites de tiempo ni vidas.`;
            } else if (modoCalculado === 'vital') {
                descModoActivo.textContent = `Modo Vital: Sin límite de tiempo, pero pierdes si agotas tus vidas.`;
            } else if (modoCalculado === 'dificil') {
                descModoActivo.textContent = `Modo Difícil: Desafío estricto con tiempo y vidas activas.`;
            } else {
                descModoActivo.textContent = `Modo Contrarreloj: Completa el texto antes de que acabe el tiempo.`;
            }
        }
    }

    if (btnModOriginal) {
        btnModOriginal.addEventListener('click', () => {
            modOriginalActivo = true;
            configurarModosSegunNivel(nivelSeleccionado);
            actualizarModosUI();
        });
    }

    if (btnModTiempo) {
        btnModTiempo.addEventListener('click', () => {
            modOriginalActivo = false;
            modViajeActivo = false;
            modTiempoActivo = !modTiempoActivo;
            if (!modTiempoActivo && !modVidasActivo) {
                modViajeActivo = true;
            }
            actualizarModosUI();
        });
    }

    if (btnModVidas) {
        btnModVidas.addEventListener('click', () => {
            modOriginalActivo = false;
            modViajeActivo = false;
            modVidasActivo = !modVidasActivo;
            if (!modTiempoActivo && !modVidasActivo) {
                modViajeActivo = true;
            }
            actualizarModosUI();
        });
    }

    if (btnModViaje) {
        btnModViaje.addEventListener('click', () => {
            modOriginalActivo = false;
            modViajeActivo = true;
            modTiempoActivo = false;
            modVidasActivo = false;
            actualizarModosUI();
        });
    }

    function configurarModosSegunNivel(nivel) {
        const modo = nivel.modo || 'normal';
        if (modo === 'viaje') {
            modViajeActivo = true;
            modTiempoActivo = false;
            modVidasActivo = false;
        } else if (modo === 'vital') {
            modViajeActivo = false;
            modTiempoActivo = false;
            modVidasActivo = true;
        } else if (modo === 'dificil') {
            modViajeActivo = false;
            modTiempoActivo = true;
            modVidasActivo = true;
        } else {
            modViajeActivo = false;
            modTiempoActivo = true;
            modVidasActivo = false;
        }
        if (inputTiempo) inputTiempo.value = nivel.tiempo_limite || 45;
    }

    function prepararPantallaPreJuego(nivel) {
        document.getElementById('prejuego-titulo').textContent = nivel.titulo;
        
        const snippetEl = document.getElementById('prejuego-snippet');
        if (snippetEl) {
            snippetEl.textContent = `"${nivel.texto.substring(0, 110)}${nivel.texto.length > 110 ? '...' : ''}"`;
        }

        modOriginalActivo = true;
        configurarModosSegunNivel(nivel);
        actualizarModosUI();
    }

    const btnIniciarMotor = document.getElementById('btn-iniciar-motor');
    if (btnIniciarMotor) {
        btnIniciarMotor.addEventListener('click', () => {
            const tiempoElegido = parseInt(document.getElementById('jugador-tiempo-input').value) || 45;

            const configuracionPartida = {
                ...nivelSeleccionado,
                modo_activo: modoCalculado,
                tiempo_activo: tiempoElegido
            };

            mostrarNarrativa('inicio', configuracionPartida, () => {
                cambiarVista('juego');
                if (window.TPTengine) window.TPTengine.iniciar(configuracionPartida);
            });
        });
    }

    const btnCancelarPrejuego = document.getElementById('btn-cancelar-prejuego');
    if (btnCancelarPrejuego) {
        btnCancelarPrejuego.addEventListener('click', () => {
            cambiarVista('menu');
        });
    }

    // --- SISTEMA DE FILTROS, BÚSQUEDA Y PAGINACIÓN DE NIVELES ---
    let filtroTodasActivo = true;
    let dificultadesSeleccionadas = new Set();
    let textoBusquedaNivel = "";
    let paginaNivelesActual = 1;
    let totalPaginasNiveles = 1;
    const nivelesPorPagina = 6;

    function configurarBuscadorNiveles() {
        const inputBuscar = document.getElementById('input-buscar-nivel');
        const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
        if (!inputBuscar) return;

        inputBuscar.addEventListener('input', async (e) => {
            textoBusquedaNivel = e.target.value.toLowerCase().trim();
            if (btnLimpiar) {
                btnLimpiar.style.display = e.target.value.length > 0 ? 'inline-block' : 'none';
            }
            paginaNivelesActual = 1;
            await cargarTarjetasDeNiveles();
        });

        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', async () => {
                inputBuscar.value = '';
                textoBusquedaNivel = '';
                btnLimpiar.style.display = 'none';
                paginaNivelesActual = 1;
                await cargarTarjetasDeNiveles();
                inputBuscar.focus();
            });
        }
    }

    function configurarFiltrosDificultad() {
        const chips = document.querySelectorAll('.chip-filtro[data-dificultad]');
        const btnTodos = document.getElementById('btn-filtro-todos');

        function actualizarFiltrosUI() {
            if (btnTodos) {
                btnTodos.classList.toggle('activo', filtroTodasActivo);
            }
            chips.forEach(chip => {
                const dif = chip.getAttribute('data-dificultad');
                chip.classList.toggle('activo', !filtroTodasActivo && dificultadesSeleccionadas.has(dif));
            });
        }

        chips.forEach(chip => {
            chip.addEventListener('click', async () => {
                const dif = chip.getAttribute('data-dificultad');
                if (filtroTodasActivo) {
                    // Si estaba en "Todas", desactivar "Todas" y activar ÚNICAMENTE este chip
                    filtroTodasActivo = false;
                    dificultadesSeleccionadas.clear();
                    dificultadesSeleccionadas.add(dif);
                } else {
                    // Si ya había selección personalizada, alternar (toggle) este chip
                    if (dificultadesSeleccionadas.has(dif)) {
                        dificultadesSeleccionadas.delete(dif);
                        // Si se deseleccionan todos, volver automáticamente a "Todas"
                        if (dificultadesSeleccionadas.size === 0) {
                            filtroTodasActivo = true;
                        }
                    } else {
                        dificultadesSeleccionadas.add(dif);
                    }
                }
                actualizarFiltrosUI();
                paginaNivelesActual = 1;
                await cargarTarjetasDeNiveles();
            });
        });

        if (btnTodos) {
            btnTodos.addEventListener('click', async () => {
                filtroTodasActivo = true;
                dificultadesSeleccionadas.clear();
                actualizarFiltrosUI();
                paginaNivelesActual = 1;
                await cargarTarjetasDeNiveles();
            });
        }

        actualizarFiltrosUI();
    }

    function configurarPaginacionNiveles() {
        const btnFirst = document.getElementById('btn-niveles-first');
        const btnPrev = document.getElementById('btn-niveles-prev');
        const btnNext = document.getElementById('btn-niveles-next');
        const btnLast = document.getElementById('btn-niveles-last');

        if (btnFirst) {
            btnFirst.addEventListener('click', async () => {
                if (paginaNivelesActual > 1) {
                    paginaNivelesActual = 1;
                    await cargarTarjetasDeNiveles();
                }
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', async () => {
                if (paginaNivelesActual > 1) {
                    paginaNivelesActual--;
                    await cargarTarjetasDeNiveles();
                }
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', async () => {
                if (paginaNivelesActual < totalPaginasNiveles) {
                    paginaNivelesActual++;
                    await cargarTarjetasDeNiveles();
                }
            });
        }

        if (btnLast) {
            btnLast.addEventListener('click', async () => {
                if (paginaNivelesActual < totalPaginasNiveles) {
                    paginaNivelesActual = totalPaginasNiveles;
                    await cargarTarjetasDeNiveles();
                }
            });
        }
    }

    // --- CARGA DE TARJETAS DE NIVELES ---
    async function cargarTarjetasDeNiveles() {
        const contenedor = document.getElementById('contenedor-niveles');
        if (!contenedor) return;
        contenedor.innerHTML = ''; 
        
        try {
            const todosLosNiveles = await window.TPTDatabase.obtenerTodos();
            
            const nivelesFiltrados = todosLosNiveles.filter(nivel => {
                const dif = (nivel.dificultad || 'normal').toLowerCase();
                const pasaDificultad = filtroTodasActivo || dificultadesSeleccionadas.has(dif);
                if (!pasaDificultad) return false;
                if (!textoBusquedaNivel) return true;
                const tit = (nivel.titulo || '').toLowerCase();
                const txt = (nivel.texto || '').toLowerCase();
                return tit.includes(textoBusquedaNivel) || txt.includes(textoBusquedaNivel);
            });

            totalPaginasNiveles = Math.ceil(nivelesFiltrados.length / nivelesPorPagina) || 1;
            paginaNivelesActual = Math.min(Math.max(1, paginaNivelesActual), totalPaginasNiveles);

            const inicio = (paginaNivelesActual - 1) * nivelesPorPagina;
            const nivelesPagina = nivelesFiltrados.slice(inicio, inicio + nivelesPorPagina);

            if (nivelesPagina.length === 0) {
                const mensajeVacio = document.createElement('div');
                mensajeVacio.style.gridColumn = '1 / -1';
                mensajeVacio.style.textAlign = 'center';
                mensajeVacio.style.padding = '35px 20px';
                mensajeVacio.style.color = 'var(--texto-secundario)';
                mensajeVacio.innerHTML = `
                    <p style="font-size: 15px; margin-bottom: 12px;">No se encontraron niveles con los filtros o búsqueda actuales.</p>
                `;
                const btnReset = document.createElement('button');
                btnReset.type = 'button';
                btnReset.className = 'btn-secundario';
                btnReset.textContent = 'Restablecer Filtros y Búsqueda';
                btnReset.addEventListener('click', () => {
                    const inputBuscar = document.getElementById('input-buscar-nivel');
                    if (inputBuscar) {
                        inputBuscar.value = '';
                        textoBusquedaNivel = '';
                    }
                    const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
                    if (btnLimpiar) btnLimpiar.style.display = 'none';
                    const btnTodos = document.getElementById('btn-filtro-todos');
                    if (btnTodos) btnTodos.click();
                });
                mensajeVacio.appendChild(btnReset);
                contenedor.appendChild(mensajeVacio);
            } else {
                nivelesPagina.forEach(nivel => {
                    const tarjeta = document.createElement('article');
                    tarjeta.className = 'card-nivel';
                    
                    const headerBadges = document.createElement('div');
                    headerBadges.className = 'card-nivel-header';

                    if (nivel.esOficial) {
                        const bOficial = document.createElement('span');
                        bOficial.className = 'badge badge-oficial';
                        bOficial.textContent = 'DenkKraft';
                        headerBadges.appendChild(bOficial);
                    }

                    const bDif = document.createElement('span');
                    const difClase = nivel.dificultad === 'facil' ? 'badge-facil' : (nivel.dificultad === 'dificil' ? 'badge-dificil' : 'badge-normal');
                    bDif.className = `badge ${difClase}`;
                    bDif.textContent = (nivel.dificultad || 'Normal').toUpperCase();
                    headerBadges.appendChild(bDif);

                    if (nivel.archivoAudio) {
                        const bAudio = document.createElement('span');
                        bAudio.className = 'badge badge-audio';
                        bAudio.textContent = 'Audio';
                        headerBadges.appendChild(bAudio);
                    }

                    tarjeta.appendChild(headerBadges);

                    const titulo = document.createElement('h3');
                    titulo.textContent = nivel.titulo;
                    tarjeta.appendChild(titulo);
                    
                    const descripcion = document.createElement('p');
                    const textoPlano = nivel.texto.replace(/\s+/g, ' ');
                    descripcion.textContent = textoPlano.substring(0, 75) + (textoPlano.length > 75 ? '...' : '');
                    tarjeta.appendChild(descripcion);

                    const grupoBotones = document.createElement('div');
                    grupoBotones.style.display = 'flex';
                    grupoBotones.style.gap = '8px';
                    grupoBotones.style.marginTop = 'auto';

                    const btnJugar = document.createElement('button');
                    btnJugar.className = 'btn-jugar-nivel';
                    btnJugar.textContent = 'Jugar';
                    btnJugar.addEventListener('click', () => {
                        nivelSeleccionado = nivel;
                        prepararPantallaPreJuego(nivel);
                        cambiarVista('prejuego');
                    });
                    grupoBotones.appendChild(btnJugar);

                    if (!nivel.esOficial) {
                        const btnEditar = document.createElement('button');
                        btnEditar.className = 'btn-secundario';
                        btnEditar.textContent = 'Editar';
                        btnEditar.title = 'Editar o eliminar este nivel';
                        btnEditar.addEventListener('click', () => {
                            idNivelEnEdicion = nivel.id; 
                            audioEnEdicion = nivel.archivoAudio; 
                            imgInicioEnEdicion = nivel.imgInicio; 
                            imgFinEnEdicion = nivel.imgFin;       
                            
                            document.getElementById('titulo-input').value = nivel.titulo;
                            document.getElementById('texto-input').value = nivel.texto;
                            document.getElementById('dificultad-input').value = nivel.dificultad;
                            document.getElementById('modo-juego-input').value = nivel.modo;
                            document.getElementById('tiempo-input').value = nivel.tiempo_limite;
                            document.getElementById('vidas-input').value = nivel.vidas;
                            document.getElementById('historia-inicio-input').value = nivel.historiaInicio || "";
                            document.getElementById('historia-fin-input').value = nivel.historiaFin || "";
                            document.getElementById('animacion-golpe-input').checked = nivel.animacionGolpe || false;

                            actualizarCamposModoCreador();

                            const creadorTitulo = document.querySelector('.creador-cabecera h2');
                            if (creadorTitulo) creadorTitulo.textContent = `Editar: ${nivel.titulo}`;
                            if (btnEliminarNivel) btnEliminarNivel.style.display = 'inline-flex';

                            cambiarVista('creador');
                        });
                        grupoBotones.appendChild(btnEditar);

                        const btnExportar = document.createElement('button');
                        btnExportar.className = 'btn-secundario';
                        btnExportar.textContent = 'Exportar';
                        btnExportar.title = 'Exportar como archivo .json';
                        btnExportar.addEventListener('click', () => {
                            if (window.TPTlevelParser) {
                                window.TPTlevelParser.exportar(nivel);
                            }
                        });
                        grupoBotones.appendChild(btnExportar);
                    }

                    tarjeta.appendChild(grupoBotones);
                    contenedor.appendChild(tarjeta);
                });
            }

            // Actualizar paginador extendido de niveles
            const paginacionNiveles = document.getElementById('paginacion-niveles');
            const indicadorPagNiveles = document.getElementById('indicador-pag-niveles');
            const btnFirst = document.getElementById('btn-niveles-first');
            const btnPrev = document.getElementById('btn-niveles-prev');
            const btnNext = document.getElementById('btn-niveles-next');
            const btnLast = document.getElementById('btn-niveles-last');
            const contenedorNumeros = document.getElementById('paginacion-niveles-numeros');

            if (paginacionNiveles && indicadorPagNiveles) {
                if (totalPaginasNiveles > 1) {
                    paginacionNiveles.style.display = 'flex';
                    indicadorPagNiveles.textContent = `Página ${paginaNivelesActual} de ${totalPaginasNiveles} (${nivelesFiltrados.length} niv.)`;
                    
                    if (btnFirst) btnFirst.disabled = (paginaNivelesActual <= 1);
                    if (btnPrev) btnPrev.disabled = (paginaNivelesActual <= 1);
                    if (btnNext) btnNext.disabled = (paginaNivelesActual >= totalPaginasNiveles);
                    if (btnLast) btnLast.disabled = (paginaNivelesActual >= totalPaginasNiveles);

                    if (contenedorNumeros) {
                        contenedorNumeros.innerHTML = '';
                        const maxBotones = 5;
                        let inicioRango = Math.max(1, paginaNivelesActual - Math.floor(maxBotones / 2));
                        let finRango = Math.min(totalPaginasNiveles, inicioRango + maxBotones - 1);
                        if (finRango - inicioRango + 1 < maxBotones) {
                            inicioRango = Math.max(1, finRango - maxBotones + 1);
                        }

                        for (let i = inicioRango; i <= finRango; i++) {
                            const btnNum = document.createElement('button');
                            btnNum.type = 'button';
                            btnNum.className = `btn-pag-numero ${i === paginaNivelesActual ? 'activo' : ''}`;
                            btnNum.textContent = i;
                            btnNum.title = `Ir a la página ${i}`;
                            btnNum.addEventListener('click', async () => {
                                paginaNivelesActual = i;
                                await cargarTarjetasDeNiveles();
                            });
                            contenedorNumeros.appendChild(btnNum);
                        }
                    }
                } else {
                    paginacionNiveles.style.display = 'none';
                }
            }

        } catch (error) {
            console.error("Error al renderizar tarjetas de niveles:", error);
        }
    }

    // --- SISTEMA DEL MODAL DE AJUSTES GENERALES ---
    const modalAjustes = document.getElementById('modal-ajustes');
    const btnAbrirAjustes = document.getElementById('btn-abrir-ajustes');
    const btnCerrarAjustesX = document.getElementById('btn-cerrar-ajustes-x');
    const btnGuardarAjustes = document.getElementById('btn-guardar-ajustes');
    const btnToggleBgmMenu = document.getElementById('btn-toggle-bgm-menu');
    const sliderVolBgm = document.getElementById('slider-vol-bgm');
    const badgeVolBgm = document.getElementById('badge-vol-bgm');
    const rutaMusicaMenuTexto = document.getElementById('ruta-musica-menu-texto');
    const sliderVolNiveles = document.getElementById('slider-vol-niveles');
    const badgeVolNiveles = document.getElementById('badge-vol-niveles');
    const btnToggleSfxAjustes = document.getElementById('btn-toggle-sfx-ajustes');
    const sliderVolSfx = document.getElementById('slider-vol-sfx');
    const badgeVolSfx = document.getElementById('badge-vol-sfx');
    const btnToggleGuiaAjustes = document.getElementById('btn-toggle-guia-ajustes');

    function sincronizarAjustesModalUI() {
        if (btnToggleBgmMenu) {
            btnToggleBgmMenu.textContent = configApp.musicaMenuActiva ? 'Activada' : 'Desactivada';
            btnToggleBgmMenu.classList.toggle('activo', configApp.musicaMenuActiva);
        }
        if (sliderVolBgm) sliderVolBgm.value = configApp.volumenMenu;
        if (badgeVolBgm) badgeVolBgm.textContent = `${configApp.volumenMenu}%`;
        if (rutaMusicaMenuTexto) {
            rutaMusicaMenuTexto.textContent = RUTA_MUSICA_MENU || "Sin pista asignada (edita RUTA_MUSICA_MENU en js/TPTui.js)";
        }
        if (sliderVolNiveles) sliderVolNiveles.value = configApp.volumenNiveles;
        if (badgeVolNiveles) badgeVolNiveles.textContent = `${configApp.volumenNiveles}%`;
        if (btnToggleSfxAjustes) {
            btnToggleSfxAjustes.textContent = configApp.sfxActivo ? 'Activados' : 'Desactivados';
            btnToggleSfxAjustes.classList.toggle('activo', configApp.sfxActivo);
        }
        if (sliderVolSfx) sliderVolSfx.value = configApp.volumenSFX;
        if (badgeVolSfx) badgeVolSfx.textContent = `${configApp.volumenSFX}%`;
        if (btnToggleGuiaAjustes) {
            btnToggleGuiaAjustes.textContent = configApp.guiaTecladoActiva ? 'Activada' : 'Desactivada';
            btnToggleGuiaAjustes.classList.toggle('activo', configApp.guiaTecladoActiva);
        }
    }

    function configurarModalAjustes() {
        if (btnToggleBgmMenu) {
            btnToggleBgmMenu.addEventListener('click', () => {
                configApp.musicaMenuActiva = !configApp.musicaMenuActiva;
                guardarConfiguracion();
                sincronizarAjustesModalUI();
                actualizarQuickBgmUI();
                if (configApp.musicaMenuActiva) {
                    if (modalTienda && modalTienda.classList.contains('tienda-overlay-activo')) {
                        reproducirMusicaTienda();
                    } else {
                        reproducirMusicaMenu();
                    }
                } else {
                    pausarMusicaMenu();
                    pausarMusicaTienda();
                }
            });
        }

        if (sliderVolBgm) {
            sliderVolBgm.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 0;
                configApp.volumenMenu = val;
                if (badgeVolBgm) badgeVolBgm.textContent = `${val}%`;
                if (audioBgmMenu) audioBgmMenu.volume = val / 100;
                if (audioBgmTienda) audioBgmTienda.volume = val / 100;
                guardarConfiguracion();
            });
        }

        if (sliderVolNiveles) {
            sliderVolNiveles.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 0;
                configApp.volumenNiveles = val;
                if (badgeVolNiveles) badgeVolNiveles.textContent = `${val}%`;
                guardarConfiguracion();
            });
        }

        if (btnToggleSfxAjustes) {
            btnToggleSfxAjustes.addEventListener('click', () => {
                configApp.sfxActivo = !configApp.sfxActivo;
                guardarConfiguracion();
                sincronizarAjustesModalUI();
            });
        }

        if (sliderVolSfx) {
            sliderVolSfx.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 0;
                configApp.volumenSFX = val;
                if (badgeVolSfx) badgeVolSfx.textContent = `${val}%`;
                guardarConfiguracion();
            });
        }

        if (btnToggleGuiaAjustes) {
            btnToggleGuiaAjustes.addEventListener('click', () => {
                configApp.guiaTecladoActiva = !configApp.guiaTecladoActiva;
                guardarConfiguracion();
                sincronizarAjustesModalUI();
            });
        }

        if (btnAbrirAjustes) {
            btnAbrirAjustes.addEventListener('click', () => {
                sincronizarAjustesModalUI();
                if (modalAjustes) modalAjustes.classList.remove('vista-oculta');
            });
        }

        if (btnCerrarAjustesX) {
            btnCerrarAjustesX.addEventListener('click', () => {
                guardarConfiguracion();
                if (modalAjustes) modalAjustes.classList.add('vista-oculta');
            });
        }

        if (btnGuardarAjustes) {
            btnGuardarAjustes.addEventListener('click', () => {
                guardarConfiguracion();
                if (modalAjustes) modalAjustes.classList.add('vista-oculta');
            });
        }
    }

    // --- MODAL GUÍA DE ATAJOS Y SIGNOS ---
    const modalGuiaAtajos = document.getElementById('modal-guia-atajos');
    const btnAbrirGuia = document.getElementById('btn-abrir-guia');
    const btnGuiaAtajosJuego = document.getElementById('btn-guia-atajos-juego');
    const btnCerrarGuia = document.getElementById('btn-cerrar-guia');
    const btnEntendidoGuia = document.getElementById('btn-entendido-guia');

    function abrirModalGuia() {
        if (modalGuiaAtajos) modalGuiaAtajos.classList.remove('vista-oculta');
    }

    function cerrarModalGuia() {
        if (modalGuiaAtajos) modalGuiaAtajos.classList.add('vista-oculta');
    }

    if (btnAbrirGuia) btnAbrirGuia.addEventListener('click', abrirModalGuia);
    if (btnGuiaAtajosJuego) btnGuiaAtajosJuego.addEventListener('click', abrirModalGuia);
    if (btnCerrarGuia) btnCerrarGuia.addEventListener('click', cerrarModalGuia);
    if (btnEntendidoGuia) btnEntendidoGuia.addEventListener('click', cerrarModalGuia);

    // --- BOTONES GENERALES DE MENÚ ---
    const btnVolverLanding = document.getElementById('btn-volver-landing');
    if (btnVolverLanding) btnVolverLanding.addEventListener('click', () => cambiarVista('landing'));

    const btnIrCreador = document.getElementById('btn-ir-creador');
    if (btnIrCreador) {
        btnIrCreador.addEventListener('click', () => {
            idNivelEnEdicion = null;
            if (formCreador) formCreador.reset();
            if (btnEliminarNivel) btnEliminarNivel.style.display = 'none';
            actualizarCamposModoCreador();
            const creadorTitulo = document.querySelector('.creador-cabecera h2');
            if (creadorTitulo) creadorTitulo.textContent = "Estudio de Creación de Niveles";
            cambiarVista('creador');
        });
    }

    // --- CONTROLES Y CONTROLADOR DE LA TIENDA (ESTILO RPG / DELTARUNE) ---
    const CATALOGO_TIENDA = {
        mascotas: [
            {
                id: 'gato',
                tipo: 'mascota',
                nombre: 'Gato Bongo',
                precio: 0,
                desc: 'Un simpático felino que toca los bongós rítmicamente al compás de cada tecla que pulses.',
                mascotaClase: 'mascota-gato'
            },
            {
                id: 'perro',
                tipo: 'mascota',
                nombre: 'Perro Guardián',
                precio: 150,
                desc: 'Un leal can con auriculares gamer que supervisa tu ritmo y celebra tus mejores rachas.',
                mascotaClase: 'mascota-perro'
            },
            {
                id: 'mapache',
                tipo: 'mascota',
                nombre: 'Mapache Cósmico',
                precio: 200,
                desc: 'Un audaz mapache con visor holográfico proveniente de lejanas galaxias de mecanografía.',
                mascotaClase: 'mascota-mapache'
            }
        ],
        temas: [
            {
                id: 'claro',
                tipo: 'tema',
                nombre: 'Día (Clásico)',
                precio: 0,
                desc: 'La paleta original de Tippen Tag: contrastes balanceados, interfaz pulcra y máxima legibilidad.',
                colorFondo: '#f8fafc',
                colorAcento: '#2563eb'
            },
            {
                id: 'oscuro',
                tipo: 'tema',
                nombre: 'Noche Arcade',
                precio: 50,
                desc: 'Ambiente nocturno con tonos violetas y acentos neón diseñado para proteger la vista en sesiones largas.',
                colorFondo: '#0b1120',
                colorAcento: '#7c3aed'
            },
            {
                id: 'espacio',
                tipo: 'tema',
                nombre: 'Espacio Cósmico',
                precio: 100,
                desc: 'Inmersión interestelar profunda con estrellas púrpuras, contrastes vibrantes y estilo futurista.',
                colorFondo: '#09081a',
                colorAcento: '#ec4899'
            }
        ]
    };

    let categoriaTiendaActiva = 'mascotas';
    let itemTiendaSeleccionado = null;

    const modalTienda = document.getElementById('modal-tienda');
    const btnAbrirTienda = document.getElementById('btn-abrir-tienda');
    const btnCerrarTienda = document.getElementById('btn-cerrar-tienda');
    const btnTiendaSalir = document.getElementById('btn-tienda-salir');
    const tabTiendaMascotas = document.getElementById('tab-tienda-mascotas');
    const tabTiendaTemas = document.getElementById('tab-tienda-temas');
    const listaItemsTienda = document.getElementById('tienda-lista-items');
    const previewVisual = document.getElementById('tienda-preview-visual');
    const previewTitulo = document.getElementById('tienda-preview-titulo');
    const previewTipo = document.getElementById('tienda-preview-tipo');
    const previewDesc = document.getElementById('tienda-preview-desc');
    const previewPrecio = document.getElementById('tienda-preview-precio');
    const btnAccionPreview = document.getElementById('btn-tienda-accion-preview');

    function abrirTienda() {
        if (!modalTienda) return;
        actualizarPuntosTienda();
        modalTienda.classList.remove('tienda-overlay-oculto');
        modalTienda.classList.add('tienda-overlay-activo');

        // Transición musical: Pausar música del menú y reproducir música de la tienda
        pausarMusicaMenu();
        reproducirMusicaTienda();

        renderizarCatalogoTienda();
    }

    function cerrarTienda() {
        if (!modalTienda) return;
        modalTienda.classList.remove('tienda-overlay-activo');
        modalTienda.classList.add('tienda-overlay-oculto');

        // Transición musical: Pausar música de la tienda y restaurar música del menú
        pausarMusicaTienda();
        if (configApp.musicaMenuActiva) {
            reproducirMusicaMenu();
        }
    }

    function renderizarCatalogoTienda() {
        if (!listaItemsTienda || !usuarioActivo) return;
        listaItemsTienda.innerHTML = '';

        const items = CATALOGO_TIENDA[categoriaTiendaActiva] || [];
        const inventario = usuarioActivo.inventario || ['tema_claro', 'mascota_gato'];

        // Si no hay item seleccionado o pertenece a la otra categoría, seleccionar el equipado de esta
        const pertenece = items.find(it => itemTiendaSeleccionado && it.id === itemTiendaSeleccionado.id && it.tipo === itemTiendaSeleccionado.tipo);
        if (!pertenece) {
            const equipadoId = categoriaTiendaActiva === 'mascotas' ? (usuarioActivo.mascotaEquipada || 'gato') : (usuarioActivo.temaEquipado || 'claro');
            itemTiendaSeleccionado = items.find(it => it.id === equipadoId) || items[0];
        }

        items.forEach(item => {
            const itemKey = `${item.tipo}_${item.id}`;
            const yaComprado = item.precio === 0 || inventario.includes(itemKey);
            const estaEquipado = (item.tipo === 'mascota' && (usuarioActivo.mascotaEquipada || 'gato') === item.id) ||
                                (item.tipo === 'tema' && (usuarioActivo.temaEquipado || 'claro') === item.id);
            const esSeleccionado = itemTiendaSeleccionado && itemTiendaSeleccionado.id === item.id && itemTiendaSeleccionado.tipo === item.tipo;

            const fila = document.createElement('div');
            fila.className = `tienda-item-fila ${esSeleccionado ? 'item-seleccionado' : ''}`;
            
            let estadoTexto = '';
            let estadoClase = 'tienda-item-estado';
            if (estaEquipado) {
                estadoTexto = 'Equipado';
                estadoClase += ' estado-equipado';
            } else if (yaComprado) {
                estadoTexto = 'Adquirido';
            } else {
                estadoTexto = `${item.precio} pts`;
            }

            fila.innerHTML = `
                <div class="tienda-item-info">
                    <span class="tienda-item-nombre">${item.nombre}</span>
                    <span class="tienda-item-precio">${item.precio === 0 ? 'Gratuito' : (item.precio + ' pts')}</span>
                </div>
                <span class="${estadoClase}">${estadoTexto}</span>
            `;

            fila.addEventListener('click', () => {
                mostrarPreviewItemTienda(item);
            });

            listaItemsTienda.appendChild(fila);
        });

        if (itemTiendaSeleccionado) {
            mostrarPreviewItemTienda(itemTiendaSeleccionado, false);
        }
    }

    function mostrarPreviewItemTienda(item, reRenderizarLista = true) {
        if (!item || !usuarioActivo) return;
        itemTiendaSeleccionado = item;

        if (reRenderizarLista && listaItemsTienda) {
            const filas = listaItemsTienda.querySelectorAll('.tienda-item-fila');
            const items = CATALOGO_TIENDA[categoriaTiendaActiva] || [];
            filas.forEach((fila, idx) => {
                const it = items[idx];
                if (it && it.id === item.id && it.tipo === item.tipo) {
                    fila.classList.add('item-seleccionado');
                } else {
                    fila.classList.remove('item-seleccionado');
                }
            });
        }

        if (previewTitulo) previewTitulo.textContent = item.nombre;
        if (previewTipo) {
            previewTipo.textContent = item.tipo === 'mascota' ? 'Mascota Compañera' : 'Tema Visual';
            previewTipo.className = item.tipo === 'mascota' ? 'badge badge-oficial' : 'badge badge-facil';
        }
        if (previewDesc) previewDesc.textContent = item.desc;
        if (previewPrecio) {
            previewPrecio.textContent = item.precio === 0 ? 'Gratis' : `${item.precio} pts`;
        }

        if (previewVisual) {
            previewVisual.innerHTML = '';
            if (item.tipo === 'mascota') {
                const mascotaDiv = document.createElement('div');
                mascotaDiv.className = `mascota-img tienda-preview-mascota ${item.mascotaClase}`;
                previewVisual.appendChild(mascotaDiv);
            } else {
                const swatchCard = document.createElement('div');
                swatchCard.className = 'tienda-preview-tema-tarjeta';
                swatchCard.style.backgroundColor = item.colorFondo;
                swatchCard.style.borderColor = item.colorAcento;
                swatchCard.innerHTML = `
                    <span class="swatch-titulo" style="color: ${item.id === 'claro' ? '#0f172a' : '#ffffff'};">${item.nombre}</span>
                    <div class="swatch-barras">
                        <div class="swatch-barra" style="background: ${item.colorAcento};"></div>
                        <div class="swatch-barra" style="background: ${item.id === 'claro' ? '#94a3b8' : '#334155'};"></div>
                        <div class="swatch-barra" style="background: #10b981;"></div>
                    </div>
                `;
                previewVisual.appendChild(swatchCard);
            }
        }

        if (btnAccionPreview) {
            const inventario = usuarioActivo.inventario || ['tema_claro', 'mascota_gato'];
            const itemKey = `${item.tipo}_${item.id}`;
            const yaComprado = item.precio === 0 || inventario.includes(itemKey);
            const estaEquipado = (item.tipo === 'mascota' && (usuarioActivo.mascotaEquipada || 'gato') === item.id) ||
                                (item.tipo === 'tema' && (usuarioActivo.temaEquipado || 'claro') === item.id);

            if (estaEquipado) {
                btnAccionPreview.textContent = 'Equipado';
                btnAccionPreview.className = 'btn-primario btn-tienda-accion';
                btnAccionPreview.style.background = 'rgba(16, 185, 129, 0.2)';
                btnAccionPreview.style.borderColor = 'var(--verde-exito)';
                btnAccionPreview.style.color = 'var(--verde-exito)';
                btnAccionPreview.disabled = true;
            } else if (yaComprado) {
                btnAccionPreview.textContent = 'Equipar';
                btnAccionPreview.className = 'btn-primario btn-tienda-accion';
                btnAccionPreview.style.background = 'var(--azul)';
                btnAccionPreview.style.borderColor = 'var(--azul)';
                btnAccionPreview.style.color = '#ffffff';
                btnAccionPreview.disabled = false;
            } else {
                btnAccionPreview.textContent = `Comprar (${item.precio} pts)`;
                btnAccionPreview.className = 'btn-primario btn-tienda-accion';
                btnAccionPreview.style.background = 'var(--morado)';
                btnAccionPreview.style.borderColor = 'var(--morado)';
                btnAccionPreview.style.color = '#ffffff';
                btnAccionPreview.disabled = false;
            }
        }
    }

    if (btnAccionPreview) {
        btnAccionPreview.addEventListener('click', async () => {
            if (!usuarioActivo || !itemTiendaSeleccionado) return;
            const item = itemTiendaSeleccionado;
            const itemKey = `${item.tipo}_${item.id}`;
            usuarioActivo.inventario = usuarioActivo.inventario || ['tema_claro', 'mascota_gato'];

            const yaComprado = item.precio === 0 || usuarioActivo.inventario.includes(itemKey);

            if (yaComprado) {
                if (item.tipo === 'tema') usuarioActivo.temaEquipado = item.id;
                if (item.tipo === 'mascota') usuarioActivo.mascotaEquipada = item.id;
                await window.TPTDatabase.guardarUsuario(usuarioActivo);
                aplicarCosmetico(item.tipo, item.id);
                actualizarPuntosTienda();
                renderizarCatalogoTienda();
            } else if (usuarioActivo.puntos >= item.precio) {
                usuarioActivo.puntos -= item.precio;
                usuarioActivo.inventario.push(itemKey);
                if (item.tipo === 'tema') usuarioActivo.temaEquipado = item.id;
                if (item.tipo === 'mascota') usuarioActivo.mascotaEquipada = item.id;
                await window.TPTDatabase.guardarUsuario(usuarioActivo);
                aplicarCosmetico(item.tipo, item.id);
                actualizarPuntosTienda();
                actualizarInfoUsuarioMenu();
                renderizarCatalogoTienda();
            } else {
                alert(`Te faltan ${item.precio - usuarioActivo.puntos} puntos para desbloquear esto.`);
            }
        });
    }

    if (tabTiendaMascotas) {
        tabTiendaMascotas.addEventListener('click', () => {
            categoriaTiendaActiva = 'mascotas';
            tabTiendaMascotas.classList.add('activo');
            tabTiendaMascotas.setAttribute('aria-selected', 'true');
            if (tabTiendaTemas) {
                tabTiendaTemas.classList.remove('activo');
                tabTiendaTemas.setAttribute('aria-selected', 'false');
            }
            renderizarCatalogoTienda();
        });
    }

    if (tabTiendaTemas) {
        tabTiendaTemas.addEventListener('click', () => {
            categoriaTiendaActiva = 'temas';
            tabTiendaTemas.classList.add('activo');
            tabTiendaTemas.setAttribute('aria-selected', 'true');
            if (tabTiendaMascotas) {
                tabTiendaMascotas.classList.remove('activo');
                tabTiendaMascotas.setAttribute('aria-selected', 'false');
            }
            renderizarCatalogoTienda();
        });
    }

    if (btnAbrirTienda) btnAbrirTienda.addEventListener('click', abrirTienda);
    if (btnCerrarTienda) btnCerrarTienda.addEventListener('click', cerrarTienda);
    if (btnTiendaSalir) btnTiendaSalir.addEventListener('click', cerrarTienda);

    if (modalTienda) {
        modalTienda.addEventListener('click', (e) => {
            if (e.target === modalTienda) {
                cerrarTienda();
            }
        });
    }

    // --- ABANDONAR JUEGO ---
    const btnAbandonarJuego = document.getElementById('btn-abandonar-juego');
    if (btnAbandonarJuego) {
        btnAbandonarJuego.addEventListener('click', () => {
            if (window.TPTengine) window.TPTengine.detener();
            cambiarVista('menu');
            const inputCaptura = document.getElementById('input-captura');
            if (inputCaptura) inputCaptura.blur();
        });
    }

    // --- NARRATIVA Y CINEMÁTICA MOMOYE ---
    function mostrarNarrativa(fase, nivelConfigurado, callback) {
        const textoCrudo = fase === 'inicio' ? nivelConfigurado.historiaInicio : nivelConfigurado.historiaFin;
        const imagenBlob = fase === 'inicio' ? nivelConfigurado.imgInicio : nivelConfigurado.imgFin;
        const escenario = document.getElementById('narrativa-escenario');
        const btnContinuar = document.getElementById('btn-continuar-narrativa');
        const btnSaltar = document.getElementById('btn-saltar-narrativa');
        const textoDisplay = document.getElementById('narrativa-texto');
        const hablanteDisplay = document.getElementById('narrativa-hablante');
        
        if (!textoCrudo && !(fase === 'fin' && nivelConfigurado.animacionGolpe)) {
            callback();
            return;
        }

        let fragmentos = [];
        if (textoCrudo) {
            fragmentos = textoCrudo.split('|').map(t => t.trim()).filter(t => t.length > 0);
        }
        
        if (fragmentos.length === 0 && fase === 'fin' && nivelConfigurado.animacionGolpe) {
            fragmentos.push("¡El Momoye ha sido acorralado!"); 
        }

        let indiceFragmento = 0;

        function finalizarNarrativa() {
            btnContinuar.onclick = null;
            if (btnSaltar) btnSaltar.onclick = null;
            callback();
        }

        if (btnSaltar) {
            btnSaltar.onclick = finalizarNarrativa;
        }

        function mostrarFragmentoActual() {
            const fragmento = fragmentos[indiceFragmento] || "";
            textoDisplay.textContent = fragmento;

            if (hablanteDisplay) {
                if (fragmento.toLowerCase().includes('momoye') || fragmento.includes('Tututuku')) {
                    hablanteDisplay.textContent = 'Momoye el Ladrón de Textos';
                } else if (fase === 'fin') {
                    hablanteDisplay.textContent = 'Victoria';
                } else {
                    hablanteDisplay.textContent = 'Misión';
                }
            }
            
            escenario.innerHTML = ''; 
            escenario.style.backgroundImage = 'none';

            const esUltimoFragmento = (indiceFragmento === fragmentos.length - 1);

            if (fase === 'fin' && nivelConfigurado.animacionGolpe && esUltimoFragmento) {
                const mascotaClase = usuarioActivo && usuarioActivo.mascotaEquipada ? usuarioActivo.mascotaEquipada : 'gato';
                escenario.innerHTML = `
                    <div class="escena-pelea">
                        <div id="anim-mascota" class="actor-mascota mascota-${mascotaClase}"></div>
                        <div class="vs-indicador">VS</div>
                        <div id="anim-momoye" class="actor-momoye"></div>
                    </div>
                `;
                
                if (imagenBlob) {
                    const urlImagen = typeof imagenBlob === 'string' ? imagenBlob : URL.createObjectURL(imagenBlob);
                    const momoyeEl = document.getElementById('anim-momoye');
                    if (momoyeEl) momoyeEl.style.backgroundImage = `url(${urlImagen})`;
                }
                
                setTimeout(() => {
                    const atacante = document.getElementById('anim-mascota');
                    const objetivo = document.getElementById('anim-momoye');
                    if (atacante && objetivo) {
                        atacante.classList.add('atacar');
                        setTimeout(() => objetivo.classList.add('recibir-golpe'), 220);
                    }
                }, 400);

            } else if (imagenBlob) {
                let urlImagen;
                
                // Si el nivel pide la mascota actual, buscamos cuál está equipada
                if (imagenBlob === 'mascota') {
                    const mascotaId = (usuarioActivo && usuarioActivo.mascotaEquipada) ? usuarioActivo.mascotaEquipada : 'gato';
                    
                    // Mapeo de IDs de la tienda a sus respectivas imágenes base
                    const rutasMascotas = {
                        'gato': 'assets/img/bongocat1.png',
                        'perro': 'assets/img/bongodog1.png',
                        'mapache': 'assets/img/mapache1.png'
                    };
                    
                    urlImagen = rutasMascotas[mascotaId] || rutasMascotas['gato'];
                } else {
                    // Comportamiento normal para imágenes subidas o rutas estáticas
                    urlImagen = typeof imagenBlob === 'string' ? imagenBlob : URL.createObjectURL(imagenBlob);
                }
                
                escenario.style.backgroundImage = `url(${urlImagen})`;
            }
        }

        mostrarFragmentoActual();
        cambiarVista('narrativa');

        btnContinuar.onclick = () => {
            indiceFragmento++;
            if (indiceFragmento < fragmentos.length) {
                mostrarFragmentoActual();
            } else {
                finalizarNarrativa();
            }
        };
    }

    // Exposición de métodos para el motor y contexto global
    window.TPTui = { 
        cambiarVista: cambiarVista,
        sumarPuntos: sumarPuntos,
        mostrarNarrativa: mostrarNarrativa
    };

    window.TPTDatabase.abrir().then(() => {
        iniciarConsejosRotativos();
        configurarBuscadorNiveles();
        configurarFiltrosDificultad();
        configurarPaginacionNiveles();
        configurarModalAjustes();
        cargarPerfiles();
        if (configApp.musicaMenuActiva) {
            reproducirMusicaMenu();
        }
    });
});