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
            btnToggleSonido.textContent = SoundFX.activado ? 'Sonido: ON' : 'Sonido: OFF';
            btnToggleSonido.title = SoundFX.activado ? 'Desactivar sonido' : 'Activar sonido';
        });
    }

    if (btnToggleGuia && imgTeclado) {
        btnToggleGuia.addEventListener('click', () => {
            imgTeclado.classList.toggle('guia-oculta');
            const oculta = imgTeclado.classList.contains('guia-oculta');
            btnToggleGuia.textContent = oculta ? 'Guía: OFF' : 'Guía: ON';
        });
    }

    // Control y Atajo de Pausar Canción (Alt + P)
    function alternarPausaCancion() {
        if (!nivelActivo || !nivelActivo.archivoAudio || !reproductorAudio) return;
        if (reproductorAudio.paused) {
            reproductorAudio.play().catch(() => {});
            if (btnControlAudio) btnControlAudio.innerHTML = `Pausar Música <small>[Alt + P]</small>`;
        } else {
            reproductorAudio.pause();
            if (btnControlAudio) btnControlAudio.innerHTML = `Reanudar Música <small>[Alt + P]</small>`;
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
            if (btnControlAudio) btnControlAudio.innerHTML = `Pausar Música <small>[Alt + P]</small>`;
        });
        reproductorAudio.addEventListener('pause', () => {
            if (btnControlAudio) btnControlAudio.innerHTML = `Reanudar Música <small>[Alt + P]</small>`;
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
            displayVidas.textContent = `Vidas: ${vidasActuales} / ${vidasMaximas}`;
        } else {
            displayVidas.style.display = 'none';
        }
    }

    function actualizarComboUI() {
        if (!displayCombo) return;
        if (rachaCombo >= 5) {
            displayCombo.textContent = `Combo x${rachaCombo}`;
            displayCombo.classList.add('combo-activo');
        } else {
            displayCombo.classList.remove('combo-activo');
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
            if (btnToggleGuia) btnToggleGuia.textContent = guiaActiva ? 'Guía: ON' : 'Guía: OFF';
            if (btnToggleSonido) btnToggleSonido.textContent = SoundFX.activado ? 'Sonido: ON' : 'Sonido: OFF';
        }

        // Control de audio
        if (nivel.archivoAudio) {
            const audioUrl = URL.createObjectURL(nivel.archivoAudio);
            reproductorAudio.src = audioUrl;
            reproductorAudio.style.display = 'block';
            if (window.TPTConfig && window.TPTConfig.volumenNiveles != null) {
                reproductorAudio.volume = window.TPTConfig.volumenNiveles / 100;
            }
            if (btnControlAudio) {
                btnControlAudio.style.display = 'inline-flex';
                btnControlAudio.innerHTML = `Pausar Música <small>[Alt + P]</small>`;
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
                countdownNumero.textContent = "¡ESCRIBE!";
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
        displayPuntos.textContent = `${puntosGlobales} pts`;
    }

    function terminarNivel(completado) {
        partidaEnCurso = false;
        cancelarCountdown();
        clearInterval(intervaloReloj);
        reproductorAudio.pause();
        reproductorAudio.style.display = 'none';
        inputCaptura.blur();
        
        if (completado) {
            puntosGlobales += 50;
            actualizarUI();
            SoundFX.victoria();
        } else {
            SoundFX.error();
        }

        if (window.TPTui && window.TPTui.sumarPuntos) {
            window.TPTui.sumarPuntos(puntosGlobales);
        }

        const tiempoUsado = Math.max(1, tiempoInicial - tiempoRestante);
        const palabras = Math.max(1, Math.round(textoCompleto.length / 5));
        const wpm = Math.round(palabras / (tiempoUsado / 60 || 0.5));
            
        const totalPulsaciones = caracteresCorrectos + erroresCometidos;
        const precision = totalPulsaciones > 0 
            ? Math.round((caracteresCorrectos / totalPulsaciones) * 100) 
            : 100;

        if (modalResultado) {
            resultadoIcono.textContent = '';
            resultadoIcono.style.display = 'none';
            resultadoTitulo.textContent = completado ? '¡Nivel Superado!' : '¡Desafío Fallido!';
            resultadoTitulo.style.color = completado ? 'var(--azul)' : 'var(--rojo-error)';
            resultadoSubtitulo.textContent = completado 
                ? '¡Gran velocidad y ritmo mecanográfico!' 
                : 'Se acabaron las vidas o el tiempo límite. ¡Sigue practicando!';
            
            resultadoWpm.textContent = `${wpm}`;
            resultadoPrecision.textContent = `${precision}%`;
            resultadoErrores.textContent = `${erroresCometidos}`;
            resultadoPuntos.textContent = `+${puntosGlobales} pts`;

            if (window.TPTui && window.TPTui.prepararCertificadoResultado) {
                window.TPTui.prepararCertificadoResultado({
                    completado: completado,
                    nivel: nivelActivo,
                    wpm: wpm,
                    precision: precision,
                    errores: erroresCometidos,
                    tiempoUsado: tiempoUsado,
                    puntos: puntosGlobales,
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

        if (letraTecleada.toLowerCase() === fraseActual[indiceActual].toLowerCase()) {
            if (spanActual) spanActual.classList.add('correct');
            puntosGlobales += 1;
            caracteresCorrectos++;
            rachaCombo++;
            if (rachaCombo > rachaMaxima) rachaMaxima = rachaCombo;
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