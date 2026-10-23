// ==========================================================================
// js/TPTengine.js - Tippen Tag (DenkKraft)
// Motor de mecanografía arcade: Cuenta regresiva (3, 2, 1), atajo Alt+P y audio
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Referencias al DOM del juego
    const cajaObjetivo = document.getElementById('caja-objetivo');
    const inputCaptura = document.getElementById('input-captura');
    const displayPuntos = document.getElementById('puntos-juego');
    const displayReloj = document.getElementById('reloj-juego');
    const displayVidas = document.getElementById('vidas-juego');
    const displayCombo = document.getElementById('indicador-combo');
    const mascotaDisplay = document.getElementById('mascota-display');
    const areaJuegoClic = document.getElementById('area-juego-clic');
    const reproductorAudio = document.getElementById('audio-juego');
    const btnToggleGuia = document.getElementById('btn-toggle-guia');
    const btnToggleSonido = document.getElementById('btn-toggle-sonido');
    const btnControlAudio = document.getElementById('btn-control-audio');
    const imgTeclado = document.querySelector('.img-teclado');

    // Cuenta regresiva
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumero = document.getElementById('countdown-numero');
    let countdownTimeouts = [];

    // Modal de resultados
    const modalResultado = document.getElementById('modal-resultado');
    const resultadoIcono = document.getElementById('resultado-icono');
    const resultadoTitulo = document.getElementById('resultado-titulo');
    const resultadoSubtitulo = document.getElementById('resultado-subtitulo');
    const resultadoWpm = document.getElementById('resultado-wpm');
    const resultadoPrecision = document.getElementById('resultado-precision');
    const resultadoErrores = document.getElementById('resultado-errores');
    const resultadoPuntos = document.getElementById('resultado-puntos');
    const btnReintentarNivel = document.getElementById('btn-reintentar-nivel');
    const btnContinuarResultado = document.getElementById('btn-continuar-resultado');

    // Variables de estado del motor
    let textoCompleto = "";
    let bloquesDeTexto = [];
    let indiceBloqueActual = 0;
    
    let fraseActual = "";
    let indiceActual = 0;
    let puntosGlobales = 0; 
    let tiempoInicial = 45;
    let tiempoRestante = 45;
    let intervaloReloj = null;
    let nivelActivo = null;
    let partidaEnCurso = false;

    let modoPartida = "normal";
    let vidasActuales = 3;
    let vidasMaximas = 3;
    let erroresCometidos = 0;
    let caracteresCorrectos = 0;
    let rachaCombo = 0;
    let rachaMaxima = 0;

    // --- SUBSISTEMA DE AUDIO SINTETIZADO (Web Audio API - 100% offline) ---
    const SoundFX = {
        ctx: null,
        activado: true,
        volumen: 0.7,
        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
        },
        sincronizarAjustes() {
            if (window.TPTConfig) {
                this.volumen = (window.TPTConfig.volumenSFX != null ? window.TPTConfig.volumenSFX : 70) / 100;
                if (window.TPTConfig.sfxActivo === false) {
                    this.activado = false;
                }
            }
        },
        beep(freq, duracion = 0.08) {
            this.sincronizarAjustes();
            if (!this.activado || this.volumen <= 0) return;
            this.init();
            if (!this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                const g = 0.08 * this.volumen;
                gain.gain.setValueAtTime(g, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duracion);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duracion);
            } catch (e) {}
        },
        tecleo() {
            this.sincronizarAjustes();
            if (!this.activado || this.volumen <= 0) return;
            this.init();
            if (!this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(540 + Math.random() * 80, this.ctx.currentTime);
                const g = 0.05 * this.volumen;
                gain.gain.setValueAtTime(g, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.04);
            } catch (e) {}
        },
        error() {
            this.sincronizarAjustes();
            if (!this.activado || this.volumen <= 0) return;
            this.init();
            if (!this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, this.ctx.currentTime);
                const g = 0.1 * this.volumen;
                gain.gain.setValueAtTime(g, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.12);
            } catch (e) {}
        },
        victoria() {
            this.sincronizarAjustes();
            if (!this.activado || this.volumen <= 0) return;
            this.init();
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const g = 0.08 * this.volumen;
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.09);
                    gain.gain.setValueAtTime(g, now + i * 0.09);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.09);
                    osc.stop(now + i * 0.09 + 0.2);
                });
            } catch (e) {}
        }
    };

    if (btnToggleSonido) {
        btnToggleSonido.addEventListener('click', () => {
            SoundFX.activado = !SoundFX.activado;
            if (window.TPTConfig) {
                window.TPTConfig.sfxActivo = SoundFX.activado;
                try {
                    localStorage.setItem('tippen_tag_config', JSON.stringify(window.TPTConfig));
                } catch (e) {}
            }
            const estadoStr = SoundFX.activado 
                ? (window.TPTi18n ? window.TPTi18n.t('comun.on') : 'ON') 
                : (window.TPTi18n ? window.TPTi18n.t('comun.off') : 'OFF');
            btnToggleSonido.textContent = window.TPTi18n ? window.TPTi18n.t('juego.sonido_btn', { estado: estadoStr }) : `Sonido: ${estadoStr}`;
            btnToggleSonido.title = SoundFX.activado ? 'Desactivar sonido' : 'Activar sonido';
        });
    }

    if (btnToggleGuia && imgTeclado) {
        btnToggleGuia.addEventListener('click', () => {
            imgTeclado.classList.toggle('guia-oculta');
            const oculta = imgTeclado.classList.contains('guia-oculta');
            const estadoStr = oculta 
                ? (window.TPTi18n ? window.TPTi18n.t('comun.off') : 'OFF') 
                : (window.TPTi18n ? window.TPTi18n.t('comun.on') : 'ON');
            btnToggleGuia.textContent = window.TPTi18n ? window.TPTi18n.t('juego.guia_btn', { estado: estadoStr }) : `Guía: ${estadoStr}`;
        });
    }

    // Control y Atajo de Pausar Canción (Alt + P)
    function alternarPausaCancion() {
        if (!nivelActivo || !nivelActivo.archivoAudio || !reproductorAudio) return;
        const txtPausar = window.TPTi18n ? window.TPTi18n.t('juego.pausar_audio') : 'Pausar Música';
        const txtReanudar = window.TPTi18n ? window.TPTi18n.t('juego.reanudar_audio') : 'Reanudar Música';
        if (reproductorAudio.paused) {
            reproductorAudio.play().catch(() => {});
            if (btnControlAudio) btnControlAudio.innerHTML = `${txtPausar} <small>[Alt + P]</small>`;
        } else {
            reproductorAudio.pause();
            if (btnControlAudio) btnControlAudio.innerHTML = `${txtReanudar} <small>[Alt + P]</small>`;
        }
    }

    if (btnControlAudio) {
        btnControlAudio.addEventListener('click', alternarPausaCancion);
    }

    // Sincronizar barra de audio interactiva para mover momentos de la canción
    if (reproductorAudio) {
        reproductorAudio.addEventListener('click', (e) => e.stopPropagation());
        reproductorAudio.addEventListener('touchstart', (e) => e.stopPropagation());

        reproductorAudio.addEventListener('seeked', () => {
            if (partidaEnCurso) inputCaptura.focus();
        });

        reproductorAudio.addEventListener('play', () => {
            const txtPausar = window.TPTi18n ? window.TPTi18n.t('juego.pausar_audio') : 'Pausar Música';
            if (btnControlAudio) btnControlAudio.innerHTML = `${txtPausar} <small>[Alt + P]</small>`;
        });
        reproductorAudio.addEventListener('pause', () => {
            const txtReanudar = window.TPTi18n ? window.TPTi18n.t('juego.reanudar_audio') : 'Reanudar Música';
            if (btnControlAudio) btnControlAudio.innerHTML = `${txtReanudar} <small>[Alt + P]</small>`;
        });
    }

    // Escuchador global de teclado para Alt + P
    window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            alternarPausaCancion();
        }
    });

    // --- FUNCIONES DEL MOTOR --- //
    function segmentarTexto(texto, maxCaracteres) {
        const palabras = texto.split(' ');
        const bloques = [];
        let bloqueTemp = '';

        for (let i = 0; i < palabras.length; i++) {
            let palabra = palabras[i];
            
            if ((bloqueTemp + palabra).length > maxCaracteres && bloqueTemp.length > 0) {
                bloques.push(bloqueTemp);
                bloqueTemp = palabra + ' ';
            } else {
                bloqueTemp += palabra + ' ';
            }
        }
        
        if (bloqueTemp.trim().length > 0) {
            bloques.push(bloqueTemp.trim());
        }
        
        return bloques.length > 0 ? bloques : [texto];
    }

    function pintarBloqueActual() {
        fraseActual = bloquesDeTexto[indiceBloqueActual] || "";
        indiceActual = 0;
        inputCaptura.value = "";
        
        cajaObjetivo.classList.remove('animacion-entrada');
        void cajaObjetivo.offsetWidth; 
        cajaObjetivo.classList.add('animacion-entrada');

        cajaObjetivo.innerHTML = fraseActual.split('').map((char, i) => {
            return `<span class="char" id="c${i}">${char}</span>`;
        }).join('');
        
        const primerSpan = document.getElementById('c0');
        if (primerSpan) primerSpan.classList.add('current');
    }

    function actualizarVidasUI() {
        if (!displayVidas) return;
        if (modoPartida === 'vital' || modoPartida === 'dificil') {
            displayVidas.style.display = 'inline-flex';
            displayVidas.textContent = window.TPTi18n 
                ? window.TPTi18n.t('juego.vidas', { actual: vidasActuales, max: vidasMaximas })
                : `Vidas: ${vidasActuales} / ${vidasMaximas}`;
        } else {
            displayVidas.style.display = 'none';
        }
    }

    function obtenerMultiplicadorCombo(combo) {
        if (combo >= 300) return 5;
        if (combo >= 200) return 4;
        if (combo >= 100) return 3;
        if (combo >= 50) return 2;
        if (combo >= 25) return 1.5;
        return 1;
    }

    function actualizarComboUI() {
        if (!displayCombo) return;
        if (rachaCombo >= 5) {
            const mult = obtenerMultiplicadorCombo(rachaCombo);
            let texto = window.TPTi18n 
                ? window.TPTi18n.t('juego.combo', { num: rachaCombo })
                : `Combo x${rachaCombo}`;

            if (mult > 1) {
                texto += ` (${mult}x)`;
            }

            displayCombo.textContent = texto;
            displayCombo.classList.add('combo-activo');
            displayCombo.setAttribute('data-mult', mult.toString());
        } else {
            displayCombo.classList.remove('combo-activo');
            displayCombo.removeAttribute('data-mult');
        }
    }

    function cancelarCountdown() {
        countdownTimeouts.forEach(t => clearTimeout(t));
        countdownTimeouts = [];
        if (countdownOverlay) countdownOverlay.classList.add('vista-oculta');
    }

    function iniciarNivel(nivel) {
        cancelarCountdown();
        nivelActivo = nivel;
        partidaEnCurso = false;
        textoCompleto = nivel.texto.replace(/\s+/g, ' ').trim();

        if (modalResultado) modalResultado.classList.add('vista-oculta');

        bloquesDeTexto = segmentarTexto(textoCompleto, 42);
        indiceBloqueActual = 0;
        
        modoPartida = nivel.modo_activo || nivel.modo || 'normal';
        tiempoInicial = parseInt(nivel.tiempo_activo || nivel.tiempo_limite) || 45;
        tiempoRestante = tiempoInicial;
        vidasMaximas = parseInt(nivel.vidas) || 3;
        vidasActuales = vidasMaximas;
        
        puntosGlobales = 0;
        erroresCometidos = 0;
        caracteresCorrectos = 0;
        rachaCombo = 0;
        rachaMaxima = 0;
        
        pintarBloqueActual();
        actualizarVidasUI();
        actualizarComboUI();
        actualizarUI();

        // Sincronizar ajustes globales de volumen, sfx y guía
        if (window.TPTConfig) {
            const volNiveles = (window.TPTConfig.volumenNiveles != null ? window.TPTConfig.volumenNiveles : 80) / 100;
            if (reproductorAudio) reproductorAudio.volume = volNiveles;
            SoundFX.sincronizarAjustes();

            const guiaActiva = window.TPTConfig.guiaTecladoActiva !== false;
            if (imgTeclado) imgTeclado.classList.toggle('guia-oculta', !guiaActiva);
            const estadoGuia = guiaActiva ? (window.TPTi18n ? window.TPTi18n.t('comun.on') : 'ON') : (window.TPTi18n ? window.TPTi18n.t('comun.off') : 'OFF');
            const estadoSnd = SoundFX.activado ? (window.TPTi18n ? window.TPTi18n.t('comun.on') : 'ON') : (window.TPTi18n ? window.TPTi18n.t('comun.off') : 'OFF');
            if (btnToggleGuia) btnToggleGuia.textContent = window.TPTi18n ? window.TPTi18n.t('juego.guia_btn', { estado: estadoGuia }) : `Guía: ${estadoGuia}`;
            if (btnToggleSonido) btnToggleSonido.textContent = window.TPTi18n ? window.TPTi18n.t('juego.sonido_btn', { estado: estadoSnd }) : `Sonido: ${estadoSnd}`;
        }

        // Control de audio
        if (nivel.archivoAudio) {
            let audioUrl = null;
            try {
                if (typeof nivel.archivoAudio === 'string') {
                    audioUrl = nivel.archivoAudio;
                } else if (nivel.archivoAudio instanceof Blob) {
                    audioUrl = URL.createObjectURL(nivel.archivoAudio);
                }
            } catch (errAudio) {
                console.error("Error al procesar archivoAudio:", errAudio);
            }

            if (audioUrl) {
                reproductorAudio.src = audioUrl;
                reproductorAudio.style.display = 'block';
                if (window.TPTConfig && window.TPTConfig.volumenNiveles != null) {
                    reproductorAudio.volume = window.TPTConfig.volumenNiveles / 100;
                }
                if (btnControlAudio) {
                    btnControlAudio.style.display = 'inline-flex';
                    const txtPausar = window.TPTi18n ? window.TPTi18n.t('juego.pausar_audio') : 'Pausar Música';
                    btnControlAudio.innerHTML = `${txtPausar} <small>[Alt + P]</small>`;
                }
            } else {
                reproductorAudio.pause();
                reproductorAudio.style.display = 'none';
                if (btnControlAudio) btnControlAudio.style.display = 'none';
            }
        } else {
            reproductorAudio.pause();
            reproductorAudio.style.display = 'none';
            if (btnControlAudio) btnControlAudio.style.display = 'none';
        }

        // --- SECUENCIA DE CUENTA REGRESIVA (3, 2, 1, ¡ESCRIBE!) ---
        if (countdownOverlay && countdownNumero) {
            countdownOverlay.classList.remove('vista-oculta');
            countdownNumero.textContent = "3";
            SoundFX.beep(440);

            countdownTimeouts.push(setTimeout(() => {
                countdownNumero.textContent = "2";
                SoundFX.beep(440);
            }, 800));

            countdownTimeouts.push(setTimeout(() => {
                countdownNumero.textContent = "1";
                SoundFX.beep(440);
            }, 1600));

            countdownTimeouts.push(setTimeout(() => {
                countdownNumero.textContent = window.TPTi18n ? window.TPTi18n.t('juego.escribe') : "¡ESCRIBE!";
                SoundFX.beep(880, 0.15);
            }, 2400));

            countdownTimeouts.push(setTimeout(() => {
                countdownOverlay.classList.add('vista-oculta');
                partidaEnCurso = true;
                inputCaptura.focus();

                if (nivel.archivoAudio) {
                    reproductorAudio.play().catch(e => console.warn("Audio autoplay bloqueado:", e));
                }

                if (modoPartida === 'viaje') {
                    displayReloj.textContent = "∞:∞";
                } else {
                    iniciarTemporizador();
                }
            }, 3000));
        } else {
            // Fallback directo
            partidaEnCurso = true;
            inputCaptura.focus();
            if (nivel.archivoAudio) reproductorAudio.play().catch(() => {});
            if (modoPartida === 'viaje') {
                displayReloj.textContent = "∞:∞";
            } else {
                iniciarTemporizador();
            }
        }
    }

    function iniciarTemporizador() {
        clearInterval(intervaloReloj);
        actualizarUI();
        
        intervaloReloj = setInterval(() => {
            tiempoRestante--;
            actualizarUI();
            
            if (tiempoRestante <= 0) {
                terminarNivel(false);
            }
        }, 1000);
    }

    function actualizarUI() {
        if (modoPartida !== 'viaje') {
            const min = Math.floor(tiempoRestante / 60);
            const seg = tiempoRestante % 60;
            const segStr = seg < 10 ? `0${seg}` : seg;
            displayReloj.textContent = `0${min}:${segStr}`;
        }
        displayPuntos.textContent = `${Math.round(puntosGlobales)} pts`;
    }

    function terminarNivel(completado) {
        partidaEnCurso = false;
        cancelarCountdown();
        clearInterval(intervaloReloj);
        reproductorAudio.pause();
        reproductorAudio.style.display = 'none';
        inputCaptura.blur();

        let motivoFin = 'completado';
        let caracteresAvanzados = 0;
        let progreso = 100;
        
        if (completado) {
            caracteresAvanzados = textoCompleto.length;
            progreso = 100;
            puntosGlobales += 50;
            actualizarUI();
            SoundFX.victoria();
        } else {
            if (tiempoRestante <= 0 && modoPartida !== 'viaje') {
                motivoFin = 'tiempo';
            } else {
                motivoFin = 'vidas';
            }

            for (let b = 0; b < indiceBloqueActual && b < bloquesDeTexto.length; b++) {
                caracteresAvanzados += bloquesDeTexto[b].length;
            }
            caracteresAvanzados += Math.min(indiceActual, (bloquesDeTexto[indiceBloqueActual] ? bloquesDeTexto[indiceBloqueActual].length : 0));
            caracteresAvanzados = Math.min(caracteresAvanzados, textoCompleto.length);
            progreso = Math.min(99, Math.max(0, Math.round((caracteresAvanzados / (textoCompleto.length || 1)) * 100)));
            SoundFX.error();
        }

        const puntosFinales = Math.round(puntosGlobales);
        if (window.TPTui && window.TPTui.sumarPuntos) {
            window.TPTui.sumarPuntos(puntosFinales);
        }

        const tiempoUsado = Math.max(1, tiempoInicial - tiempoRestante);
        const caracteresParaWpm = completado ? textoCompleto.length : caracteresAvanzados;
        const palabras = Math.max(1, Math.round(caracteresParaWpm / 5));
        const wpm = tiempoUsado > 0 ? Math.round(palabras / (tiempoUsado / 60 || 0.5)) : 0;
            
        const totalPulsaciones = caracteresCorrectos + erroresCometidos;
        const precision = totalPulsaciones > 0 
            ? Math.round((caracteresCorrectos / totalPulsaciones) * 100) 
            : 100;

        if (modalResultado) {
            resultadoIcono.textContent = '';
            resultadoIcono.style.display = 'none';
            if (completado) {
                resultadoTitulo.textContent = window.TPTi18n ? window.TPTi18n.t('resultado.completado_titulo') : '¡Nivel Completado!';
                resultadoTitulo.style.color = 'var(--azul)';
                resultadoSubtitulo.textContent = window.TPTi18n ? window.TPTi18n.t('resultado.completado_sub') : 'Excelente destreza mecanográfica';
            } else if (motivoFin === 'tiempo') {
                resultadoTitulo.textContent = window.TPTi18n ? window.TPTi18n.t('resultado.tiempo_titulo') : '¡Tiempo Agotado!';
                resultadoTitulo.style.color = 'var(--rojo-error)';
                resultadoSubtitulo.textContent = window.TPTi18n ? window.TPTi18n.t('resultado.tiempo_sub') : 'El tiempo se terminó. ¡Sigue practicando para mejorar tu velocidad!';
            } else {
                resultadoTitulo.textContent = window.TPTi18n ? window.TPTi18n.t('resultado.vidas_titulo') : '¡Sin Vidas!';
                resultadoTitulo.style.color = 'var(--rojo-error)';
                resultadoSubtitulo.textContent = window.TPTi18n ? window.TPTi18n.t('resultado.vidas_sub') : 'Agotaste tus oportunidades. ¡Concéntrate en la precisión!';
            }
            
            // Reflejar la barra de progreso y estado en el modal
            const resultadoProgresoTexto = document.getElementById('resultado-progreso-texto');
            const resultadoProgresoBarra = document.getElementById('resultado-progreso-barra');
            if (resultadoProgresoTexto && resultadoProgresoBarra) {
                resultadoProgresoBarra.style.width = `${progreso}%`;
                if (completado) {
                    resultadoProgresoTexto.textContent = window.TPTi18n 
                        ? window.TPTi18n.t('resultado.progreso_completado') 
                        : '100% (Completado con éxito)';
                    resultadoProgresoTexto.className = 'resultado-progreso-valor completado';
                    resultadoProgresoBarra.className = 'resultado-progreso-barra-fill completado';
                } else {
                    let txtIncompleto = '';
                    if (window.TPTi18n) {
                        if (motivoFin === 'vidas') {
                            txtIncompleto = window.TPTi18n.t('resultado.progreso_incompleto_vidas', { progreso: progreso });
                        } else if (motivoFin === 'tiempo') {
                            txtIncompleto = window.TPTi18n.t('resultado.progreso_incompleto_tiempo', { progreso: progreso });
                        } else {
                            txtIncompleto = window.TPTi18n.t('resultado.progreso_incompleto', { progreso: progreso });
                        }
                    } else {
                        txtIncompleto = `${progreso}% (Incompleto • ${motivoFin === 'vidas' ? 'Sin vidas' : 'Tiempo agotado'})`;
                    }
                    resultadoProgresoTexto.textContent = txtIncompleto;
                    resultadoProgresoTexto.className = 'resultado-progreso-valor incompleto';
                    resultadoProgresoBarra.className = 'resultado-progreso-barra-fill incompleto';
                }
            }

            resultadoWpm.textContent = `${wpm}`;
            resultadoPrecision.textContent = `${precision}%`;
            resultadoErrores.textContent = `${erroresCometidos}`;
            resultadoPuntos.textContent = `+${puntosFinales} pts`;

            if (window.TPTui && window.TPTui.prepararCertificadoResultado) {
                window.TPTui.prepararCertificadoResultado({
                    completado: completado,
                    progreso: progreso,
                    motivoFin: motivoFin,
                    caracteresAvanzados: caracteresAvanzados,
                    caracteresTotales: textoCompleto.length,
                    nivel: nivelActivo,
                    wpm: wpm,
                    precision: precision,
                    errores: erroresCometidos,
                    tiempoUsado: tiempoUsado,
                    puntos: puntosFinales,
                    modo: modoPartida
                });
            }

            btnReintentarNivel.onclick = () => {
                modalResultado.classList.add('vista-oculta');
                iniciarNivel(nivelActivo);
            };

            btnContinuarResultado.onclick = () => {
                modalResultado.classList.add('vista-oculta');
                btnContinuarResultado.onclick = null;
                btnReintentarNivel.onclick = null;

                if (completado) {
                    if (window.TPTui && window.TPTui.mostrarNarrativa) {
                        window.TPTui.mostrarNarrativa('fin', nivelActivo, () => {
                            window.TPTui.cambiarVista('menu');
                        });
                    } else if (window.TPTui) {
                        window.TPTui.cambiarVista('menu');
                    }
                } else {
                    if (window.TPTui) window.TPTui.cambiarVista('menu');
                }
            };

            modalResultado.classList.remove('vista-oculta');
        } else {
            if (completado && window.TPTui && window.TPTui.mostrarNarrativa) {
                window.TPTui.mostrarNarrativa('fin', nivelActivo, () => window.TPTui.cambiarVista('menu'));
            } else if (window.TPTui) {
                window.TPTui.cambiarVista('menu');
            }
        }
    }

    // --- ENTRADA DE TECLADO FÍSICO / MÓVIL --- //
    inputCaptura.addEventListener('input', (e) => {
        if (!partidaEnCurso) {
            e.target.value = "";
            return;
        }

        const letraTecleada = e.target.value.slice(-1);
        if (!letraTecleada || indiceActual >= fraseActual.length) {
            e.target.value = "";
            return;
        }

        const spanActual = document.getElementById(`c${indiceActual}`);
        
        mascotaDisplay.classList.add('mascota-escribiendo');
        setTimeout(() => mascotaDisplay.classList.remove('mascota-escribiendo'), 80);

        if (letraTecleada === fraseActual[indiceActual]) {
            if (spanActual) spanActual.classList.add('correct');
            caracteresCorrectos++;
            rachaCombo++;
            if (rachaCombo > rachaMaxima) rachaMaxima = rachaCombo;
            const multiplicador = obtenerMultiplicadorCombo(rachaCombo);
            puntosGlobales += multiplicador;
            SoundFX.tecleo();
            actualizarComboUI();
            actualizarUI();
        } else {
            if (spanActual) spanActual.classList.add('wrong');
            erroresCometidos++;
            rachaCombo = 0;
            SoundFX.error();
            actualizarComboUI();

            if (modoPartida === 'vital' || modoPartida === 'dificil') {
                vidasActuales--;
                actualizarVidasUI();
                if (vidasActuales <= 0) {
                    terminarNivel(false);
                    e.target.value = "";
                    return;
                }
            }
        }

        if (spanActual) spanActual.classList.remove('current');
        indiceActual++;

        if (indiceActual < fraseActual.length) {
            const sigSpan = document.getElementById(`c${indiceActual}`);
            if (sigSpan) sigSpan.classList.add('current');
        } else {
            indiceBloqueActual++;
            if (indiceBloqueActual < bloquesDeTexto.length) {
                pintarBloqueActual();
            } else {
                terminarNivel(true);
            }
        }
        
        e.target.value = ""; 
    });

    if (areaJuegoClic) {
        areaJuegoClic.addEventListener('click', () => {
            if (partidaEnCurso) inputCaptura.focus();
        });
        areaJuegoClic.addEventListener('touchstart', () => {
            if (partidaEnCurso) inputCaptura.focus();
        });
    }

    window.TPTengine = {
        iniciar: iniciarNivel,
        detener: () => {
            partidaEnCurso = false;
            cancelarCountdown();
            clearInterval(intervaloReloj);
            reproductorAudio.pause();
            reproductorAudio.style.display = 'none';
        }
    };
});