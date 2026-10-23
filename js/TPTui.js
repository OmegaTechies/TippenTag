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
        guiaTecladoActiva: true,
        escalaTexto: 100,      // 90 a 170 (%)
        idioma: 'es'           // 'es' | 'de'
    };

    let configApp = { ...CONFIG_PREDETERMINADA };

    function aplicarEscalaTexto(porcentaje) {
        const p = Math.max(90, Math.min(170, parseInt(porcentaje, 10) || 100));
        configApp.escalaTexto = p;
        document.documentElement.style.setProperty('--escala-texto', (p / 100).toString());
        
        const badge = document.getElementById('badge-escala-texto');
        if (badge) badge.textContent = `${p}%`;
        
        const slider = document.getElementById('slider-escala-texto');
        if (slider && parseInt(slider.value, 10) !== p) slider.value = p;
    }

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
        aplicarEscalaTexto(configApp.escalaTexto || 100);
        if (window.TPTi18n) {
            const idiomaGuardado = localStorage.getItem('tippen_tag_lang') || configApp.idioma || 'es';
            window.TPTi18n.setLanguage(idiomaGuardado);
            configApp.idioma = idiomaGuardado;
        }
    }

    function guardarConfiguracion() {
        try {
            localStorage.setItem('tippen_tag_config', JSON.stringify(configApp));
        } catch (e) {}
        window.TPTConfig = configApp;
    }

    cargarConfiguracion();

    // ==========================================================================
    // MODAL DE DIÁLOGO / ALERTAS NATIVAS DEL JUEGO (REEMPLAZO DE ALERT / CONFIRM)
    // ==========================================================================
    const modalDialogo = document.getElementById('modal-dialogo');
    const dialogoTitulo = document.getElementById('dialogo-titulo');
    const dialogoMensaje = document.getElementById('dialogo-mensaje');
    const dialogoIconoCirculo = document.getElementById('dialogo-icono-circulo');
    const dialogoIconoTexto = document.getElementById('dialogo-icono-texto');
    const dialogoBtnAceptar = document.getElementById('dialogo-btn-aceptar');
    const dialogoBtnCancelar = document.getElementById('dialogo-btn-cancelar');

    let resolverDialogo = null;

    function mostrarAlerta(mensaje, titulo = "Tippen Tag", tipo = "info") {
        return new Promise((resolve) => {
            if (!modalDialogo) {
                alert(`${titulo}: ${mensaje}`);
                resolve(true);
                return;
            }

            if (dialogoTitulo) dialogoTitulo.textContent = titulo;
            if (dialogoMensaje) dialogoMensaje.textContent = mensaje;
            if (dialogoBtnCancelar) dialogoBtnCancelar.style.display = 'none';
            if (dialogoBtnAceptar) dialogoBtnAceptar.textContent = 'Aceptar';

            if (dialogoIconoCirculo && dialogoIconoTexto) {
                dialogoIconoCirculo.className = 'dialogo-icono-circulo';
                if (tipo === 'exito') {
                    dialogoIconoCirculo.classList.add('exito');
                    dialogoIconoTexto.textContent = '✓';
                } else if (tipo === 'alerta') {
                    dialogoIconoCirculo.classList.add('alerta');
                    dialogoIconoTexto.textContent = '⚠️';
                } else if (tipo === 'peligro' || tipo === 'error') {
                    dialogoIconoCirculo.classList.add('peligro');
                    dialogoIconoTexto.textContent = '✕';
                } else {
                    dialogoIconoTexto.textContent = 'ℹ️';
                }
            }

            resolverDialogo = resolve;
            modalDialogo.classList.remove('vista-oculta');
        });
    }

    function mostrarConfirmacion(mensaje, titulo = "¿Confirmar acción?", tipo = "peligro") {
        return new Promise((resolve) => {
            if (!modalDialogo) {
                const r = confirm(`${titulo}\n\n${mensaje}`);
                resolve(r);
                return;
            }

            if (dialogoTitulo) dialogoTitulo.textContent = titulo;
            if (dialogoMensaje) dialogoMensaje.textContent = mensaje;
            if (dialogoBtnCancelar) dialogoBtnCancelar.style.display = 'inline-block';
            if (dialogoBtnAceptar) dialogoBtnAceptar.textContent = 'Confirmar';

            if (dialogoIconoCirculo && dialogoIconoTexto) {
                dialogoIconoCirculo.className = 'dialogo-icono-circulo';
                if (tipo === 'peligro') {
                    dialogoIconoCirculo.classList.add('peligro');
                    dialogoIconoTexto.textContent = '🗑️';
                } else {
                    dialogoIconoCirculo.classList.add('alerta');
                    dialogoIconoTexto.textContent = '❓';
                }
            }

            resolverDialogo = resolve;
            modalDialogo.classList.remove('vista-oculta');
        });
    }

    if (dialogoBtnAceptar) {
        dialogoBtnAceptar.addEventListener('click', () => {
            if (modalDialogo) modalDialogo.classList.add('vista-oculta');
            if (resolverDialogo) {
                const fn = resolverDialogo;
                resolverDialogo = null;
                fn(true);
            }
        });
    }

    if (dialogoBtnCancelar) {
        dialogoBtnCancelar.addEventListener('click', () => {
            if (modalDialogo) modalDialogo.classList.add('vista-oculta');
            if (resolverDialogo) {
                const fn = resolverDialogo;
                resolverDialogo = null;
                fn(false);
            }
        });
    }

    // --- ELEMENTOS Y CONTROL DE MÚSICA DE FONDO (MENÚ Y TIENDA) ---
    const audioBgmMenu = document.getElementById('audio-bgm-menu');
    const audioBgmTienda = document.getElementById('audio-bgm-tienda');
    const btnQuickBgm = document.getElementById('btn-quick-bgm');
    const txtQuickBgm = document.getElementById('txt-quick-bgm');
    const btnLandingBgm = document.getElementById('btn-landing-bgm');
    const txtLandingBgm = document.getElementById('txt-landing-bgm');

    function actualizarQuickBgmUI() {
        const estadoStr = configApp.musicaMenuActiva 
            ? (window.TPTi18n ? window.TPTi18n.t('comun.on') : 'ON') 
            : (window.TPTi18n ? window.TPTi18n.t('comun.off') : 'OFF');
        const texto = window.TPTi18n 
            ? window.TPTi18n.t('topbar.musica', { estado: estadoStr })
            : (configApp.musicaMenuActiva ? 'Música: ON' : 'Música: OFF');
        if (txtQuickBgm) txtQuickBgm.textContent = texto;
        if (btnQuickBgm) btnQuickBgm.classList.toggle('activo', configApp.musicaMenuActiva);
        if (txtLandingBgm) txtLandingBgm.textContent = texto;
        if (btnLandingBgm) btnLandingBgm.classList.toggle('activo', configApp.musicaMenuActiva);
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

    function alternarMusicaGeneral() {
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
    }

    if (btnQuickBgm) btnQuickBgm.addEventListener('click', alternarMusicaGeneral);
    if (btnLandingBgm) btnLandingBgm.addEventListener('click', alternarMusicaGeneral);

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
            const unidad = window.TPTi18n ? window.TPTi18n.t('comun.puntos') : 'pts';
            display.textContent = `${(usuarioActivo.puntos || 0).toLocaleString('es-ES')} ${unidad}`;
        }
    }

    function actualizarInfoUsuarioMenu() {
        if (!usuarioActivo) return;
        const nombreDisplay = document.getElementById('menu-nombre-usuario');
        const puntosDisplay = document.getElementById('menu-puntos-usuario');
        const avatarDisplay = document.getElementById('menu-avatar-display');

        if (nombreDisplay) nombreDisplay.textContent = usuarioActivo.nombre;
        if (puntosDisplay) {
            const unidad = window.TPTi18n ? window.TPTi18n.t('comun.puntos') : 'pts';
            puntosDisplay.textContent = `${(usuarioActivo.puntos || 0).toLocaleString('es-ES')} ${unidad}`;
        }
        
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
            // Eliminar dinámicamente cualquier clase de tema previo (que inicie con 'tema-')
            const clasesTemaPrevias = Array.from(document.body.classList).filter(cls => cls.startsWith('tema-'));
            clasesTemaPrevias.forEach(cls => document.body.classList.remove(cls));
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

        clearInterval(intervaloConsejos);
        const listaActual = window.TPTi18n ? window.TPTi18n.obtenerConsejos() : consejosMecanografia;

        indicadoresEl.innerHTML = '';
        listaActual.forEach((_, idx) => {
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
            const arr = window.TPTi18n ? window.TPTi18n.obtenerConsejos() : consejosMecanografia;
            indiceConsejoActual = (idx >= 0 && idx < arr.length) ? idx : 0;
            textoEl.style.opacity = '0';
            setTimeout(() => {
                textoEl.textContent = arr[indiceConsejoActual];
                textoEl.style.opacity = '1';
                const puntos = indicadoresEl.querySelectorAll('.consejo-punto');
                puntos.forEach((p, i) => {
                    p.classList.toggle('activo', i === indiceConsejoActual);
                });
            }, 220);
        }

        function siguienteConsejo() {
            const arr = window.TPTi18n ? window.TPTi18n.obtenerConsejos() : consejosMecanografia;
            const siguiente = (indiceConsejoActual + 1) % arr.length;
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

    // --- IMPORTAR PERFIL DESDE CREAR USUARIO ---
    const btnImportarPerfilCrear = document.getElementById('btn-importar-perfil-crear');
    const inputArchivoPerfilCrear = document.getElementById('input-archivo-perfil-crear');
    if (btnImportarPerfilCrear && inputArchivoPerfilCrear) {
        btnImportarPerfilCrear.addEventListener('click', () => {
            inputArchivoPerfilCrear.value = '';
            inputArchivoPerfilCrear.click();
        });
        inputArchivoPerfilCrear.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) procesarArchivoPerfil(file, 'crear');
        });
    }

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

            let idNivel = idNivelEnEdicion ? idNivelEnEdicion : "lvl_" + Date.now();
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

            // Seguridad de Autoría y Detección de Modificación de Exámenes:
            let nivelOriginal = null;
            if (idNivelEnEdicion) {
                nivelOriginal = await window.TPTDatabase.obtenerNivelPorId(idNivelEnEdicion);
            }

            const autorActualId = usuarioActivo ? usuarioActivo.id : 'anonimo';
            const autorActualNombre = usuarioActivo ? usuarioActivo.nombre : 'Comunidad';

            const esMismoAutor = Boolean(nivelOriginal && nivelOriginal.autorId && nivelOriginal.autorId === autorActualId);
            const esNivelDeOtroAutor = Boolean(nivelOriginal && nivelOriginal.autorId && nivelOriginal.autorId !== autorActualId);

            let forkeado = false;
            // Si el usuario edita un nivel creado por otra persona (p. ej. un estudiante editando el examen del docente),
            // NO se le permite sobrescribir el examen del docente ni retener su ID original. Se ramifica con nuevo ID.
            if (idNivelEnEdicion && esNivelDeOtroAutor) {
                idNivel = "lvl_copia_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                forkeado = true;
            }

            const hashTexto = await generarHashTexto(texto);

            const nivelProcesado = {
                id: idNivel,
                autorId: forkeado ? autorActualId : (esMismoAutor ? nivelOriginal.autorId : autorActualId),
                autorNombre: forkeado ? autorActualNombre : (esMismoAutor ? nivelOriginal.autorNombre : autorActualNombre),
                hashTexto: hashTexto,
                caracteresTexto: texto.length,
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
                if (idNivelEnEdicion && !forkeado) {
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
                if (forkeado) {
                    mostrarAlerta(
                        `Has personalizado un nivel creado por "${nivelOriginal.autorNombre || 'otro autor'}". Para garantizar la seguridad académica y evitar trampas en exámenes, se guardó como una versión tuya con un nuevo ID (${idNivel}), preservando intacto el nivel original del docente.`,
                        "Nueva Versión Personal",
                        "alerta"
                    );
                } else {
                    mostrarAlerta("¡El nivel ha sido guardado exitosamente!", "Nivel Guardado", "exito");
                }
            } catch (error) {
                console.error("Error al guardar nivel en BD:", error);
                mostrarAlerta("Hubo un problema al guardar el nivel.", "Error al Guardar", "peligro");
            }
        });
    }

    // Botón Eliminar Nivel (Dentro del creador para evitar accidentes)
    if (btnEliminarNivel) {
        btnEliminarNivel.addEventListener('click', async () => {
            if (!idNivelEnEdicion) return;
            const confirmado = await mostrarConfirmacion(
                "¿Estás seguro de que deseas eliminar este nivel permanentemente? Esta acción no se puede deshacer.",
                "Eliminar Nivel",
                "peligro"
            );
            if (confirmado) {
                try {
                    await window.TPTDatabase.eliminarNivel(idNivelEnEdicion);
                    formCreador.reset();
                    idNivelEnEdicion = null;
                    btnEliminarNivel.style.display = 'none';
                    await cargarTarjetasDeNiveles();
                    cambiarVista('menu');
                    mostrarAlerta("El nivel ha sido eliminado con éxito.", "Nivel Eliminado", "exito");
                } catch (e) {
                    console.error("Error al eliminar nivel:", e);
                    mostrarAlerta("No se pudo eliminar el nivel.", "Error", "peligro");
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
                if (nivelSeleccionado.modo === 'viaje') {
                    descModoActivo.textContent = window.TPTi18n ? window.TPTi18n.t('modo.desc_original_viaje') : `Modo Original del Nivel: VIAJE (Relajado, sin límite de tiempo ni vidas)`;
                } else if (nivelSeleccionado.modo === 'vital') {
                    descModoActivo.textContent = window.TPTi18n 
                        ? window.TPTi18n.t('modo.desc_original_vital', { vidas: nivelSeleccionado.vidas || 3 }) 
                        : `Modo Original del Nivel: VITAL (${nivelSeleccionado.vidas || 3} vidas)`;
                } else if (nivelSeleccionado.modo === 'dificil') {
                    descModoActivo.textContent = window.TPTi18n 
                        ? window.TPTi18n.t('modo.desc_original_dificil', { tiempo: nivelSeleccionado.tiempo_limite || 45, vidas: nivelSeleccionado.vidas || 3 }) 
                        : `Modo Original del Nivel: DIFÍCIL (${nivelSeleccionado.tiempo_limite || 45}s / ${nivelSeleccionado.vidas || 3} vidas)`;
                } else {
                    descModoActivo.textContent = window.TPTi18n 
                        ? window.TPTi18n.t('modo.desc_original_tiempo', { tiempo: nivelSeleccionado.tiempo_limite || 45 }) 
                        : `Modo Original del Nivel: CONTRARRELOJ (${nivelSeleccionado.tiempo_limite || 45}s)`;
                }
            } else if (modoCalculado === 'viaje') {
                descModoActivo.textContent = window.TPTi18n ? window.TPTi18n.t('modo.desc_viaje') : `Modo Viaje: Relajación total, sin límites de tiempo ni vidas.`;
            } else if (modoCalculado === 'vital') {
                descModoActivo.textContent = window.TPTi18n ? window.TPTi18n.t('modo.desc_vital') : `Modo Vital: Sin límite de tiempo, pero pierdes si agotas tus vidas.`;
            } else if (modoCalculado === 'dificil') {
                descModoActivo.textContent = window.TPTi18n ? window.TPTi18n.t('modo.desc_dificil') : `Modo Difícil: Desafío estricto con tiempo y vidas activas.`;
            } else {
                descModoActivo.textContent = window.TPTi18n ? window.TPTi18n.t('modo.desc_tiempo') : `Modo Contrarreloj: Completa el texto antes de que acabe el tiempo.`;
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
                // Tier 1 (Juego Base): Solo lecciones oficiales DENKKRAFT
                if (window.TPTTiers && !window.TPTTiers.tieneAccesoCreador()) {
                    if (!nivel.esOficial) return false;
                }
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
                const msgSinNiveles = window.TPTi18n ? window.TPTi18n.t('menu.sin_niveles') : 'No se encontraron lecciones que coincidan con la búsqueda.';
                mensajeVacio.innerHTML = `
                    <p style="font-size: calc(15px * var(--escala-texto, 1)); margin-bottom: 12px;">${msgSinNiveles}</p>
                `;
                const btnReset = document.createElement('button');
                btnReset.type = 'button';
                btnReset.className = 'btn-secundario';
                btnReset.textContent = window.TPTi18n ? window.TPTi18n.t('menu.reset_filtros') : 'Restablecer Filtros y Búsqueda';
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
                        bOficial.textContent = window.TPTi18n ? window.TPTi18n.t('badge.oficial') : 'DenkKraft';
                        headerBadges.appendChild(bOficial);
                    } else if (nivel.autorNombre) {
                        const bAutor = document.createElement('span');
                        bAutor.className = 'badge badge-autor';
                        bAutor.textContent = nivel.autorNombre;
                        bAutor.title = window.TPTi18n 
                            ? window.TPTi18n.t('badge.creador_title', { autor: nivel.autorNombre, id: nivel.id })
                            : `Creador: ${nivel.autorNombre} (ID: ${nivel.id})`;
                        headerBadges.appendChild(bAutor);
                    } else {
                        const bComunidad = document.createElement('span');
                        bComunidad.className = 'badge badge-autor';
                        bComunidad.textContent = window.TPTi18n ? window.TPTi18n.t('badge.comunidad') : 'Comunidad';
                        headerBadges.appendChild(bComunidad);
                    }

                    const bDif = document.createElement('span');
                    const difClave = (nivel.dificultad || 'normal').toLowerCase();
                    const difClase = difClave === 'facil' ? 'badge-facil' : (difClave === 'dificil' ? 'badge-dificil' : 'badge-normal');
                    bDif.className = `badge ${difClase}`;
                    bDif.textContent = window.TPTi18n 
                        ? window.TPTi18n.t(`badge.${difClave}`) 
                        : (nivel.dificultad || 'Normal').toUpperCase();
                    headerBadges.appendChild(bDif);

                    if (nivel.archivoAudio) {
                        const bAudio = document.createElement('span');
                        bAudio.className = 'badge badge-audio';
                        bAudio.textContent = window.TPTi18n ? window.TPTi18n.t('badge.audio') : 'Audio';
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
                    btnJugar.textContent = window.TPTi18n ? window.TPTi18n.t('menu.card_jugar') : 'Jugar';
                    btnJugar.addEventListener('click', () => {
                        nivelSeleccionado = nivel;
                        prepararPantallaPreJuego(nivel);
                        cambiarVista('prejuego');
                    });
                    grupoBotones.appendChild(btnJugar);

                    if (!nivel.esOficial) {
                        const btnEditar = document.createElement('button');
                        btnEditar.className = 'btn-secundario';
                        btnEditar.textContent = window.TPTi18n ? window.TPTi18n.t('menu.card_editar') : 'Editar';
                        btnEditar.title = window.TPTi18n ? window.TPTi18n.t('menu.card_editar_title') : 'Editar o eliminar este nivel';
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

                            const lblAudio = document.getElementById('audio-nombre-archivo');
                            if (lblAudio) {
                                if (nivel.archivoAudio) {
                                    const nombreAudio = typeof nivel.archivoAudio === 'string' ? nivel.archivoAudio.split('/').pop() : (nivel.archivoAudio.name || 'Audio cargado');
                                    lblAudio.textContent = `Pista actual: ${nombreAudio}`;
                                    lblAudio.style.display = 'block';
                                } else {
                                    lblAudio.style.display = 'none';
                                }
                            }
                            const lblImgInicio = document.getElementById('img-inicio-nombre-archivo');
                            if (lblImgInicio) {
                                if (nivel.imgInicio) {
                                    const nombreImg = typeof nivel.imgInicio === 'string' ? nivel.imgInicio.split('/').pop() : (nivel.imgInicio.name || 'Imagen cargada');
                                    lblImgInicio.textContent = `Imagen actual: ${nombreImg}`;
                                    lblImgInicio.style.display = 'block';
                                } else {
                                    lblImgInicio.style.display = 'none';
                                }
                            }
                            const lblImgFin = document.getElementById('img-fin-nombre-archivo');
                            if (lblImgFin) {
                                if (nivel.imgFin) {
                                    const nombreImg = typeof nivel.imgFin === 'string' ? nivel.imgFin.split('/').pop() : (nivel.imgFin.name || 'Imagen cargada');
                                    lblImgFin.textContent = `Imagen actual: ${nombreImg}`;
                                    lblImgFin.style.display = 'block';
                                } else {
                                    lblImgFin.style.display = 'none';
                                }
                            }
                            const creadorTitulo = document.querySelector('.creador-cabecera h2');
                            if (creadorTitulo) creadorTitulo.textContent = `Editar: ${nivel.titulo}`;
                            if (btnEliminarNivel) btnEliminarNivel.style.display = 'inline-flex';

                            cambiarVista('creador');
                        });
                        grupoBotones.appendChild(btnEditar);

                        const btnExportar = document.createElement('button');
                        btnExportar.className = 'btn-secundario';
                        btnExportar.textContent = window.TPTi18n ? window.TPTi18n.t('menu.card_exportar') : 'Exportar';
                        btnExportar.title = window.TPTi18n ? window.TPTi18n.t('menu.card_exportar_title') : 'Exportar como archivo .json';
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
                    indicadorPagNiveles.textContent = window.TPTi18n
                        ? window.TPTi18n.t('menu.paginacion', { actual: paginaNivelesActual, total: totalPaginasNiveles, cant: nivelesFiltrados.length })
                        : `Página ${paginaNivelesActual} de ${totalPaginasNiveles} (${nivelesFiltrados.length} niv.)`;
                    
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
                            btnNum.title = window.TPTi18n ? window.TPTi18n.t('menu.ir_a_pagina', { num: i }) : `Ir a la página ${i}`;
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
        const txtActiva = window.TPTi18n ? window.TPTi18n.t('comun.activo') : 'Activada';
        const txtDesactiva = window.TPTi18n ? window.TPTi18n.t('comun.desactivado') : 'Desactivada';

        if (btnToggleBgmMenu) {
            btnToggleBgmMenu.textContent = configApp.musicaMenuActiva ? txtActiva : txtDesactiva;
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
            btnToggleSfxAjustes.textContent = configApp.sfxActivo ? txtActiva : txtDesactiva;
            btnToggleSfxAjustes.classList.toggle('activo', configApp.sfxActivo);
        }
        if (sliderVolSfx) sliderVolSfx.value = configApp.volumenSFX;
        if (badgeVolSfx) badgeVolSfx.textContent = `${configApp.volumenSFX}%`;
        if (btnToggleGuiaAjustes) {
            btnToggleGuiaAjustes.textContent = configApp.guiaTecladoActiva ? txtActiva : txtDesactiva;
            btnToggleGuiaAjustes.classList.toggle('activo', configApp.guiaTecladoActiva);
        }

        // Ajuste 6: Tamaño de Texto y Accesibilidad
        const sliderEscalaTexto = document.getElementById('slider-escala-texto');
        const badgeEscalaTexto = document.getElementById('badge-escala-texto');
        if (sliderEscalaTexto) sliderEscalaTexto.value = configApp.escalaTexto || 100;
        if (badgeEscalaTexto) badgeEscalaTexto.textContent = `${configApp.escalaTexto || 100}%`;

        // Ajuste 7: Idioma del Sistema
        const langAct = window.TPTi18n ? window.TPTi18n.getLanguage() : (configApp.idioma || 'es');
        const btnLangEs = document.getElementById('btn-lang-es');
        const btnLangDe = document.getElementById('btn-lang-de');
        if (btnLangEs) btnLangEs.classList.toggle('activo', langAct === 'es');
        if (btnLangDe) btnLangDe.classList.toggle('activo', langAct === 'de');

        // Ajuste 8: Estado de Exportación de Perfil Activo
        const btnExportarPerfilAjustes = document.getElementById('btn-exportar-perfil-ajustes');
        if (btnExportarPerfilAjustes) {
            if (usuarioActivo) {
                btnExportarPerfilAjustes.title = `Exportar respaldo seguro de ${usuarioActivo.nombre}`;
                btnExportarPerfilAjustes.style.opacity = '1';
            } else {
                btnExportarPerfilAjustes.title = window.TPTi18n ? window.TPTi18n.t('perfil.exportar_sin_usuario') : 'Selecciona un perfil primero';
                btnExportarPerfilAjustes.style.opacity = '0.65';
            }
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

        // --- CONTROLES DE TAMAÑO DE TEXTO Y ACCESIBILIDAD ---
        const sliderEscalaTexto = document.getElementById('slider-escala-texto');
        if (sliderEscalaTexto) {
            sliderEscalaTexto.addEventListener('input', (e) => {
                aplicarEscalaTexto(e.target.value);
                guardarConfiguracion();
            });
        }

        const btnEscalaMenos = document.getElementById('btn-escala-menos');
        if (btnEscalaMenos) {
            btnEscalaMenos.addEventListener('click', () => {
                aplicarEscalaTexto((configApp.escalaTexto || 100) - 10);
                guardarConfiguracion();
            });
        }

        const btnEscalaReset = document.getElementById('btn-escala-reset');
        if (btnEscalaReset) {
            btnEscalaReset.addEventListener('click', () => {
                aplicarEscalaTexto(100);
                guardarConfiguracion();
            });
        }

        const btnEscalaMas = document.getElementById('btn-escala-mas');
        if (btnEscalaMas) {
            btnEscalaMas.addEventListener('click', () => {
                aplicarEscalaTexto((configApp.escalaTexto || 100) + 10);
                guardarConfiguracion();
            });
        }

        // --- CONTROLES DE IDIOMA (SISTEMA BILINGÜE ES / DE) ---
        function cambiarIdioma(nuevoIdioma) {
            if (window.TPTi18n) {
                window.TPTi18n.setLanguage(nuevoIdioma);
                configApp.idioma = nuevoIdioma;
                guardarConfiguracion();
                sincronizarAjustesModalUI();
            }
        }

        const btnLangEs = document.getElementById('btn-lang-es');
        if (btnLangEs) {
            btnLangEs.addEventListener('click', () => cambiarIdioma('es'));
        }

        const btnLangDe = document.getElementById('btn-lang-de');
        if (btnLangDe) {
            btnLangDe.addEventListener('click', () => cambiarIdioma('de'));
        }

        const btnLandingLang = document.getElementById('btn-landing-lang');
        if (btnLandingLang) {
            btnLandingLang.addEventListener('click', () => {
                if (window.TPTi18n) {
                    window.TPTi18n.toggleLanguage();
                    configApp.idioma = window.TPTi18n.getLanguage();
                    guardarConfiguracion();
                    sincronizarAjustesModalUI();
                }
            });
        }

        const btnMenuLang = document.getElementById('btn-menu-lang');
        if (btnMenuLang) {
            btnMenuLang.addEventListener('click', () => {
                if (window.TPTi18n) {
                    window.TPTi18n.toggleLanguage();
                    configApp.idioma = window.TPTi18n.getLanguage();
                    guardarConfiguracion();
                    sincronizarAjustesModalUI();
                }
            });
        }

        window.addEventListener('tpt:languagechange', () => {
            actualizarQuickBgmUI();
            sincronizarAjustesModalUI();
            iniciarConsejosRotativos();
            if (typeof renderizarCatalogoTienda === 'function') renderizarCatalogoTienda();
            if (typeof cargarTarjetasDeNiveles === 'function') cargarTarjetasDeNiveles();
            if (typeof actualizarModosUI === 'function') actualizarModosUI();
        });

        if (btnAbrirAjustes) {
            btnAbrirAjustes.addEventListener('click', () => {
                sincronizarAjustesModalUI();
                if (modalAjustes) modalAjustes.classList.remove('vista-oculta');
            });
        }

        const btnLandingAjustes = document.getElementById('btn-landing-ajustes');
        if (btnLandingAjustes) {
            btnLandingAjustes.addEventListener('click', () => {
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

        const selectTierJuego = document.getElementById('select-tier-juego');
        if (selectTierJuego) {
            selectTierJuego.addEventListener('change', (e) => {
                const nuevoTier = parseInt(e.target.value, 10);
                if (window.TPTTiers) {
                    window.TPTTiers.establecerTier(nuevoTier);
                    mostrarAlerta(
                        `Se ha activado: ${window.TPTTiers.obtenerNombreTier(nuevoTier)}.\nLas opciones, niveles y restricciones del juego se han actualizado.`,
                        "Licencia / Tier Actualizado",
                        "exito"
                    );
                }
            });
        }

        // --- RESPALDO Y TRANSFERENCIA DE PERFILES EN AJUSTES ---
        const btnExportarPerfilAjustes = document.getElementById('btn-exportar-perfil-ajustes');
        const btnImportarPerfilAjustes = document.getElementById('btn-importar-perfil-ajustes');
        const inputArchivoPerfilAjustes = document.getElementById('input-archivo-perfil-ajustes');

        if (btnExportarPerfilAjustes) {
            btnExportarPerfilAjustes.addEventListener('click', () => {
                exportarPerfil(usuarioActivo);
            });
        }

        if (btnImportarPerfilAjustes && inputArchivoPerfilAjustes) {
            btnImportarPerfilAjustes.addEventListener('click', () => {
                inputArchivoPerfilAjustes.value = '';
                inputArchivoPerfilAjustes.click();
            });
            inputArchivoPerfilAjustes.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) procesarArchivoPerfil(file, 'ajustes');
            });
        }
    }

    // --- MODAL GUÍA DE ATAJOS Y SIGNOS ---
    const modalGuiaAtajos = document.getElementById('modal-guia-atajos');
    const btnAbrirGuia = document.getElementById('btn-abrir-guia');
    const btnGuiaAtajosJuego = document.getElementById('btn-guia-atajos-juego');
    const btnCerrarGuia = document.getElementById('btn-cerrar-guia');
    const btnCerrarGuiaAtajosX = document.getElementById('btn-cerrar-guia-atajos-x');
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
    if (btnCerrarGuiaAtajosX) btnCerrarGuiaAtajosX.addEventListener('click', cerrarModalGuia);
    if (btnEntendidoGuia) btnEntendidoGuia.addEventListener('click', cerrarModalGuia);

    // --- BOTONES GENERALES DE MENÚ ---
    const btnVolverLanding = document.getElementById('btn-volver-landing');
    if (btnVolverLanding) btnVolverLanding.addEventListener('click', () => cambiarVista('landing'));

    const btnIrCreador = document.getElementById('btn-ir-creador');
    if (btnIrCreador) {
        btnIrCreador.addEventListener('click', () => {
            if (window.TPTTiers && !window.TPTTiers.tieneAccesoCreador()) {
                mostrarAlerta(
                    "El Estudio de Creación de Niveles está disponible a partir de la Edición Creador (Tier 2). En el juego base solo puedes jugar las lecciones oficiales DENKKRAFT.",
                    "Función de Expansión (Tier 2)",
                    "alerta"
                );
                return;
            }
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
                nombre: 'Gato teclero',
                precio: 0,
                desc: 'Raza de gato especializada en apretar teclas, se acostumbra al ritmo de tecleo de su dueño.',
                mascotaClase: 'mascota-gato'
            },
            {
                id: 'perro',
                tipo: 'mascota',
                nombre: 'Perro gamer',
                precio: 2500,
                desc: 'Animal muy noble que te acompañará a escribir mientras escucha su canción favorita',
                mascotaClase: 'mascota-perro'
            },
            {
                id: 'mapache',
                tipo: 'mascota',
                nombre: 'Mapache con lentes',
                precio: 6000,
                desc: 'Un audaz mapache con problemas de visión pero muchas ganas de aprender.',
                mascotaClase: 'mascota-mapache'
            },
            {
                id: 'oso',
                tipo: 'mascota',
                nombre: 'Oso Entusiasta',
                precio: 10000,
                desc: 'Un alegre oso pardo con gorrita, sabe escribir muy rápido, aunque a veces falla, como todos, pero no se rinda en mejorar.',
                mascotaClase: 'mascota-oso'
            },
            {
                id: 'pastor',
                tipo: 'mascota',
                nombre: 'Pastor Alemán',
                precio: 30000,
                desc: 'Fiel guardián proveniente de europa, especializado en el pastoreo y ahora aprendiendo a usar un teclado para modernizarse.',
                mascotaClase: 'mascota-pastor'
            },
            {
                id: 'triplet',
                tipo: 'mascota',
                nombre: 'Tippen Tippen Tag',
                precio: 67676676,
                desc: 'El legendario trío mecanográfico sincronizado. Su velocidad legendaria desafía los límites del teclado.',
                mascotaClase: 'mascota-triplet'
            },
            {
                id: 'capibara',
                tipo: 'mascota',
                nombre: 'Chui el Chiwire',
                precio: 99999999,
                desc: 'Animal místico de la creación de Dios, amigo de todos, enemigo solo de sí mismo.',
                mascotaClase: 'mascota-capibara'
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
                precio: 1000,
                desc: 'Ambiente nocturno con tonos violetas y acentos neón diseñado para proteger la vista en sesiones largas.',
                colorFondo: '#0b1120',
                colorAcento: '#7c3aed'
            },
            {
                id: 'espacio',
                tipo: 'tema',
                nombre: 'Espacio Cósmico',
                precio: 2000,
                desc: 'Inmersión interestelar profunda con estrellas púrpuras, contrastes vibrantes y estilo futurista.',
                colorFondo: '#09081a',
                colorAcento: '#ec4899'
            },
            {
                id: 'cafe_otono',
                tipo: 'tema',
                nombre: 'Café de Otoño',
                precio: 3000,
                desc: 'Tonos cálidos, marrones y naranjas. Muy relajante a la vista para sesiones largas de lectura.',
                colorFondo: '#2c1e16',
                colorAcento: '#d35400'
            },
            {
                id: 'bosque',
                tipo: 'tema',
                nombre: 'Bosque Místico',
                precio: 3000,
                desc: 'Verdes tierra y esmeralda. Brinda una sensación de naturaleza y tranquilidad absoluta.',
                colorFondo: '#1b281b',
                colorAcento: '#4caf50'
            },
            {
                id: 'oceano',
                tipo: 'tema',
                nombre: 'Océano Profundo',
                precio: 3000,
                desc: 'Azules marinos con contrastes en verde azulado pastel. Sumérgete en la máxima concentración.',
                colorFondo: '#0a192f',
                colorAcento: '#64ffda'
            },
            {
                id: 'dracula',
                tipo: 'tema',
                nombre: 'Drácula',
                precio: 3000,
                desc: 'Un clásico legendario entre los desarrolladores. Tonos pastel vibrantes sobre un elegante fondo oscuro.',
                colorFondo: '#282a36',
                colorAcento: '#50fa7b'
            },
            {
                id: 'monocromo',
                tipo: 'tema',
                nombre: 'Monocromo',
                precio: 4000,
                desc: 'Minimalismo puro en blanco roto y grafito. Cero distracciones visuales para batir tus propios récords.',
                colorFondo: '#f5f5f5',
                colorAcento: '#121212'
            },
            {
                id: 'cyberpunk',
                tipo: 'tema',
                nombre: 'Cyberpunk Neón',
                precio: 4000,
                desc: 'Alta energía y velocidad. Neón cian brillante sobre un fondo oscuro para tecleadores extremos.',
                colorFondo: '#0d0e15',
                colorAcento: '#00ffcc'
            },
            {
                id: 'vaporwave',
                tipo: 'tema',
                nombre: 'Retro Vaporwave',
                precio: 4000,
                desc: 'Estética de los años 80. Morados profundos con acentos en lila y rosa neón brillante.',
                colorFondo: '#2b213a',
                colorAcento: '#ff79c6'
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
        document.body.classList.add('tienda-abierta');
        document.body.style.overflow = 'hidden';

        // Transición musical: Pausar música del menú y reproducir música de la tienda
        pausarMusicaMenu();
        reproducirMusicaTienda();

        renderizarCatalogoTienda();
    }

    function cerrarTienda() {
        if (!modalTienda) return;
        modalTienda.classList.remove('tienda-overlay-activo');
        modalTienda.classList.add('tienda-overlay-oculto');
        document.body.classList.remove('tienda-abierta');
        document.body.style.overflow = '';

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

            const meta = (item.tipo === 'mascota' && window.TPTi18n) 
                ? (window.TPTi18n.obtenerMetadatosMascota(item.id) || item)
                : ((item.tipo === 'tema' && window.TPTi18n) 
                    ? (window.TPTi18n.obtenerMetadatosTema(item.id) || item) 
                    : item);
            const nombreItem = meta.nombre || item.nombre;

            const fila = document.createElement('div');
            fila.className = `tienda-item-fila ${esSeleccionado ? 'item-seleccionado' : ''}`;
            
            let estadoTexto = '';
            let estadoClase = 'tienda-item-estado';
            if (estaEquipado) {
                estadoTexto = window.TPTi18n ? window.TPTi18n.t('tienda.equipado') : 'Equipado';
                estadoClase += ' estado-equipado';
            } else if (yaComprado) {
                estadoTexto = window.TPTi18n ? window.TPTi18n.t('tienda.adquirido') : 'Adquirido';
            } else {
                estadoTexto = `${item.precio.toLocaleString('es-ES')} ${window.TPTi18n ? window.TPTi18n.t('comun.puntos') : 'pts'}`;
            }

            const precioTexto = item.precio === 0 
                ? (window.TPTi18n ? window.TPTi18n.t('tienda.gratuito') : 'Gratuito') 
                : `${item.precio.toLocaleString('es-ES')} ${window.TPTi18n ? window.TPTi18n.t('comun.puntos') : 'pts'}`;

            fila.innerHTML = `
                <div class="tienda-item-info">
                    <span class="tienda-item-nombre">${nombreItem}</span>
                    <span class="tienda-item-precio">${precioTexto}</span>
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

        const meta = (item.tipo === 'mascota' && window.TPTi18n) 
            ? (window.TPTi18n.obtenerMetadatosMascota(item.id) || item)
            : ((item.tipo === 'tema' && window.TPTi18n) 
                ? (window.TPTi18n.obtenerMetadatosTema(item.id) || item) 
                : item);
        const nombreItem = meta.nombre || item.nombre;
        const descItem = meta.desc || item.desc;

        if (previewTitulo) previewTitulo.textContent = nombreItem;
        if (previewTipo) {
            previewTipo.textContent = item.tipo === 'mascota' 
                ? (window.TPTi18n ? window.TPTi18n.t('tienda.tipo_mascota') : 'Mascota Compañera') 
                : (window.TPTi18n ? window.TPTi18n.t('tienda.tipo_tema') : 'Tema Visual');
            previewTipo.className = item.tipo === 'mascota' ? 'badge badge-oficial' : 'badge badge-facil';
        }
        if (previewDesc) previewDesc.textContent = descItem;
        if (previewPrecio) {
            previewPrecio.textContent = item.precio === 0 
                ? (window.TPTi18n ? window.TPTi18n.t('tienda.gratis') : 'Gratis') 
                : `${item.precio.toLocaleString('es-ES')} ${window.TPTi18n ? window.TPTi18n.t('comun.puntos') : 'pts'}`;
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
                    <span class="swatch-titulo" style="color: ${item.id === 'claro' ? '#0f172a' : '#ffffff'};">${nombreItem}</span>
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
                btnAccionPreview.textContent = window.TPTi18n ? window.TPTi18n.t('tienda.equipado') : 'Equipado';
                btnAccionPreview.className = 'btn-primario btn-tienda-accion';
                btnAccionPreview.style.background = 'rgba(16, 185, 129, 0.2)';
                btnAccionPreview.style.borderColor = 'var(--verde-exito)';
                btnAccionPreview.style.color = 'var(--verde-exito)';
                btnAccionPreview.disabled = true;
            } else if (yaComprado) {
                btnAccionPreview.textContent = window.TPTi18n ? window.TPTi18n.t('tienda.equipar') : 'Equipar';
                btnAccionPreview.className = 'btn-primario btn-tienda-accion';
                btnAccionPreview.style.background = 'var(--azul)';
                btnAccionPreview.style.borderColor = 'var(--azul)';
                btnAccionPreview.style.color = '#ffffff';
                btnAccionPreview.disabled = false;
            } else {
                const txtComprar = window.TPTi18n 
                    ? window.TPTi18n.t('tienda.comprar', { precio: item.precio.toLocaleString('es-ES') }) 
                    : `Comprar (${item.precio.toLocaleString('es-ES')} pts)`;
                btnAccionPreview.textContent = txtComprar;
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
                actualizarInfoUsuarioMenu();
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
                const meta = (item.tipo === 'mascota' && window.TPTi18n) 
                    ? (window.TPTi18n.obtenerMetadatosMascota(item.id) || item)
                    : ((item.tipo === 'tema' && window.TPTi18n) 
                        ? (window.TPTi18n.obtenerMetadatosTema(item.id) || item) 
                        : item);
                const nombreItem = meta.nombre || item.nombre;
                const faltantes = item.precio - usuarioActivo.puntos;
                const msg = window.TPTi18n 
                    ? window.TPTi18n.t('tienda.falta_puntos', { faltantes: faltantes.toLocaleString('es-ES'), nombre: nombreItem })
                    : `Te faltan ${faltantes.toLocaleString('es-ES')} puntos para desbloquear "${nombreItem}". ¡Sigue jugando lecciones para conseguir más puntos!`;
                const tit = window.TPTi18n ? window.TPTi18n.t('tienda.puntos_insuficientes') : "Puntos Insuficientes";
                mostrarAlerta(msg, tit, "alerta");
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

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalTienda && modalTienda.classList.contains('tienda-overlay-activo')) {
            cerrarTienda();
        }
    });

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
                        'mapache': 'assets/img/mapache1.png',
                        'oso': 'assets/img/oso1.png',
                        'pastor': 'assets/img/pastor1.png',
                        'triplet': 'assets/img/triplet1.png',
                        'capibara': 'assets/img/capibara1.png'
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

    // ==========================================================================
    // SISTEMA ACADÉMICO PARA ESTUDIANTES Y PORTAL DEL DOCENTE
    // Criptografía HMAC-SHA256 para validación contra alteraciones (Anti-Cheat)
    // ==========================================================================
    const CLAVE_SECRETA_INSTITUCIONAL = "DenkKraft-TippenTag-AcademicAuth-HMAC-2026-SecurityKey";
    const CLAVE_SECRETA_PERFILES = "DenkKraft-TippenTag-UserProfile-HMAC-2026-SecureKey";
    let certificadoResultadoActual = null;

    // Generar huella digital SHA-256 del contenido del texto para verificación de integridad de lecciones
    async function generarHashTexto(texto) {
        if (!texto) return "";
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(texto.trim());
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            console.error("Error al generar hash del texto:", e);
            return "";
        }
    }

    // Codificación segura Base64 para strings UTF-8 en navegadores
    function codificarBase64Utf8(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    }

    // Decodificación segura Base64 para strings UTF-8 en navegadores
    function decodificarBase64Utf8(str) {
        return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    // Generar firma criptográfica HMAC-SHA256 con Web Cryptography API nativa del navegador
    async function generarFirmaHmacSha256(mensajeTexto, clave = CLAVE_SECRETA_INSTITUCIONAL) {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(clave);
        const cryptoKey = await window.crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: { name: "SHA-256" } },
            false,
            ["sign"]
        );
        const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(mensajeTexto));
        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ==========================================================================
    // RESPALDO, EXPORTACIÓN E IMPORTACIÓN SEGURA DE PERFILES (ANTI-CHEAT)
    // ==========================================================================
    async function dataUrlABlob(dataUrl) {
        if (!dataUrl) return null;
        try {
            const arr = dataUrl.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        } catch (e) {
            try {
                const resp = await fetch(dataUrl);
                return await resp.blob();
            } catch (err) {
                return null;
            }
        }
    }

    async function exportarPerfil(usuario) {
        if (!usuario) {
            mostrarAlerta(
                window.TPTi18n ? window.TPTi18n.t('perfil.exportar_sin_usuario') : "Debes tener un perfil seleccionado o activo para exportarlo.",
                "Exportar Perfil",
                "alerta"
            );
            return;
        }

        let avatarB64 = null;
        if (usuario.avatarBlob) {
            if (typeof usuario.avatarBlob === 'string' && usuario.avatarBlob.startsWith('data:')) {
                avatarB64 = usuario.avatarBlob;
            } else if (usuario.avatarBlob instanceof Blob) {
                try {
                    avatarB64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(usuario.avatarBlob);
                    });
                } catch (e) {
                    console.warn("No se pudo codificar avatar a base64:", e);
                }
            }
        }

        const datosPerfil = {
            id: usuario.id,
            nombre: usuario.nombre,
            puntos: typeof usuario.puntos === 'number' ? usuario.puntos : 0,
            temaEquipado: usuario.temaEquipado || 'claro',
            mascotaEquipada: usuario.mascotaEquipada || 'gato',
            inventario: Array.isArray(usuario.inventario) ? usuario.inventario : ['tema_claro', 'mascota_gato'],
            highscores: usuario.highscores || {},
            avatarB64: avatarB64,
            fechaExportacion: new Date().toISOString(),
            emisor: "DenkKraft Tippen Tag Secure Profile System v1.0"
        };

        const jsonDatos = JSON.stringify(datosPerfil);
        const firmaHex = await generarFirmaHmacSha256(jsonDatos, CLAVE_SECRETA_PERFILES);

        const paqueteExportacion = {
            formato: "TPT-USER-BACKUP",
            version: "1.0",
            datos: datosPerfil,
            firma: firmaHex
        };

        const blob = new Blob([JSON.stringify(paqueteExportacion, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const nombreLimpio = (usuario.nombre || 'Jugador').replace(/[^a-zA-Z0-9_-]/g, '_');
        a.href = url;
        a.download = `TippenTag_Perfil_${nombreLimpio}.tptuser`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarAlerta(
            window.TPTi18n ? window.TPTi18n.t('perfil.exportar_exito', { nombre: usuario.nombre }) : `¡Perfil de "${usuario.nombre}" exportado correctamente!`,
            "Respaldo Creado",
            "exito"
        );
    }

    async function procesarArchivoPerfil(archivo, origen = 'crear') {
        if (!archivo) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const contenido = e.target.result;
                const parsed = JSON.parse(contenido);

                if (!parsed || parsed.formato !== 'TPT-USER-BACKUP' || !parsed.datos || !parsed.firma) {
                    mostrarAlerta(
                        window.TPTi18n ? window.TPTi18n.t('perfil.importar_error_formato') : "El archivo seleccionado no es un respaldo de perfil válido (.tptuser) de Tippen Tag.",
                        "Formato Inválido",
                        "peligro"
                    );
                    return;
                }

                // Verificación Criptográfica HMAC-SHA256 (Anti-Cheat / Anti-Tamper)
                const jsonReconstruido = JSON.stringify(parsed.datos);
                const firmaCalculada = await generarFirmaHmacSha256(jsonReconstruido, CLAVE_SECRETA_PERFILES);

                if (firmaCalculada.toLowerCase() !== parsed.firma.toLowerCase()) {
                    mostrarAlerta(
                        window.TPTi18n ? window.TPTi18n.t('perfil.importar_error_firma') : "¡Alerta de Seguridad: La firma digital del perfil no coincide! El archivo fue modificado manualmente o está corrupto. Para garantizar juego limpio, no se puede importar.",
                        "Manipulación Detectada",
                        "peligro"
                    );
                    return;
                }

                // Restauración del avatar
                let avatarBlob = null;
                if (parsed.datos.avatarB64) {
                    avatarBlob = await dataUrlABlob(parsed.datos.avatarB64);
                }

                const usuarioRestaurado = {
                    id: parsed.datos.id || ("usr_" + Date.now()),
                    nombre: parsed.datos.nombre || "Jugador",
                    puntos: typeof parsed.datos.puntos === 'number' ? parsed.datos.puntos : 0,
                    temaEquipado: parsed.datos.temaEquipado || 'claro',
                    mascotaEquipada: parsed.datos.mascotaEquipada || 'gato',
                    inventario: Array.isArray(parsed.datos.inventario) ? parsed.datos.inventario : ['tema_claro', 'mascota_gato'],
                    highscores: parsed.datos.highscores || {},
                    avatarBlob: avatarBlob
                };

                await window.TPTDatabase.guardarUsuario(usuarioRestaurado);
                await cargarPerfiles();

                if (origen === 'crear') {
                    cambiarVista('landing');
                } else if (origen === 'ajustes' && usuarioActivo && usuarioActivo.id === usuarioRestaurado.id) {
                    usuarioActivo = usuarioRestaurado;
                    actualizarInfoUsuarioMenu();
                    actualizarPuntosTienda();
                    aplicarCosmetico('tema', usuarioRestaurado.temaEquipado);
                    aplicarCosmetico('mascota', usuarioRestaurado.mascotaEquipada);
                }

                mostrarAlerta(
                    window.TPTi18n
                        ? window.TPTi18n.t('perfil.importar_exito', { nombre: usuarioRestaurado.nombre, puntos: usuarioRestaurado.puntos.toLocaleString('es-ES') })
                        : `¡Perfil de "${usuarioRestaurado.nombre}" importado con éxito con ${usuarioRestaurado.puntos.toLocaleString('es-ES')} puntos!`,
                    "Perfil Importado",
                    "exito"
                );

            } catch (err) {
                console.error("Error al procesar archivo de perfil:", err);
                mostrarAlerta(
                    window.TPTi18n ? window.TPTi18n.t('perfil.importar_error_formato') : "El archivo está dañado o no tiene un formato JSON válido.",
                    "Error de Importación",
                    "peligro"
                );
            }
        };
        reader.readAsText(archivo);
    }

    // Empaquetar y firmar el certificado de evaluación del estudiante
    async function empaquetarCertificado(payload) {
        const payloadJson = JSON.stringify(payload);
        const payloadB64 = codificarBase64Utf8(payloadJson);
        const firmaHex = await generarFirmaHmacSha256(payloadJson);
        const tokenCompleto = `TPT-CERT.${payloadB64}.${firmaHex}`;
        return {
            token: tokenCompleto,
            datos: payload,
            firma: firmaHex
        };
    }

    // Validar un token o certificado académico
    async function validarTokenAcademico(tokenOJson) {
        if (!tokenOJson || typeof tokenOJson !== 'string') {
            return { valido: false, error: 'El código proporcionado está vacío o no es válido.' };
        }

        const textoLimpio = tokenOJson.trim();

        // Caso 1: Formato token seguro TPT-CERT.<base64>.<firmaHex>
        if (textoLimpio.startsWith('TPT-CERT.')) {
            const partes = textoLimpio.split('.');
            if (partes.length !== 3) {
                return { valido: false, error: 'La estructura del código TPT-CERT es incorrecta o está incompleta.' };
            }
            try {
                const payloadJson = decodificarBase64Utf8(partes[1]);
                const payload = JSON.parse(payloadJson);
                const firmaRecibida = partes[2];
                const firmaCalculada = await generarFirmaHmacSha256(payloadJson);

                if (firmaCalculada.toLowerCase() === firmaRecibida.toLowerCase()) {
                    return { valido: true, datos: payload };
                } else {
                    return { 
                        valido: false, 
                        error: '¡Firma digital no coincide! Los valores (WPM, precisión, usuario o fecha) fueron alterados manualmente.',
                        datosAlterados: payload
                    };
                }
            } catch (err) {
                return { valido: false, error: 'Error al decodificar el certificado: formato o codificación corrupta.' };
            }
        }

        // Caso 2: Formato archivo exportado JSON (.tptcert / .json)
        try {
            const parsed = JSON.parse(textoLimpio);
            if (parsed.token) {
                return await validarTokenAcademico(parsed.token);
            } else if (parsed.datos && parsed.firma) {
                const jsonDatos = JSON.stringify(parsed.datos);
                const firmaCalculada = await generarFirmaHmacSha256(jsonDatos);
                if (firmaCalculada.toLowerCase() === parsed.firma.toLowerCase()) {
                    return { valido: true, datos: parsed.datos };
                } else {
                    return { 
                        valido: false, 
                        error: '¡El archivo de certificado fue modificado! La firma criptográfica HMAC no coincide.',
                        datosAlterados: parsed.datos 
                    };
                }
            } else {
                return { valido: false, error: 'El archivo JSON no contiene un certificado DenkKraft reconocido.' };
            }
        } catch (e) {
            return { valido: false, error: 'El texto ingresado no es un código ni un archivo de certificado válido.' };
        }
    }

    // Invocado por TPTengine al culminar la partida para preparar la entrega del estudiante
    async function prepararCertificadoResultado(metricas) {
        const seccionEstudiante = document.getElementById('seccion-academica-estudiante');
        const msgCopiado = document.getElementById('msg-academico-copiado');
        if (msgCopiado) msgCopiado.style.display = 'none';

        // Si la edición/tier activo no tiene acceso al módulo educativo (Tier 3), no mostramos la sección
        if (window.TPTTiers && !window.TPTTiers.tieneAccesoDocente()) {
            if (seccionEstudiante) seccionEstudiante.style.display = 'none';
            certificadoResultadoActual = null;
            return;
        }

        if (!metricas) {
            if (seccionEstudiante) seccionEstudiante.style.display = 'none';
            certificadoResultadoActual = null;
            return;
        }

        if (seccionEstudiante) seccionEstudiante.style.display = 'flex';

        const min = Math.floor(metricas.tiempoUsado / 60);
        const seg = metricas.tiempoUsado % 60;
        const tiempoStr = `${min}:${seg < 10 ? '0' + seg : seg}`;

        const hashNivel = (metricas.nivel && metricas.nivel.hashTexto) 
            ? metricas.nivel.hashTexto 
            : (metricas.nivel && metricas.nivel.texto ? await generarHashTexto(metricas.nivel.texto) : '');
        const autorNombreNivel = (metricas.nivel && metricas.nivel.autorNombre) 
            ? metricas.nivel.autorNombre 
            : (metricas.nivel && metricas.nivel.esOficial ? 'DenkKraft' : 'Comunidad');
        const autorIdNivel = (metricas.nivel && metricas.nivel.autorId) 
            ? metricas.nivel.autorId 
            : (metricas.nivel && metricas.nivel.esOficial ? 'denkkraft_oficial' : 'comunidad');
        const caracteresNivel = (metricas.nivel && metricas.nivel.caracteresTexto) 
            ? metricas.nivel.caracteresTexto 
            : (metricas.nivel && metricas.nivel.texto ? metricas.nivel.texto.length : 0);

        const completado = Boolean(metricas.completado);
        const progreso = typeof metricas.progreso === 'number' ? metricas.progreso : (completado ? 100 : 0);
        const motivoFin = metricas.motivoFin || (completado ? 'completado' : 'incompleto');
        const caracteresAvanzados = typeof metricas.caracteresAvanzados === 'number'
            ? metricas.caracteresAvanzados
            : (completado ? caracteresNivel : 0);

        const payload = {
            estudiante: usuarioActivo ? usuarioActivo.nombre : 'Estudiante',
            nivelId: (metricas.nivel && metricas.nivel.id) ? metricas.nivel.id : 'nivel_custom',
            nivelTitulo: (metricas.nivel && metricas.nivel.titulo) ? metricas.nivel.titulo : 'Nivel de Práctica',
            autorNombre: autorNombreNivel,
            autorId: autorIdNivel,
            hashTexto: hashNivel,
            caracteresTexto: caracteresNivel,
            caracteresAvanzados: caracteresAvanzados,
            completado: completado,
            progreso: progreso,
            motivoFin: motivoFin,
            esOficial: Boolean(metricas.nivel && metricas.nivel.esOficial),
            wpm: metricas.wpm,
            precision: metricas.precision,
            errores: metricas.errores,
            tiempoSegundos: metricas.tiempoUsado,
            tiempoFormateado: tiempoStr,
            puntos: metricas.puntos,
            modo: metricas.modo || 'original',
            fechaEmision: new Date().toLocaleString('es-ES', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            }),
            timestamp: Date.now(),
            emisor: "DenkKraft Tippen Tag v1.0 Academic Engine"
        };

        certificadoResultadoActual = await empaquetarCertificado(payload);
    }

    // Configurar botones del modal de resultados para el alumno
    const btnCopiarCodigoEntrega = document.getElementById('btn-copiar-codigo-entrega');
    const btnDescargarCertificado = document.getElementById('btn-descargar-certificado');
    const msgAcademicoCopiado = document.getElementById('msg-academico-copiado');

    if (btnCopiarCodigoEntrega) {
        btnCopiarCodigoEntrega.addEventListener('click', async () => {
            if (!certificadoResultadoActual || !certificadoResultadoActual.token) {
                mostrarAlerta('Aún no se ha generado el código seguro del nivel.', 'Certificado no disponible', 'alerta');
                return;
            }
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(certificadoResultadoActual.token);
                } else {
                    const tempTa = document.createElement('textarea');
                    tempTa.value = certificadoResultadoActual.token;
                    document.body.appendChild(tempTa);
                    tempTa.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempTa);
                }
                if (msgAcademicoCopiado) {
                    msgAcademicoCopiado.style.display = 'block';
                    setTimeout(() => {
                        if (msgAcademicoCopiado) msgAcademicoCopiado.style.display = 'none';
                    }, 3500);
                }
            } catch (err) {
                mostrarAlerta(certificadoResultadoActual.token, 'Código de Entrega (Copia el texto)', 'info');
            }
        });
    }

    if (btnDescargarCertificado) {
        btnDescargarCertificado.addEventListener('click', () => {
            if (!certificadoResultadoActual) {
                mostrarAlerta('Aún no se ha generado el archivo de certificado.', 'Certificado no disponible', 'alerta');
                return;
            }
            const blob = new Blob([JSON.stringify(certificadoResultadoActual, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const alumnoNombreLimpio = (certificadoResultadoActual.datos.estudiante || 'Alumno').replace(/[^a-zA-Z0-9_-]/g, '_');
            const nivelLimpio = (certificadoResultadoActual.datos.nivelTitulo || 'Nivel').replace(/[^a-zA-Z0-9_-]/g, '_');
            a.href = url;
            a.download = `Certificado_${alumnoNombreLimpio}_${nivelLimpio}.tptcert`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Configurar Portal del Docente
    const modalPortalDocente = document.getElementById('modal-portal-docente');
    const btnLandingPortalDocente = document.getElementById('btn-landing-portal-docente');
    const btnMenuPortalDocente = document.getElementById('btn-menu-portal-docente');
    const btnCerrarDocente = document.getElementById('btn-cerrar-docente');
    const inputCodigoDocente = document.getElementById('input-codigo-docente');
    const btnVerificarDocente = document.getElementById('btn-verificar-docente');
    const btnDemoDocente = document.getElementById('btn-demo-docente');
    const btnDemoAlterado = document.getElementById('btn-demo-alterado');
    const dropzoneDocente = document.getElementById('dropzone-docente-cert');
    const inputArchivoDocenteCert = document.getElementById('input-archivo-docente-cert');
    const docenteCertNombre = document.getElementById('docente-cert-nombre');
    const resultadoDocenteBox = document.getElementById('resultado-docente-box');
    const selectDocenteNivelEsperado = document.getElementById('select-docente-nivel-esperado');

    async function poblarSelectorLeccionesDocente() {
        if (!selectDocenteNivelEsperado) return;
        selectDocenteNivelEsperado.innerHTML = '<option value="">-- Detección Automática de Lección --</option>';
        try {
            const todosLosNiveles = await window.TPTDatabase.obtenerTodos();
            todosLosNiveles.forEach(n => {
                const opt = document.createElement('option');
                opt.value = n.id;
                const prefijo = n.esOficial ? '[Oficial DenkKraft]' : `[Autor: ${n.autorNombre || 'Comunidad'}]`;
                opt.textContent = `${prefijo} ${n.titulo} (${n.id})`;
                selectDocenteNivelEsperado.appendChild(opt);
            });
        } catch (e) {
            console.error("Error al poblar selector de lecciones docente:", e);
        }
    }

    function abrirPortalDocente() {
        poblarSelectorLeccionesDocente();
        if (modalPortalDocente) {
            modalPortalDocente.classList.remove('vista-oculta');
            const modalTarjeta = modalPortalDocente.querySelector('.tarjeta-portal-docente');
            if (modalTarjeta) modalTarjeta.scrollTop = 0;
            modalPortalDocente.scrollTop = 0;
        }
    }

    function cerrarPortalDocente() {
        if (modalPortalDocente) modalPortalDocente.classList.add('vista-oculta');
    }

    if (btnLandingPortalDocente) btnLandingPortalDocente.addEventListener('click', abrirPortalDocente);
    if (btnMenuPortalDocente) btnMenuPortalDocente.addEventListener('click', abrirPortalDocente);
    if (btnCerrarDocente) btnCerrarDocente.addEventListener('click', cerrarPortalDocente);

    async function ejecutarValidacionDocente() {
        if (!inputCodigoDocente || !resultadoDocenteBox) return;
        const texto = inputCodigoDocente.value.trim();
        if (!texto) {
            resultadoDocenteBox.style.display = 'block';
            resultadoDocenteBox.innerHTML = `
                <div class="docente-reporte-invalido">
                    <div class="docente-reporte-header">
                        <span class="docente-status-icono invalido">✕</span>
                        <div>
                            <h4 class="docente-reporte-titulo" style="color: var(--rojo-error);">Campo Vacío</h4>
                            <span class="docente-reporte-sub">Ingresa un código criptográfico o arrastra un archivo de certificado .tptcert</span>
                        </div>
                    </div>
                </div>
            `;
            requestAnimationFrame(() => {
                const modalTarjeta = document.querySelector('#modal-portal-docente .tarjeta-portal-docente');
                if (modalTarjeta && resultadoDocenteBox) {
                    modalTarjeta.scrollTo({
                        top: resultadoDocenteBox.offsetTop - 15,
                        behavior: 'smooth'
                    });
                }
            });
            return;
        }

        const validacion = await validarTokenAcademico(texto);
        resultadoDocenteBox.style.display = 'block';

        if (validacion.valido) {
            const cert = validacion.datos;
            const todosLosNiveles = await window.TPTDatabase.obtenerTodos();

            // Análisis de Autenticidad de Nivel y Detección de Suplantación (Spoofing)
            const nivelLocal = todosLosNiveles.find(n => n.id === cert.nivelId);
            const esNivelOficialPorId = Boolean(nivelLocal && nivelLocal.esOficial) || Boolean(cert.esOficial);

            // ¿Existe un nivel oficial que tiene el MISMO título pero ID DIFERENTE?
            const tituloCertLimpio = (cert.nivelTitulo || '').trim().toLowerCase();
            const nivelOficialConMismoTitulo = todosLosNiveles.find(n => n.esOficial && n.titulo.trim().toLowerCase() === tituloCertLimpio);
            const esSuplantacionTitulo = Boolean(nivelOficialConMismoTitulo && nivelOficialConMismoTitulo.id !== cert.nivelId);

            // Verificación de Integridad de Contenido / Texto (Anti-Cheat / Anti-Tampering)
            let estadoIntegridadTexto = 'no_verificado'; // 'valido', 'alterado', 'no_verificado'
            let hashEsperadoTexto = '';
            if (nivelLocal && nivelLocal.texto) {
                hashEsperadoTexto = nivelLocal.hashTexto || (await generarHashTexto(nivelLocal.texto));
                if (cert.hashTexto) {
                    estadoIntegridadTexto = (cert.hashTexto === hashEsperadoTexto) ? 'valido' : 'alterado';
                }
            }

            // Comparación con nivel esperado seleccionado en el dropdown
            const idEsperado = selectDocenteNivelEsperado ? selectDocenteNivelEsperado.value : '';
            let htmlComparacion = '';
            if (idEsperado) {
                const nivelEsperadoObj = todosLosNiveles.find(n => n.id === idEsperado);
                const nombreEsperado = nivelEsperadoObj ? nivelEsperadoObj.titulo : idEsperado;
                if (cert.nivelId === idEsperado) {
                    htmlComparacion = `
                        <div class="docente-comparacion-box" style="border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.06);">
                            <span style="color: var(--verde-exito); font-weight: 700;">✓ Coincide con la lección requerida por el docente ("${nombreEsperado}")</span>
                        </div>
                    `;
                } else {
                    htmlComparacion = `
                        <div class="docente-comparacion-box" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06);">
                            <span style="color: var(--rojo-error); font-weight: 700;">❌ No coincide con la asignación del docente:</span>
                            <span style="font-size: calc(12px * var(--escala-texto, 1)); color: var(--texto-secundario);">Se solicitó evaluar <strong>"${nombreEsperado}"</strong> (ID: <code>${idEsperado}</code>), pero este certificado pertenece a <strong>"${cert.nivelTitulo}"</strong> (ID: <code>${cert.nivelId}</code>).</span>
                        </div>
                    `;
                }
            }

            // Alerta de alteración de contenido o suplantación de lección
            let htmlAlertaSuplantacion = '';
            let badgeTipoNivel = '';

            if (estadoIntegridadTexto === 'alterado') {
                badgeTipoNivel = `<span class="badge-suplantacion">❌ Contenido de Lección Modificado</span>`;
                htmlAlertaSuplantacion = `
                    <div class="docente-alerta-suplantacion">
                        <span class="docente-alerta-suplantacion-titulo">❌ ALERTA CRÍTICA: CONTENIDO DE LA LECCIÓN ALTERADO</span>
                        <p class="docente-alerta-suplantacion-texto">
                            La huella digital criptográfica (SHA-256) del texto tecleado no coincide con el examen registrado en el sistema.
                            <br><strong>Diagnóstico:</strong> El estudiante editó el texto del examen original (p. ej. reduciendo oraciones o cambiando palabras) para obtener puntuaciones artificiales.
                        </p>
                    </div>
                `;
            } else if (esSuplantacionTitulo) {
                badgeTipoNivel = `<span class="badge-suplantacion">⚠️ Alerta: ID no coincide con Nivel Oficial</span>`;
                htmlAlertaSuplantacion = `
                    <div class="docente-alerta-suplantacion">
                        <span class="docente-alerta-suplantacion-titulo">⚠️ ALERTA: POSIBLE SUPLANTACIÓN DE LECCIÓN DETECTADA</span>
                        <p class="docente-alerta-suplantacion-texto">
                            El estudiante entregó un examen con el título <strong>"${cert.nivelTitulo}"</strong>, que coincide con la lección oficial de DenkKraft. Sin embargo, el ID certificado digitalmente es <code>${cert.nivelId}</code> en lugar del oficial (<code>${nivelOficialConMismoTitulo.id}</code>).
                            <br><strong>Motivo probable:</strong> El estudiante creó un nivel personalizado más corto con el mismo nombre para inflar sus resultados de WPM y precisión.
                        </p>
                    </div>
                `;
            } else if (esNivelOficialPorId) {
                badgeTipoNivel = `<span class="badge-oficial-verificado">✓ Lección Oficial DenkKraft</span>`;
            } else {
                const autorDocenteStr = cert.autorNombre ? ` (Autor: ${cert.autorNombre})` : '';
                badgeTipoNivel = `<span class="badge-personalizado">ℹ️ Lección de Docente / Comunidad${autorDocenteStr}</span>`;
            }

            const esCompletado = cert.completado !== undefined ? Boolean(cert.completado) : true;
            const progresoVal = typeof cert.progreso === 'number' ? cert.progreso : (esCompletado ? 100 : 0);

            let motivoFinTexto = '';
            if (cert.motivoFin === 'vidas') {
                motivoFinTexto = window.TPTi18n ? window.TPTi18n.t('docente.motivo_vidas') : 'Interrumpido por agotamiento de vidas';
            } else if (cert.motivoFin === 'tiempo') {
                motivoFinTexto = window.TPTi18n ? window.TPTi18n.t('docente.motivo_tiempo') : 'Interrumpido por tiempo límite agotado';
            } else {
                motivoFinTexto = window.TPTi18n ? window.TPTi18n.t('docente.motivo_incompleto') : 'Nivel no completado en su totalidad';
            }

            const badgeEstadoEntrega = esCompletado
                ? `<span class="badge-completado-exito" style="display:inline-flex; align-items:center; gap:4px; padding: 3px 8px; border-radius: 999px; font-size: calc(11px * var(--escala-texto, 1)); font-weight: 700; background: rgba(16, 185, 129, 0.15); color: var(--verde-exito); border: 1px solid rgba(16, 185, 129, 0.3);">${window.TPTi18n ? window.TPTi18n.t('docente.badge_completado') : '✓ Completado (100%)'}</span>`
                : `<span class="badge-incompleto-alerta" style="display:inline-flex; align-items:center; gap:4px; padding: 3px 8px; border-radius: 999px; font-size: calc(11px * var(--escala-texto, 1)); font-weight: 700; background: rgba(239, 68, 68, 0.15); color: var(--rojo-error); border: 1px solid rgba(239, 68, 68, 0.3);">${window.TPTi18n ? window.TPTi18n.t('docente.badge_incompleto', { progreso: progresoVal }) : `✕ Incompleto (${progresoVal}%)`}</span>`;

            let declaracionTexto = '';
            if (esCompletado) {
                declaracionTexto = window.TPTi18n
                    ? window.TPTi18n.t('docente.declaracion_completado', {
                        estudiante: cert.estudiante,
                        nivel: cert.nivelTitulo || cert.nivelId,
                        wpm: cert.wpm,
                        precision: cert.precision
                    })
                    : `El estudiante <strong>${cert.estudiante}</strong> completó exitosamente el 100% de la lección <strong>"${cert.nivelTitulo || cert.nivelId}"</strong> con <strong>${cert.wpm} WPM</strong> y <strong>${cert.precision}%</strong> de precisión.`;
            } else {
                declaracionTexto = window.TPTi18n
                    ? window.TPTi18n.t('docente.declaracion_incompleto', {
                        estudiante: cert.estudiante,
                        progreso: progresoVal,
                        nivel: cert.nivelTitulo || cert.nivelId,
                        wpm: cert.wpm,
                        precision: cert.precision,
                        motivo: motivoFinTexto
                    })
                    : `El estudiante <strong>${cert.estudiante}</strong> completó el <strong>${progresoVal}%</strong> de la lección <strong>"${cert.nivelTitulo || cert.nivelId}"</strong> con <strong>${cert.wpm} WPM</strong> y <strong>${cert.precision}%</strong> de precisión (${motivoFinTexto}).`;
            }

            resultadoDocenteBox.innerHTML = `
                <div class="docente-reporte-valido">
                    <div class="docente-reporte-header">
                        <span class="docente-status-icono ${esCompletado ? 'valido' : 'parcial'}" style="${!esCompletado ? 'background: rgba(245, 158, 11, 0.15); color: var(--amarillo); border-color: rgba(245, 158, 11, 0.3);' : ''}">${esCompletado ? '✓' : '⚠️'}</span>
                        <div>
                            <h4 class="docente-reporte-titulo">${window.TPTi18n ? window.TPTi18n.t('docente.reporte_valido_titulo') : 'Certificado Oficial Verificado'}</h4>
                            <span class="docente-reporte-sub">${window.TPTi18n ? window.TPTi18n.t('docente.reporte_valido_sub') : 'Firma HMAC-SHA256 íntegra. Las métricas no han sido manipuladas.'}</span>
                        </div>
                        <div style="margin-left: auto; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                            ${badgeTipoNivel}
                            ${badgeEstadoEntrega}
                        </div>
                    </div>

                    ${htmlComparacion}
                    ${htmlAlertaSuplantacion}

                    <div class="docente-declaracion-oficial" style="${!esCompletado ? 'border-left-color: var(--amarillo);' : ''}">
                        ${declaracionTexto}
                    </div>

                    <div class="docente-detalles-grid">
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_estado_entrega') : 'Estado de Finalización'}</span>
                            <span class="docente-detalle-val">${esCompletado 
                                ? `<span style="color: var(--verde-exito); font-weight: 700;">✓ ${window.TPTi18n ? window.TPTi18n.t('docente.val_completado') : 'Completado (100%)'}</span>` 
                                : `<span style="color: var(--rojo-error); font-weight: 700;">✕ ${window.TPTi18n ? window.TPTi18n.t('docente.val_incompleto', { progreso: progresoVal }) : `Incompleto (${progresoVal}%)`}</span>`}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_progreso_nivel') : 'Progreso Alcanzado'}</span>
                            <span class="docente-detalle-val" style="font-weight: 700; color: ${esCompletado ? 'var(--verde-exito)' : 'var(--rojo-error)'};">
                                ${progresoVal}% ${cert.caracteresAvanzados !== undefined ? `<small style="font-weight:normal; opacity:0.85;">(${cert.caracteresAvanzados} / ${cert.caracteresTexto || cert.caracteresAvanzados} car.)</small>` : ''}
                            </span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_estudiante') : 'Estudiante'}</span>
                            <span class="docente-detalle-val">${cert.estudiante}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_nivel') : 'Lección Evaluada'}</span>
                            <span class="docente-detalle-val">${cert.nivelTitulo || cert.nivelId}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">Autor del Nivel</span>
                            <span class="docente-detalle-val">${cert.autorNombre || (esNivelOficialPorId ? 'DenkKraft' : 'Comunidad')}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_id_nivel') : 'ID de Lección en Firma'}</span>
                            <span class="docente-detalle-val" style="font-size: calc(11.5px * var(--escala-texto, 1)); color: ${esSuplantacionTitulo ? 'var(--rojo-error)' : 'var(--azul)'}; font-weight: 700;">${cert.nivelId}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">Integridad de Texto</span>
                            <span class="docente-detalle-val" style="font-size: calc(11.5px * var(--escala-texto, 1)); font-weight: 700;">
                                ${estadoIntegridadTexto === 'valido' 
                                    ? '<span style="color: var(--verde-exito);">✓ Texto Original Íntegro</span>' 
                                    : (estadoIntegridadTexto === 'alterado' 
                                        ? '<span style="color: var(--rojo-error);">❌ Texto Alterado</span>' 
                                        : '<span style="color: var(--texto-secundario);">ℹ️ Verificado</span>')}
                            </span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">Longitud de Lección</span>
                            <span class="docente-detalle-val">${cert.caracteresTexto ? (cert.caracteresTexto + ' caracteres') : (nivelLocal && nivelLocal.texto ? nivelLocal.texto.length + ' caracteres' : 'Registrada')}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_velocidad') : 'Velocidad Mecanográfica'}</span>
                            <span class="docente-detalle-val">${cert.wpm} WPM</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_precision') : 'Precisión de Tecleo'}</span>
                            <span class="docente-detalle-val">${cert.precision}%</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_errores') : 'Errores Registrados'}</span>
                            <span class="docente-detalle-val">${cert.errores} fallos</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">Tiempo Total</span>
                            <span class="docente-detalle-val">${cert.tiempoFormateado || (cert.tiempoSegundos + 's')}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">Modo Jugado</span>
                            <span class="docente-detalle-val">${cert.modo}</span>
                        </div>
                        <div class="docente-detalle-item">
                            <span class="docente-detalle-label">${window.TPTi18n ? window.TPTi18n.t('docente.lbl_fecha') : 'Fecha y Hora de Emisión'}</span>
                            <span class="docente-detalle-val">${cert.fechaEmision}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultadoDocenteBox.innerHTML = `
                <div class="docente-reporte-invalido">
                    <div class="docente-reporte-header">
                        <span class="docente-status-icono invalido">⚠️</span>
                        <div>
                            <h4 class="docente-reporte-titulo" style="color: var(--rojo-error);">¡Alerta: Certificado Inválido o Alterado!</h4>
                            <span class="docente-reporte-sub">La firma criptográfica no coincide. Los datos fueron modificados manualmente o el formato es incorrecto.</span>
                        </div>
                    </div>
                    <p class="docente-error-mensaje">${validacion.error}</p>
                </div>
            `;
        }

        // Desplazamiento automático suave hacia los resultados para garantizar visualización inmediata
        requestAnimationFrame(() => {
            const modalTarjeta = document.querySelector('#modal-portal-docente .tarjeta-portal-docente');
            if (modalTarjeta && resultadoDocenteBox) {
                modalTarjeta.scrollTo({
                    top: resultadoDocenteBox.offsetTop - 15,
                    behavior: 'smooth'
                });
            }
        });
    }

    if (btnVerificarDocente) {
        btnVerificarDocente.addEventListener('click', ejecutarValidacionDocente);
    }

    // Botón Demo Válido
    if (btnDemoDocente) {
        btnDemoDocente.addEventListener('click', async () => {
            const hashDemo = await generarHashTexto("Hola mundo. El gato corre.");
            const demoPayload = {
                estudiante: "Carlos Méndez",
                nivelId: "lvl_oficial_1",
                nivelTitulo: "Lección de Inicio",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                hashTexto: hashDemo,
                caracteresTexto: 26,
                caracteresAvanzados: 26,
                completado: true,
                progreso: 100,
                motivoFin: "completado",
                esOficial: true,
                wpm: 58,
                precision: 96,
                errores: 3,
                tiempoSegundos: 38,
                tiempoFormateado: "0:38",
                puntos: 120,
                modo: "original",
                fechaEmision: new Date().toLocaleString('es-ES'),
                timestamp: Date.now(),
                emisor: "DenkKraft Tippen Tag v1.0 Academic Engine"
            };
            const cert = await empaquetarCertificado(demoPayload);
            if (inputCodigoDocente) inputCodigoDocente.value = cert.token;
            if (docenteCertNombre) docenteCertNombre.style.display = 'none';
            ejecutarValidacionDocente();
        });
    }

    // Botón Demo Alterado / Trampa (Demuestra detección de ID suplantado y trampa de WPM)
    if (btnDemoAlterado) {
        btnDemoAlterado.addEventListener('click', async () => {
            // Simulamos un estudiante que intentó alterar el texto o suplantar el examen oficial
            const demoPayload = {
                estudiante: "Alumno Astuto",
                nivelId: "lvl_custom_trampa_99",
                nivelTitulo: "Lección de Inicio", // Suplanta el nombre oficial
                autorNombre: "Alumno Astuto",
                autorId: "usr_alumno_trampa",
                hashTexto: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                caracteresTexto: 5,
                caracteresAvanzados: 5,
                completado: true,
                progreso: 100,
                motivoFin: "completado",
                esOficial: false,
                wpm: 145,
                precision: 100,
                errores: 0,
                tiempoSegundos: 12,
                tiempoFormateado: "0:12",
                puntos: 200,
                modo: "original",
                fechaEmision: new Date().toLocaleString('es-ES'),
                timestamp: Date.now(),
                emisor: "DenkKraft Tippen Tag v1.0 Academic Engine"
            };
            const cert = await empaquetarCertificado(demoPayload);
            if (inputCodigoDocente) inputCodigoDocente.value = cert.token;
            if (docenteCertNombre) docenteCertNombre.style.display = 'none';
            ejecutarValidacionDocente();
        });
    }

    // Dropzone para arrastrar archivos .tptcert o .json en el portal del docente
    if (dropzoneDocente && inputArchivoDocenteCert) {
        dropzoneDocente.addEventListener('click', () => inputArchivoDocenteCert.click());

        inputArchivoDocenteCert.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) procesarArchivoCertificadoDocente(file);
        });

        dropzoneDocente.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzoneDocente.classList.add('dragover');
        });

        dropzoneDocente.addEventListener('dragleave', () => {
            dropzoneDocente.classList.remove('dragover');
        });

        dropzoneDocente.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzoneDocente.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                procesarArchivoCertificadoDocente(e.dataTransfer.files[0]);
            }
        });

        function procesarArchivoCertificadoDocente(file) {
            if (docenteCertNombre) {
                docenteCertNombre.textContent = `Archivo cargado: ${file.name}`;
                docenteCertNombre.style.display = 'block';
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (inputCodigoDocente) {
                    inputCodigoDocente.value = event.target.result;
                    ejecutarValidacionDocente();
                }
            };
            reader.readAsText(file);
        }
    }

    // Acciones adicionales del Portal del Docente (Limpiar formulario, Cerrar desde pie y Clic en fondo)
    const btnLimpiarDocente = document.getElementById('btn-limpiar-docente');
    if (btnLimpiarDocente) {
        btnLimpiarDocente.addEventListener('click', () => {
            if (inputCodigoDocente) inputCodigoDocente.value = '';
            if (docenteCertNombre) {
                docenteCertNombre.textContent = '';
                docenteCertNombre.style.display = 'none';
            }
            if (resultadoDocenteBox) {
                resultadoDocenteBox.innerHTML = '';
                resultadoDocenteBox.style.display = 'none';
            }
            const modalTarjeta = document.querySelector('#modal-portal-docente .tarjeta-portal-docente');
            if (modalTarjeta) modalTarjeta.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const btnCerrarDocentePie = document.getElementById('btn-cerrar-docente-pie');
    if (btnCerrarDocentePie) {
        btnCerrarDocentePie.addEventListener('click', cerrarPortalDocente);
    }

    if (modalPortalDocente) {
        modalPortalDocente.addEventListener('click', (e) => {
            if (e.target === modalPortalDocente) cerrarPortalDocente();
        });
    }

    // ==========================================================================
    // GESTOR DE REGLAS DE TIERS / EDICIONES COMERCIALES
    // ==========================================================================
    function aplicarReglasDeTier() {
        const tierActual = window.TPTTiers ? window.TPTTiers.obtenerTierActual() : 3;
        const selectTierJuego = document.getElementById('select-tier-juego');
        if (selectTierJuego) selectTierJuego.value = tierActual.toString();

        const btnLandingDocente = document.getElementById('btn-landing-portal-docente');
        const btnMenuDocente = document.getElementById('btn-menu-portal-docente');
        const btnIrCreador = document.getElementById('btn-ir-creador');

        // Permisos de Portal Docente (Tier 3)
        const tieneDocente = window.TPTTiers ? window.TPTTiers.tieneAccesoDocente() : true;
        if (btnLandingDocente) btnLandingDocente.style.display = tieneDocente ? 'inline-flex' : 'none';
        if (btnMenuDocente) btnMenuDocente.style.display = tieneDocente ? 'inline-flex' : 'none';

        // Permisos de Creador (Tier 2)
        const tieneCreador = window.TPTTiers ? window.TPTTiers.tieneAccesoCreador() : true;
        if (btnIrCreador) {
            if (!tieneCreador) {
                btnIrCreador.title = "Disponible en Edición Creador (Tier 2)";
                btnIrCreador.style.opacity = "0.6";
            } else {
                btnIrCreador.title = "Crear un nuevo nivel";
                btnIrCreador.style.opacity = "1";
            }
        }

        // Recargar niveles en el menú si la vista está abierta o para actualizar el catálogo
        cargarTarjetasDeNiveles();
    }

    // Exposición de métodos para el motor y contexto global
    window.TPTui = { 
        cambiarVista: cambiarVista,
        sumarPuntos: sumarPuntos,
        mostrarNarrativa: mostrarNarrativa,
        prepararCertificadoResultado: prepararCertificadoResultado,
        mostrarAlerta: mostrarAlerta,
        mostrarConfirmacion: mostrarConfirmacion,
        aplicarReglasDeTier: aplicarReglasDeTier,
        generarHashTexto: generarHashTexto,
        exportarPerfil: exportarPerfil,
        procesarArchivoPerfil: procesarArchivoPerfil
    };

    window.TPTprofileManager = {
        exportar: exportarPerfil,
        importar: procesarArchivoPerfil
    };

    window.TPTDatabase.abrir().then(() => {
        iniciarConsejosRotativos();
        configurarBuscadorNiveles();
        configurarFiltrosDificultad();
        configurarPaginacionNiveles();
        configurarModalAjustes();
        cargarPerfiles();
        aplicarReglasDeTier();
        if (configApp.musicaMenuActiva) {
            reproducirMusicaMenu();
        }
    });
});