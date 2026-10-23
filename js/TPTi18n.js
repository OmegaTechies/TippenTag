// ==========================================================================
// js/TPTi18n.js - Tippen Tag (DenkKraft)
// Sistema de Internacionalización (i18n): Español (es) / Alemán (de)
// Traducción completa de interfaz, tienda, diálogos, atajos y portal docente
// ==========================================================================

const TPTi18n = (function() {
    const STORAGE_KEY = 'tippen_tag_lang';
    let idiomaActual = localStorage.getItem(STORAGE_KEY) || 'es';

    const DICCIONARIO = {
        es: {
            // General / Común
            "app.titulo": "Tippen Tag",
            "app.lema": "Denken. Spielen. Wachsen.",
            "comun.aceptar": "Aceptar",
            "comun.cancelar": "Cancelar",
            "comun.continuar": "Continuar",
            "comun.siguiente": "Siguiente",
            "comun.anterior": "Anterior",
            "comun.volver": "← Volver",
            "comun.guardar": "Guardar",
            "comun.eliminar": "Eliminar",
            "comun.limpiar": "Limpiar",
            "comun.cerrar": "Cerrar",
            "comun.gratis": "Gratis",
            "comun.puntos": "pts",
            "comun.vidas": "Vidas",
            "comun.tiempo": "Tiempo",
            "comun.modo": "Modo",
            "comun.oficial": "DENKKRAFT",
            "comun.comunidad": "Comunidad",
            "comun.activo": "Activada",
            "comun.desactivado": "Desactivada",
            "comun.on": "ON",
            "comun.off": "OFF",
            "comun.ant_corto": "‹ Ant",
            "comun.sig_corto": "Sig ›",
            "comun.primera_title": "Primera página",
            "comun.anterior_title": "Página anterior",
            "comun.siguiente_title": "Página siguiente",
            "comun.ultima_title": "Última página",

            // Topbars
            "topbar.musica": "Música: {estado}",
            "topbar.ajustes": "Ajustes",
            "topbar.portal_docente": "Portal Docente",
            "topbar.atajos": "Atajos y Guías",
            "topbar.tienda": "Tienda",
            "topbar.cambiar_jugador": "Cambiar Jugador",
            "topbar.crear_nivel": "+ Crear Nuevo Nivel",
            "topbar.idioma_btn": "🇩🇪 DE",
            "topbar.idioma_title": "Sprache wechseln / Cambiar idioma",

            // Landing
            "landing.guia_mecanografia": "Guía de Mecanografía",
            "landing.cargando_consejos": "Cargando consejos...",
            "landing.selecciona_jugador": "Selecciona tu Jugador",
            "landing.nuevo_perfil": "Nuevo Perfil",
            "landing.crear_jugador": "Crear Jugador",
            "landing.pagina_indicador": "Página {actual} de {total}",

            // Crear Usuario
            "usuario.chip": "Nuevo Jugador",
            "usuario.titulo": "Crear Perfil",
            "usuario.nombre_label": "Nombre o Apodo:",
            "usuario.nombre_ph": "Ej: Alex",
            "usuario.avatar_label": "Foto de Perfil (Opcional):",
            "usuario.avatar_drop": "Arrastra una imagen aquí o <u>haz clic para elegir</u>",
            "usuario.btn_cancelar": "Cancelar",
            "usuario.btn_crear": "Crear Perfil",
            "usuario.o_importar": "o si ya tienes un perfil guardado",
            "usuario.btn_importar": "Importar Perfil (.tptuser)",

            // Perfiles Importar / Exportar
            "perfil.exportar_sin_usuario": "Debes tener un perfil seleccionado o activo para exportarlo.",
            "perfil.exportar_exito": "¡Perfil de \"{nombre}\" exportado correctamente!",
            "perfil.importar_exito": "¡Perfil de \"{nombre}\" importado con éxito con {puntos} puntos!",
            "perfil.importar_error_firma": "¡Alerta de Seguridad: La firma digital del perfil no coincide! El archivo fue modificado manualmente o está corrupto. Para garantizar juego limpio, no se puede importar.",
            "perfil.importar_error_formato": "El archivo seleccionado no es un respaldo de perfil válido (.tptuser) de Tippen Tag.",

            // Menú Principal
            "menu.buscar_ph": "Buscar por título o contenido...",
            "menu.filtrar_label": "Filtrar:",
            "menu.filtro_todas": "Todas",
            "menu.filtro_facil": "Fácil",
            "menu.filtro_normal": "Normal",
            "menu.filtro_dificil": "Difícil",
            "menu.importar_drop": "Arrastra un archivo <strong>.json</strong> de nivel aquí o <u>haz clic para importar</u>",
            "menu.sin_niveles": "No se encontraron lecciones que coincidan con la búsqueda.",
            "menu.card_jugar": "Jugar",
            "menu.card_editar": "Editar",
            "menu.card_exportar": "Exportar",
            "menu.card_editar_title": "Editar o eliminar este nivel",
            "menu.card_exportar_title": "Exportar como archivo .json",
            "menu.reset_filtros": "Restablecer Filtros y Búsqueda",
            "badge.facil": "FÁCIL",
            "badge.normal": "NORMAL",
            "badge.dificil": "DIFÍCIL",
            "badge.audio": "Audio",
            "badge.oficial": "DenkKraft",
            "badge.comunidad": "Comunidad",
            "badge.creador_title": "Creador: {autor} (ID: {id})",
            "menu.paginacion": "Página {actual} de {total} ({cant} niv.)",
            "menu.ir_a_pagina": "Ir a la página {num}",

            // Pre-Juego / Lobby
            "prejuego.chip": "Sala de Preparación",
            "prejuego.desc": "Ajusta tu modo de desafío activando o desactivando los iconos:",
            "prejuego.mod_original": "Original",
            "prejuego.mod_tiempo": "Tiempo",
            "prejuego.mod_vidas": "Vidas",
            "prejuego.mod_viaje": "Viaje",
            "prejuego.ajustar_tiempo": "Ajustar Tiempo Límite (Segundos):",
            "prejuego.volver_menu": "← Volver al Menú",
            "prejuego.iniciar": "¡Comenzar Nivel!",

            // Modo descripciones
            "modo.desc_original_viaje": "Modo Original del Nivel: VIAJE (Sin límite de tiempo ni vidas)",
            "modo.desc_original_vital": "Modo Original del Nivel: VITAL ({vidas} vidas)",
            "modo.desc_original_dificil": "Modo Original del Nivel: DIFÍCIL ({tiempo}s / {vidas} vidas)",
            "modo.desc_original_tiempo": "Modo Original del Nivel: CONTRARRELOJ ({tiempo}s)",
            "modo.desc_viaje": "Modo Viaje: Relajación total, sin límites de tiempo ni vidas.",
            "modo.desc_vital": "Modo Vital: Sin límite de tiempo, pero pierdes si agotas tus vidas.",
            "modo.desc_dificil": "Modo Difícil: Desafío estricto con tiempo y vidas activas.",
            "modo.desc_tiempo": "Modo Contrarreloj: Completa el texto antes de que acabe el tiempo.",

            // Juego / Motor
            "juego.abandonar": "← Abandonar",
            "juego.pausar_audio": "Pausar Música",
            "juego.reanudar_audio": "Reanudar Música",
            "juego.atajos": "Atajos",
            "juego.guia_btn": "Guía: {estado}",
            "juego.sonido_btn": "Sonido: {estado}",
            "juego.vidas": "Vidas: {actual} / {max}",
            "juego.combo": "Combo x{num}",
            "juego.escribe": "¡ESCRIBE!",

            // Resultados
            "resultado.completado_titulo": "¡Nivel Completado!",
            "resultado.completado_sub": "Excelente destreza mecanográfica",
            "resultado.tiempo_titulo": "¡Tiempo Agotado!",
            "resultado.tiempo_sub": "El tiempo se terminó. ¡Sigue practicando para mejorar tu velocidad!",
            "resultado.vidas_titulo": "¡Sin Vidas!",
            "resultado.vidas_sub": "Agotaste tus oportunidades. ¡Concéntrate en la precisión!",
            "resultado.progreso_etiqueta": "Progreso de la Lección",
            "resultado.progreso_completado": "100% (Completado con éxito)",
            "resultado.progreso_incompleto_vidas": "{progreso}% (Incompleto • Sin vidas)",
            "resultado.progreso_incompleto_tiempo": "{progreso}% (Incompleto • Tiempo agotado)",
            "resultado.progreso_incompleto": "{progreso}% (Lección Incompleta)",
            "resultado.wpm": "WPM (Velocidad)",
            "resultado.precision": "Precisión",
            "resultado.errores": "Errores",
            "resultado.puntos_ganados": "Puntos Ganados",
            "resultado.academico_titulo": "Certificación Académica para Entrega al Profesor",
            "resultado.academico_sello": "Sello de Autenticidad",
            "resultado.academico_desc": "Genera tu código seguro de entrega con tu nombre y métricas verificado contra alteraciones:",
            "resultado.copiar_codigo": "Copiar Código para Profesor",
            "resultado.descargar_cert": "Descargar Certificado",
            "resultado.copiado_exito": "✓ ¡Código verificado copiado al portapapeles!",
            "resultado.reintentar": "Reintentar",
            "resultado.continuar": "Continuar",

            // Narrativa / Cinemática
            "narrativa.badge": "Cinemática de Historia",
            "narrativa.saltar": "Saltar",
            "narrativa.hablante_narrador": "Narrador",
            "narrativa.hablante_momoye": "Momoye el Ladrón de Textos",
            "narrativa.hablante_victoria": "Victoria",
            "narrativa.hablante_mision": "Misión",

            // Creador
            "creador.titulo": "Estudio de Creación de Niveles",
            "creador.subtitulo": "Crea o edita guiones mecanográficos personalizados",
            "creador.sec_contenido": "Contenido del Nivel",
            "creador.leccion_titulo": "Título de la Lección / Canción",
            "creador.leccion_ph": "Ej: Poema a la Luna",
            "creador.dificultad": "Dificultad Sugerida",
            "creador.diff_facil": "Fácil (Palabras cortas y simples)",
            "creador.diff_normal": "Normal (Frases y puntuación)",
            "creador.diff_dificil": "Difícil (Trabalenguas y ritmo rápido)",
            "creador.texto_label": "Texto a Mecanografiar",
            "creador.texto_ph": "Escribe o pega aquí el texto que el jugador deberá teclear...",
            "creador.texto_ayuda": "El motor dividirá automáticamente los textos largos en bloques de lectura cómodos.",
            "creador.sec_reglas": "Reglas y Modos de Juego",
            "creador.modo_base": "Modo de Juego Base",
            "creador.modo_viaje": "Viaje (Sin límites de tiempo ni vidas)",
            "creador.modo_normal": "Normal (Por tiempo límite)",
            "creador.modo_vital": "Vital (Por vidas / fallos)",
            "creador.modo_dificil": "Difícil (Tiempo estricto y vidas)",
            "creador.tiempo_limite": "Tiempo Límite (Segundos)",
            "creador.vidas_max": "Cantidad de Vidas (Modo Vital o Difícil)",
            "creador.sec_audio": "Audio y Dictado (Opcional)",
            "creador.audio_label": "Pista de Audio o Canción (MP3 / WAV / OGG):",
            "creador.audio_drop": "Arrastra una canción o dictado aquí o <u>haz clic para elegir</u>",
            "creador.audio_ayuda": "Ideal para dictados rítmicos o canciones al estilo osu!",
            "creador.sec_narrativa": "Historia de Momoye (Opcional)",
            "creador.dialogo_inicio": "Diálogos de Inicio",
            "creador.dialogo_inicio_ph": "Ej: ¡El Momoye escapó! | ¡Recupera este texto antes de que sea tarde! (Separa diálogos con '|')",
            "creador.img_inicio": "Imagen de Inicio (Opcional):",
            "creador.img_inicio_drop": "Arrastra una imagen de inicio o <u>haz clic</u>",
            "creador.dialogo_fin": "Diálogos de Victoria",
            "creador.dialogo_fin_ph": "Ej: ¡Victoria! | El Momoye aprendió la lección. (Separa diálogos con '|')",
            "creador.img_fin": "Imagen de Victoria (Opcional):",
            "creador.img_fin_drop": "Arrastra una imagen de fin o <u>haz clic</u>",
            "creador.animacion_golpe": "Habilitar animación especial de la Mascota golpeando a Momoye al ganar",
            "creador.eliminar_btn": "Eliminar Nivel",
            "creador.guardar_btn": "Guardar Nivel",

            // Tienda
            "tienda.tag": "DenkKraft Bazar",
            "tienda.titulo": "Tienda de Tippen Tag",
            "tienda.subtitulo": "Personaliza a tus mascotas rítmicas y el ambiente de tus partidas",
            "tienda.tab_mascotas": "Mascotas",
            "tienda.tab_temas": "Temas Visuales",
            "tienda.tipo_mascota": "Mascota Compañera",
            "tienda.tipo_tema": "Tema Visual",
            "tienda.precio": "Precio:",
            "tienda.equipado": "Equipado",
            "tienda.equipar": "Equipar",
            "tienda.comprar": "Comprar ({precio} pts)",
            "tienda.adquirido": "Adquirido",
            "tienda.gratis": "Gratis",
            "tienda.gratuito": "Gratuito",
            "tienda.salir": "Salir de la Tienda",
            "tienda.falta_puntos": "Te faltan {faltantes} puntos para desbloquear \"{nombre}\". ¡Sigue jugando lecciones para conseguir más puntos!",
            "tienda.puntos_insuficientes": "Puntos Insuficientes",

            // Ajustes
            "ajustes.titulo": "Ajustes Generales",
            "ajustes.bgm_menu_titulo": "Música de Fondo del Menú",
            "ajustes.bgm_menu_desc": "Música ambiental mientras navegas por los niveles y opciones",
            "ajustes.pista_config": "Pista de audio configurada:",
            "ajustes.sin_pista": "Sin pista asignada",
            "ajustes.musica_nombre": "Música: TPT Main Theme",
            "ajustes.musica_credito": "Aportada por: Zhailox",
            "ajustes.bgm_niveles_titulo": "Volumen de Canciones en Niveles",
            "ajustes.bgm_niveles_desc": "Volumen de las pistas musicales y dictados al jugar niveles",
            "ajustes.sfx_titulo": "Efectos de Sonido (SFX)",
            "ajustes.sfx_desc": "Sonidos de tecleo correcto, errores, combos y fanfarria de victoria",
            "ajustes.guia_titulo": "Guía Visual de Dedos en Partida",
            "ajustes.guia_desc": "Mostrar por defecto la imagen de dedos y teclas al empezar a jugar",
            "ajustes.tier_titulo": "Versión / Edición del Juego (DLCs)",
            "ajustes.tier_desc": "Alterna entre los 3 tiers comerciales para comprobar las funciones activas",
            "ajustes.escala_titulo": "Tamaño de Texto y Accesibilidad",
            "ajustes.escala_desc": "Aumenta o reduce el tamaño base de las letras en pantalla",
            "ajustes.idioma_titulo": "Idioma del Sistema / Systemsprache",
            "ajustes.idioma_desc": "Selecciona entre Español y Alemán para los textos de la interfaz",
            "ajustes.perfil_respaldo_titulo": "Respaldo y Transferencia de Perfil",
            "ajustes.perfil_respaldo_desc": "Exporta tu perfil de forma segura con firma criptográfica o restaura un perfil guardado",
            "ajustes.btn_exportar_perfil": "Exportar Perfil (.tptuser)",
            "ajustes.btn_importar_perfil": "Importar Perfil (.tptuser)",
            "ajustes.guardar_btn": "Aceptar y Guardar",

            // Portal Docente
            "docente.badge": "DenkKraft Académico",
            "docente.badge_completado": "✓ Completado (100%)",
            "docente.badge_incompleto": "✕ Incompleto ({progreso}%)",
            "docente.titulo": "Portal del Docente / Validador de Calificaciones",
            "docente.cerrar_title": "Cerrar portal docente",
            "docente.instruccion": "Ingresa el código seguro generado por el estudiante o arrastra su archivo de certificado (<strong>.tptcert</strong>). El sistema verificará la autenticidad matemática de las métricas de tecleo, fecha, nombre del alumno e ID de lección contra cualquier tipo de manipulación.",
            "docente.comparar_label": "Verificar contra Lección del Plan de Estudios (Opcional):",
            "docente.comparar_auto": "-- Detección Automática de Lección --",
            "docente.codigo_label": "Código Seguro del Estudiante:",
            "docente.codigo_ph": "Pega aquí el código seguro del alumno (ej: TPT-CERT.eyJlc3R1ZGlhbnRl...)...",
            "docente.drop_texto": "O arrastra el archivo de certificado <strong>.tptcert</strong> o <strong>.json</strong> aquí",
            "docente.btn_demo_valido": "Cargar Ejemplo Válido",
            "docente.btn_demo_alterado": "Probar Detección de Trampa",
            "docente.btn_verificar": "Verificar Autenticidad",
            "docente.btn_limpiar": "Limpiar",
            "docente.btn_cerrar": "Cerrar Validador",
            "docente.reporte_valido_titulo": "Certificado Oficial Verificado",
            "docente.reporte_valido_sub": "Firma HMAC-SHA256 íntegra. Las métricas no han sido manipuladas.",
            "docente.declaracion": "El estudiante <strong>{estudiante}</strong> completó exitosamente la lección <strong>\"{nivel}\"</strong> con una velocidad de <strong>{wpm} WPM</strong> y <strong>{precision}%</strong> de precisión.",
            "docente.declaracion_completado": "El estudiante <strong>{estudiante}</strong> completó exitosamente el 100% de la lección <strong>\"{nivel}\"</strong> con <strong>{wpm} WPM</strong> y <strong>{precision}%</strong> de precisión.",
            "docente.declaracion_incompleto": "El estudiante <strong>{estudiante}</strong> completó el <strong>{progreso}%</strong> de la lección <strong>\"{nivel}\"</strong> con <strong>{wpm} WPM</strong> y <strong>{precision}%</strong> de precisión ({motivo}).",
            "docente.motivo_vidas": "Interrumpido por agotamiento de vidas",
            "docente.motivo_tiempo": "Interrumpido por tiempo límite agotado",
            "docente.motivo_incompleto": "Nivel no completado en su totalidad",
            "docente.lbl_estado_entrega": "Estado de Finalización",
            "docente.lbl_progreso_nivel": "Progreso Alcanzado",
            "docente.val_completado": "✓ Completado (100%)",
            "docente.val_incompleto": "✕ Incompleto ({progreso}%)",
            "docente.lbl_estudiante": "Estudiante",
            "docente.lbl_nivel": "Lección Evaluada",
            "docente.lbl_id_nivel": "ID de Lección",
            "docente.lbl_velocidad": "Velocidad Final",
            "docente.lbl_precision": "Precisión",
            "docente.lbl_errores": "Errores",
            "docente.lbl_fecha": "Fecha de Emisión",
            "docente.lbl_firma": "Firma Digital",
            "docente.reporte_invalido_titulo": "¡Certificado Alterado o Falso!",
            "docente.reporte_invalido_sub": "Firma digital no coincide. Posible intento de manipulación detectado.",
            "docente.err_formato": "El código ingresado no cumple con el formato oficial de certificado de Tippen Tag.",
            "docente.suplantacion_titulo": "⚠️ Alerta de Posible Suplantación de Nivel",
            "docente.suplantacion_texto": "El certificado pertenece a una lección diferente a la esperada por el docente.",
            "docente.esperado": "Esperado:",
            "docente.presentado": "Presentado:",

            // Guía de Atajos
            "guia.titulo": "Guía de Teclas, Acentos y Atajos",
            "guia.acentos_titulo": "Cómo Escribir Acentos y Tildes (á, é, í, ó, ú)",
            "guia.acentos_intro": "En teclados con distribución en español, las tildes se introducen pulsando dos teclas en orden secuencial:",
            "guia.paso1": "Presiona y suelta la tecla de tilde <kbd class=\"tecla-badge\">´</kbd> (ubicada justo a la derecha de la letra <kbd class=\"tecla-badge\">P</kbd>). No aparecerá nada aún en pantalla porque es una tecla de acentuación previa.",
            "guia.paso2": "A continuación, presiona la vocal que deseas acentuar: <kbd class=\"tecla-badge\">A</kbd>, <kbd class=\"tecla-badge\">E</kbd>, <kbd class=\"tecla-badge\">I</kbd>, <kbd class=\"tecla-badge\">O</kbd> o <kbd class=\"tecla-badge\">U</kbd>. La letra aparecerá con su tilde: <strong>á, é, í, ó, ú</strong>.",
            "guia.paso3": "Para vocales mayúsculas con tilde: presiona <kbd class=\"tecla-badge\">´</kbd> (suelta), mantén presionado <kbd class=\"tecla-badge\">Shift</kbd> y pulsa la vocal → <strong>Á, É, Í, Ó, Ú</strong>.",
            "guia.signos_titulo": "Signos y Puntuación Frecuentes",
            "guia.atajos_titulo": "Atajos Rápidos de Tippen Tag",
            "guia.atajo_musica": "Pausar / Reanudar Música",
            "guia.atajo_reenfocar": "Reenfocar Teclado",
            "guia.atajo_reenfocar_desc": "Clic en la pantalla",
            "guia.atajo_guia": "Alternar Guía de Dedos",
            "guia.atajo_sonido": "Efectos de Sonido",
            "guia.atajo_importar": "Importar Nivel",
            "guia.atajo_importar_desc": "Arrastra archivo .json",
            "guia.entendido": "Entendido y Volver"
        },
        de: {
            // General / Común
            "app.titulo": "Tippen Tag",
            "app.lema": "Denken. Spielen. Wachsen.",
            "comun.aceptar": "OK",
            "comun.cancelar": "Abbrechen",
            "comun.continuar": "Weiter",
            "comun.siguiente": "Weiter",
            "comun.anterior": "Zurück",
            "comun.volver": "← Zurück",
            "comun.guardar": "Speichern",
            "comun.eliminar": "Löschen",
            "comun.limpiar": "Leeren",
            "comun.cerrar": "Schließen",
            "comun.gratis": "Kostenlos",
            "comun.puntos": "Pkt",
            "comun.vidas": "Leben",
            "comun.tiempo": "Zeit",
            "comun.modo": "Modus",
            "comun.oficial": "DENKKRAFT",
            "comun.comunidad": "Community",
            "comun.activo": "Aktiviert",
            "comun.desactivado": "Deaktiviert",
            "comun.on": "AN",
            "comun.off": "AUS",
            "comun.ant_corto": "‹ Zurück",
            "comun.sig_corto": "Weiter ›",
            "comun.primera_title": "Erste Seite",
            "comun.anterior_title": "Vorherige Seite",
            "comun.siguiente_title": "Nächste Seite",
            "comun.ultima_title": "Letzte Seite",

            // Topbars
            "topbar.musica": "Musik: {estado}",
            "topbar.ajustes": "Einstellungen",
            "topbar.portal_docente": "Lehrerportal",
            "topbar.atajos": "Tastaturkürzel",
            "topbar.tienda": "Shop",
            "topbar.cambiar_jugador": "Spieler wechseln",
            "topbar.crear_nivel": "+ Neues Level erstellen",
            "topbar.idioma_btn": "🇪🇸 ES",
            "topbar.idioma_title": "Sprache wechseln / Cambiar idioma",

            // Landing
            "landing.guia_mecanografia": "Tipp-Leitfaden",
            "landing.cargando_consejos": "Lade Tipps...",
            "landing.selecciona_jugador": "Wähle deinen Spieler",
            "landing.nuevo_perfil": "Neues Profil",
            "landing.crear_jugador": "Spieler erstellen",
            "landing.pagina_indicador": "Seite {actual} von {total}",

            // Crear Usuario
            "usuario.chip": "Neuer Spieler",
            "usuario.titulo": "Profil erstellen",
            "usuario.nombre_label": "Name oder Spitzname:",
            "usuario.nombre_ph": "Z.B. Alex",
            "usuario.avatar_label": "Profilbild (Optional):",
            "usuario.avatar_drop": "Ziehe ein Bild hierher oder <u>klicke zum Auswählen</u>",
            "usuario.btn_cancelar": "Abbrechen",
            "usuario.btn_crear": "Profil erstellen",
            "usuario.o_importar": "oder falls du bereits ein Profil hast",
            "usuario.btn_importar": "Profil importieren (.tptuser)",

            // Perfiles Importar / Exportar
            "perfil.exportar_sin_usuario": "Du musst ein Profil ausgewählt oder aktiv haben, um es exportieren zu können.",
            "perfil.exportar_exito": "Profil von \"{nombre}\" erfolgreich exportiert!",
            "perfil.importar_exito": "Profil von \"{nombre}\" erfolgreich mit {puntos} Punkten importiert!",
            "perfil.importar_error_firma": "Sicherheitswarnung: Die digitale Signatur des Profils stimmt nicht überein! Die Datei wurde manipuliert. Zum Schutz vor Schummeln kann das Profil nicht importiert werden.",
            "perfil.importar_error_formato": "Die ausgewählte Datei ist kein gültiges Tippen Tag-Profil-Backup (.tptuser).",

            // Menú Principal
            "menu.buscar_ph": "Nach Titel oder Inhalt suchen...",
            "menu.filtrar_label": "Filtern:",
            "menu.filtro_todas": "Alle",
            "menu.filtro_facil": "Leicht",
            "menu.filtro_normal": "Mittel",
            "menu.filtro_dificil": "Schwer",
            "menu.importar_drop": "Ziehe eine <strong>.json</strong>-Datei hierher oder <u>klicke zum Importieren</u>",
            "menu.sin_niveles": "Keine passenden Lektionen gefunden.",
            "menu.card_jugar": "Spielen",
            "menu.card_editar": "Bearbeiten",
            "menu.card_exportar": "Exportieren",
            "menu.card_editar_title": "Dieses Level bearbeiten oder löschen",
            "menu.card_exportar_title": "Als .json-Datei exportieren",
            "menu.reset_filtros": "Filter und Suche zurücksetzen",
            "badge.facil": "LEICHT",
            "badge.normal": "MITTEL",
            "badge.dificil": "SCHWER",
            "badge.audio": "Audio",
            "badge.oficial": "DenkKraft",
            "badge.comunidad": "Community",
            "badge.creador_title": "Ersteller: {autor} (ID: {id})",
            "menu.paginacion": "Seite {actual} von {total} ({cant} Level)",
            "menu.ir_a_pagina": "Zu Seite {num} gehen",

            // Pre-Juego / Lobby
            "prejuego.chip": "Vorbereitung",
            "prejuego.desc": "Passe deinen Herausforderungsmodus über die Icons an:",
            "prejuego.mod_original": "Original",
            "prejuego.mod_tiempo": "Zeit",
            "prejuego.mod_vidas": "Leben",
            "prejuego.mod_viaje": "Reise",
            "prejuego.ajustar_tiempo": "Zeitlimit anpassen (Sekunden):",
            "prejuego.volver_menu": "← Zurück zum Menü",
            "prejuego.iniciar": "Level starten!",

            // Modo descripciones
            "modo.desc_original_viaje": "Originalmodus: REISE (Kein Zeit- oder Lebenslimit)",
            "modo.desc_original_vital": "Originalmodus: VITAL ({vidas} Leben)",
            "modo.desc_original_dificil": "Originalmodus: SCHWER ({tiempo}s / {vidas} Leben)",
            "modo.desc_original_tiempo": "Originalmodus: ZEITANGRIFF ({tiempo}s)",
            "modo.desc_viaje": "Reisemodus: Völlige Entspannung, ohne Zeit- oder Lebensbegrenzung.",
            "modo.desc_vital": "Vitalmodus: Kein Zeitlimit, aber du verlierst bei Lebensverlust.",
            "modo.desc_dificil": "Schwerer Modus: Strenge Herausforderung mit Zeit und Leben.",
            "modo.desc_tiempo": "Zeitangriff: Beende den Text, bevor die Zeit abläuft.",

            // Juego / Motor
            "juego.abandonar": "← Verlassen",
            "juego.pausar_audio": "Musik pausieren",
            "juego.reanudar_audio": "Musik fortsetzen",
            "juego.atajos": "Kürzel",
            "juego.guia_btn": "Tastaturhilfe: {estado}",
            "juego.sonido_btn": "Ton: {estado}",
            "juego.vidas": "Leben: {actual} / {max}",
            "juego.combo": "Kombo x{num}",
            "juego.escribe": "TIPPEN!",

            // Resultados
            "resultado.completado_titulo": "Level abgeschlossen!",
            "resultado.completado_sub": "Hervorragende Tippfähigkeiten",
            "resultado.tiempo_titulo": "Zeit abgelaufen!",
            "resultado.tiempo_sub": "Die Zeit ist um. Übe weiter, um dein Tempo zu steigern!",
            "resultado.vidas_titulo": "Keine Leben mehr!",
            "resultado.vidas_sub": "Leben aufgebraucht. Konzentriere dich auf Genauigkeit!",
            "resultado.progreso_etiqueta": "Lektionsfortschritt",
            "resultado.progreso_completado": "100% (Erfolgreich abgeschlossen)",
            "resultado.progreso_incompleto_vidas": "{progreso}% (Unvollständig • Keine Leben mehr)",
            "resultado.progreso_incompleto_tiempo": "{progreso}% (Unvollständig • Zeit abgelaufen)",
            "resultado.progreso_incompleto": "{progreso}% (Unvollständige Lektion)",
            "resultado.wpm": "WPM (Tempo)",
            "resultado.precision": "Genauigkeit",
            "resultado.errores": "Fehler",
            "resultado.puntos_ganados": "Erreichte Punkte",
            "resultado.academico_titulo": "Akademisches Zertifikat zur Abgabe bei der Lehrkraft",
            "resultado.academico_sello": "Echtheitssiegel",
            "resultado.academico_desc": "Erzeuge deinen sicheren Abgabecode mit Name und Messwerten, geschützt vor Manipulation:",
            "resultado.copiar_codigo": "Code für Lehrkraft kopieren",
            "resultado.descargar_cert": "Zertifikat herunterladen",
            "resultado.copiado_exito": "✓ Verifizierter Code in die Zwischenablage kopiert!",
            "resultado.reintentar": "Wiederholen",
            "resultado.continuar": "Weiter",

            // Narrativa / Cinemática
            "narrativa.badge": "Story-Sequenz",
            "narrativa.saltar": "Überspringen",
            "narrativa.hablante_narrador": "Erzähler",
            "narrativa.hablante_momoye": "Momoye der Textdieb",
            "narrativa.hablante_victoria": "Sieg",
            "narrativa.hablante_mision": "Mission",

            // Creador
            "creador.titulo": "Level-Editor",
            "creador.subtitulo": "Erstelle oder bearbeite eigene Tipp-Skripte",
            "creador.sec_contenido": "Level-Inhalt",
            "creador.leccion_titulo": "Titel der Lektion / des Liedes",
            "creador.leccion_ph": "Z.B. Mondgedicht",
            "creador.dificultad": "Empfohlene Schwierigkeit",
            "creador.diff_facil": "Leicht (Kurze und einfache Wörter)",
            "creador.diff_normal": "Mittel (Sätze und Zeichensetzung)",
            "creador.diff_dificil": "Schwer (Zungenbrecher und hohes Tempo)",
            "creador.texto_label": "Zu tippender Text",
            "creador.texto_ph": "Schreibe oder füge hier den Text ein, den der Spieler tippen soll...",
            "creador.texto_ayuda": "Die Engine teilt lange Texte automatisch in lesbare Blöcke auf.",
            "creador.sec_reglas": "Regeln und Spielmodi",
            "creador.modo_base": "Basis-Spielmodus",
            "creador.modo_viaje": "Reise (Ohne Zeit- und Lebenslimits)",
            "creador.modo_normal": "Normal (Mit Zeitlimit)",
            "creador.modo_vital": "Vital (Mit Leben / Fehlern)",
            "creador.modo_dificil": "Schwer (Strenges Zeit- und Lebenslimit)",
            "creador.tiempo_limite": "Zeitlimit (Sekunden)",
            "creador.vidas_max": "Anzahl der Leben (Vital- oder Schwer-Modus)",
            "creador.sec_audio": "Audio und Diktat (Optional)",
            "creador.audio_label": "Audiospur oder Lied (MP3 / WAV / OGG):",
            "creador.audio_drop": "Ziehe ein Lied oder Diktat hierher oder <u>klicke zum Auswählen</u>",
            "creador.audio_ayuda": "Ideal für rhythmische Diktate oder Lieder im osu!-Stil",
            "creador.sec_narrativa": "Momoye-Geschichte (Optional)",
            "creador.dialogo_inicio": "Start-Dialoge",
            "creador.dialogo_inicio_ph": "Z.B.: Momoye ist entkommen! | Hol diesen Text zurück! (Trenne Dialoge mit '|')",
            "creador.img_inicio": "Startbild (Optional):",
            "creador.img_inicio_drop": "Ziehe ein Startbild hierher oder <u>klicke</u>",
            "creador.dialogo_fin": "Sieg-Dialoge",
            "creador.dialogo_fin_ph": "Z.B.: Sieg! | Momoye hat seine Lektion gelernt. (Trenne Dialoge mit '|')",
            "creador.img_fin": "Siegbild (Optional):",
            "creador.img_fin_drop": "Ziehe ein Endbild hierher oder <u>klicke</u>",
            "creador.animacion_golpe": "Spezielle Animation: Haustier schlägt Momoye beim Sieg",
            "creador.eliminar_btn": "Level löschen",
            "creador.guardar_btn": "Level speichern",

            // Tienda
            "tienda.tag": "DenkKraft Basar",
            "tienda.titulo": "Tippen Tag Shop",
            "tienda.subtitulo": "Passe deine Rhythmus-Haustiere und die Spielumgebung an",
            "tienda.tab_mascotas": "Haustiere",
            "tienda.tab_temas": "Visuelle Themen",
            "tienda.tipo_mascota": "Begleit-Haustier",
            "tienda.tipo_tema": "Visuelles Thema",
            "tienda.precio": "Preis:",
            "tienda.equipado": "Ausgerüstet",
            "tienda.equipar": "Ausrüsten",
            "tienda.comprar": "Kaufen ({precio} Pkt)",
            "tienda.adquirido": "Erworben",
            "tienda.gratis": "Kostenlos",
            "tienda.gratuito": "Kostenlos",
            "tienda.salir": "Shop verlassen",
            "tienda.falta_puntos": "Dir fehlen {faltantes} Punkte, um \"{nombre}\" freizuschalten. Spiele weitere Lektionen für mehr Punkte!",
            "tienda.puntos_insuficientes": "Nicht genügend Punkte",

            // Ajustes
            "ajustes.titulo": "Allgemeine Einstellungen",
            "ajustes.bgm_menu_titulo": "Hintergrundmusik im Menü",
            "ajustes.bgm_menu_desc": "Atmosphärische Musik beim Navigieren durch Menüs und Level",
            "ajustes.pista_config": "Konfigurierte Audiospur:",
            "ajustes.sin_pista": "Keine Audiospur zugewiesen",
            "ajustes.musica_nombre": "Musik: TPT Main Theme",
            "ajustes.musica_credito": "Bereitgestellt von: Zhailox",
            "ajustes.bgm_niveles_titulo": "Lautstärke der Musik in Leveln",
            "ajustes.bgm_niveles_desc": "Lautstärke der Musikspuren und Diktate während des Spiels",
            "ajustes.sfx_titulo": "Soundeffekte (SFX)",
            "ajustes.sfx_desc": "Tippgeräusche, Fehler, Kombo-Töne und Siegesfanfare",
            "ajustes.guia_titulo": "Visuelle Finger-Tastaturhilfe",
            "ajustes.guia_desc": "Beim Spielstart standardmäßig die Finger- und Tastenführung anzeigen",
            "ajustes.tier_titulo": "Spielversion / Edition (DLCs)",
            "ajustes.tier_desc": "Wechsle zwischen den 3 Editionen, um freigeschaltete Funktionen zu testen",
            "ajustes.escala_titulo": "Textgröße & Barrierefreiheit",
            "ajustes.escala_desc": "Vergrößere oder verkleinere die Schriftgröße auf dem Bildschirm",
            "ajustes.idioma_titulo": "Systemsprache / Idioma del Sistema",
            "ajustes.idioma_desc": "Wähle zwischen Deutsch und Spanisch für alle Benutzeroberflächen-Texte",
            "ajustes.perfil_respaldo_titulo": "Profil-Backup und Übertragung",
            "ajustes.perfil_respaldo_desc": "Exportiere dein Profil sicher mit kryptografischer Signatur oder stelle ein Backup wieder her",
            "ajustes.btn_exportar_perfil": "Profil exportieren (.tptuser)",
            "ajustes.btn_importar_perfil": "Profil importieren (.tptuser)",
            "ajustes.guardar_btn": "Speichern & Schließen",

            // Portal Docente
            "docente.badge": "DenkKraft Akademisch",
            "docente.badge_completado": "✓ Abgeschlossen (100%)",
            "docente.badge_incompleto": "✕ Unvollständig ({progreso}%)",
            "docente.titulo": "Lehrerportal / Noten- und Zertifikatsprüfer",
            "docente.cerrar_title": "Lehrerportal schließen",
            "docente.instruccion": "Gib den sicheren Prüfcode des Schülers ein oder ziehe die Zertifikatsdatei (<strong>.tptcert</strong>) hierher. Das System prüft die mathematische Echtheit von Tippwerten, Datum, Schülername und Lektions-ID gegen jede Manipulation.",
            "docente.comparar_label": "Gegen Lehrplan-Lektion prüfen (Optional):",
            "docente.comparar_auto": "-- Automatische Lektionserkennung --",
            "docente.codigo_label": "Sicherer Prüfcode des Schülers:",
            "docente.codigo_ph": "Füge hier den Prüfcode des Schülers ein (z.B. TPT-CERT.eyJlc3R1ZGlhbnRl...)...",
            "docente.drop_texto": "Oder ziehe die Zertifikatsdatei <strong>.tptcert</strong> oder <strong>.json</strong> hierher",
            "docente.btn_demo_valido": "Gültiges Beispiel laden",
            "docente.btn_demo_alterado": "Täuschungsversuch testen",
            "docente.btn_verificar": "Echtheit prüfen",
            "docente.btn_limpiar": "Leeren",
            "docente.btn_cerrar": "Prüfer schließen",
            "docente.reporte_valido_titulo": "Offizielles Zertifikat bestätigt",
            "docente.reporte_valido_sub": "HMAC-SHA256 Signatur intakt. Die Messwerte wurden nicht manipuliert.",
            "docente.declaracion": "Der Schüler <strong>{estudiante}</strong> hat die Lektion <strong>\"{nivel}\"</strong> erfolgreich mit <strong>{wpm} WPM</strong> und <strong>{precision}%</strong> Genauigkeit abgeschlossen.",
            "docente.declaracion_completado": "Der Schüler/Die Schülerin <strong>{estudiante}</strong> hat 100% des Levels <strong>\"{nivel}\"</strong> erfolgreich mit <strong>{wpm} WPM</strong> und <strong>{precision}%</strong> Genauigkeit abgeschlossen.",
            "docente.declaracion_incompleto": "Der Schüler/Die Schülerin <strong>{estudiante}</strong> hat <strong>{progreso}%</strong> des Levels <strong>\"{nivel}\"</strong> mit <strong>{wpm} WPM</strong> und <strong>{precision}%</strong> Genauigkeit erreicht ({motivo}).",
            "docente.motivo_vidas": "Abgebrochen wegen aufgebrauchter Leben",
            "docente.motivo_tiempo": "Abgebrochen wegen abgelaufener Zeit",
            "docente.motivo_incompleto": "Level nicht vollständig beendet",
            "docente.lbl_estado_entrega": "Abschlussstatus",
            "docente.lbl_progreso_nivel": "Erreichter Fortschritt",
            "docente.val_completado": "✓ Abgeschlossen (100%)",
            "docente.val_incompleto": "✕ Unvollständig ({progreso}%)",
            "docente.lbl_estudiante": "Schüler",
            "docente.lbl_nivel": "Geprüfte Lektion",
            "docente.lbl_id_nivel": "Lektions-ID",
            "docente.lbl_velocidad": "Endgeschwindigkeit",
            "docente.lbl_precision": "Genauigkeit",
            "docente.lbl_errores": "Fehler",
            "docente.lbl_fecha": "Ausstellungsdatum",
            "docente.lbl_firma": "Digitale Signatur",
            "docente.reporte_invalido_titulo": "Zertifikat manipuliert oder ungültig!",
            "docente.reporte_invalido_sub": "Digitale Signatur stimmt nicht überein. Manipulationsversuch erkannt.",
            "docente.err_formato": "Der eingegebene Code entspricht nicht dem offiziellen Tippen Tag-Zertifikatsformat.",
            "docente.suplantacion_titulo": "⚠️ Warnung: Mögliche Lektions-Täuschung",
            "docente.suplantacion_texto": "Das Zertifikat gehört zu einer anderen Lektion als von der Lehrkraft erwartet.",
            "docente.esperado": "Erwartet:",
            "docente.presentado": "Vorgelegt:",

            // Guía de Atajos
            "guia.titulo": "Leitfaden für Tasten, Umlaute und Tastaturkürzel",
            "guia.acentos_titulo": "Schreiben von Umlauten & Akzenten (ä, ö, ü, á, é...)",
            "guia.acentos_intro": "Tippanleitung für Sonderzeichen und Akzente im deutsch-spanischen Sprachraum:",
            "guia.paso1": "Auf deutschen Tastaturen tippe Umlaute <kbd class=\"tecla-badge\">Ä</kbd>, <kbd class=\"tecla-badge\">Ö</kbd>, <kbd class=\"tecla-badge\">Ü</kbd> und <kbd class=\"tecla-badge\">ß</kbd> direkt. Für Akzente drücke <kbd class=\"tecla-badge\">´</kbd> (neben Backspace) und danach den Vokal.",
            "guia.paso2": "Auf spanischen Tastaturen drücke zuerst die Akzent-Taste <kbd class=\"tecla-badge\">´</kbd> (rechts neben dem P) und danach den gewünschten Vokal: <kbd class=\"tecla-badge\">A</kbd>, <kbd class=\"tecla-badge\">E</kbd>, <kbd class=\"tecla-badge\">I</kbd>, <kbd class=\"tecla-badge\">O</kbd> oder <kbd class=\"tecla-badge\">U</kbd> → <strong>á, é, í, ó, ú</strong>.",
            "guia.paso3": "Für Großbuchstaben mit Akzent: <kbd class=\"tecla-badge\">´</kbd> drücken, <kbd class=\"tecla-badge\">Shift</kbd> gedrückt halten und den Vokal tippen → <strong>Á, É, Í, Ó, Ú</strong>.",
            "guia.signos_titulo": "Häufige Satz- und Sonderzeichen",
            "guia.atajos_titulo": "Schnellkürzel in Tippen Tag",
            "guia.atajo_musica": "Musik pausieren / fortsetzen",
            "guia.atajo_reenfocar": "Tastatur neu fokussieren",
            "guia.atajo_reenfocar_desc": "Klick auf den Bildschirm",
            "guia.atajo_guia": "Tastaturhilfe umschalten",
            "guia.atajo_sonido": "Soundeffekte",
            "guia.atajo_importar": "Level importieren",
            "guia.atajo_importar_desc": ".json-Datei hierher ziehen",
            "guia.entendido": "Verstanden & Zurück"
        }
    };

    // Metadatos traducidos para catálogo de mascotas
    const METADATOS_MASCOTAS = {
        gato: {
            es: { nombre: 'Gato teclero', desc: 'Raza de gato especializada en apretar teclas, se acostumbra al ritmo de tecleo de su dueño.' },
            de: { nombre: 'Tastatur-Katze', desc: 'Spezialisierte Rasse, die Tastendrücke liebt und sich dem Tipprhythmus ihres Besitzers anpasst.' }
        },
        perro: {
            es: { nombre: 'Perro gamer', desc: 'Animal muy noble que te acompañará a escribir mientras escucha su canción favorita.' },
            de: { nombre: 'Gamer-Hund', desc: 'Sehr treuer Begleiter, der dich beim Schreiben unterstützt, während er sein Lieblingslied hört.' }
        },
        mapache: {
            es: { nombre: 'Mapache con lentes', desc: 'Un audaz mapache con problemas de visión pero muchas ganas de aprender.' },
            de: { nombre: 'Waschbär mit Brille', desc: 'Ein mutiger Waschbär mit kleiner Sehschwäche, aber enormem Lerneifer.' }
        },
        oso: {
            es: { nombre: 'Oso Entusiasta', desc: 'Un alegre oso pardo con gorrita, sabe escribir muy rápido, aunque a veces falla, como todos, pero no se rinde en mejorar.' },
            de: { nombre: 'Begeisterter Bär', desc: 'Ein fröhlicher Braunbär mit Mütze. Er tippt blitzschnell, verzeiht sich Fehler und gibt niemals auf.' }
        },
        pastor: {
            es: { nombre: 'Pastor Alemán', desc: 'Fiel guardián proveniente de europa, especializado en el pastoreo y ahora aprendiendo a usar un teclado para modernizarse.' },
            de: { nombre: 'Deutscher Schäferhund', desc: 'Treuer Beschützer aus Europa, Meister des Hütens und jetzt eifriger Schüler an der Tastatur.' }
        },
        triplet: {
            es: { nombre: 'Tippen Tippen Tag', desc: 'El legendario trío mecanográfico sincronizado. Su velocidad legendaria desafía los límites del teclado.' },
            de: { nombre: 'Tippen Tippen Tag', desc: 'Das legendäre synchronisierte Tipp-Trio. Ihre Schnelligkeit sprengt alle Tastatur-Grenzen.' }
        },
        capibara: {
            es: { nombre: 'Chui el Chigüire', desc: 'Animal místico de la creación de Dios, amigo de todos, enemigo solo de sí mismo.' },
            de: { nombre: 'Chui, das Capybara', desc: 'Mystisches Wasserschwein (Capybara), Freund aller Geschöpfe und Feind nur der eigenen Faulheit.' }
        }
    };

    // Metadatos traducidos para catálogo de temas
    const METADATOS_TEMAS = {
        claro: {
            es: { nombre: 'Día (Clásico)', desc: 'La paleta original de Tippen Tag: contrastes balanceados, interfaz pulcra y máxima legibilidad.' },
            de: { nombre: 'Tag (Klassisch)', desc: 'Die originale Palette: Ausgewogene Kontraste, saubere Benutzeroberfläche und maximale Lesbarkeit.' }
        },
        oscuro: {
            es: { nombre: 'Noche Arcade', desc: 'Ambiente nocturno con tonos violetas y acentos neón diseñado para proteger la vista en sesiones largas.' },
            de: { nombre: 'Arcade-Nacht', desc: 'Nächtliche Atmosphäre mit Violett- und Neon-Akzenten für augenschonendes Tippen.' }
        },
        espacio: {
            es: { nombre: 'Espacio Cósmico', desc: 'Inmersión interestelar profunda con estrellas púrpuras, contrastes vibrantes y estilo futurista.' },
            de: { nombre: 'Kosmischer Raum', desc: 'Tiefe interstellare Immersion mit violetten Sternen, lebendigen Kontrasten und Zukunfts-Design.' }
        },
        cafe_otono: {
            es: { nombre: 'Café de Otoño', desc: 'Tonos cálidos, marrones y naranjas. Muy relajante a la vista para sesiones largas de lectura.' },
            de: { nombre: 'Herbst-Kaffee', desc: 'Warme Braun- und Orangetöne. Sehr entspannend für die Augen bei langen Lese- und Tippstunden.' }
        },
        bosque: {
            es: { nombre: 'Bosque Místico', desc: 'Verdes tierra y esmeralda. Brinda una sensación de naturaleza y tranquilidad absoluta.' },
            de: { nombre: 'Mystischer Wald', desc: 'Erdige Wald- und Smaragdtöne für vollkommene Ruhe und Naturverbundenheit.' }
        },
        oceano: {
            es: { nombre: 'Océano Profundo', desc: 'Azules marinos con contrastes en verde azulado pastel. Sumérgete en la máxima concentración.' },
            de: { nombre: 'Tiefer Ozean', desc: 'Meeresblau mit pastellfarbenem Türkis. Tauche ein in konzentriertes Arbeiten.' }
        },
        dracula: {
            es: { nombre: 'Drácula', desc: 'Un clásico legendario entre los desarrolladores. Tonos pastel vibrantes sobre un elegante fondo oscuro.' },
            de: { nombre: 'Dracula', desc: 'Legendärer Entwickler-Klassiker: Lebendige Pastellfarben auf elegantem dunklem Grund.' }
        },
        monocromo: {
            es: { nombre: 'Monocromo', desc: 'Minimalismo puro en blanco roto y grafito. Cero distracciones visuales para batir tus propios récords.' },
            de: { nombre: 'Monochrom', desc: 'Reiner Minimalismus in Off-White und Graphit. Keine Ablenkung für neue Rekorde.' }
        },
        cyberpunk: {
            es: { nombre: 'Cyberpunk Neón', desc: 'Alta energía y velocidad. Neón cian brillante sobre un fondo oscuro para tecleadores extremos.' },
            de: { nombre: 'Cyberpunk Neon', desc: 'Maximale Energie: Leuchtendes Cyan auf dunkler Basis für Extrem-Tipper.' }
        },
        vaporwave: {
            es: { nombre: 'Retro Vaporwave', desc: 'Estética de los años 80. Morados profundos con acentos en lila y rosa neón brillante.' },
            de: { nombre: 'Retro Vaporwave', desc: 'Nostalgische 80er-Ästhetik: Tiefes Violett mit leuchtendem Flieder und Neon-Pink.' }
        }
    };

    // Consejos de mecanografía para la landing
    const CONSEJOS = {
        es: [
            "Acentos y Tildes: Presiona y suelta la tecla de tilde [ ´ ] (a la derecha de la P) y luego pulsa la vocal deseada (á, é, í, ó, ú).",
            "Paréntesis: Para abrir y cerrar paréntesis ( ), mantén presionado Shift y pulsa las teclas 8 o 9 en la fila numérica superior.",
            "Comillas y Signos: Presiona Shift + 2 para comillas dobles (\"), y Shift + 1 para signo de admiración de cierre (!).",
            "Diéresis: Para escribir la diéresis ( ü ), presiona Shift + [ ¨ ] (junto a la P), suéltala y pulsa la letra u.",
            "Posición Base de Manos: Coloca tus dedos índices en las teclas guía F y J (tienen marcas táctiles) para ubicar tus manos sin mirar.",
            "Atajo de Música: Durante canciones o dictados, puedes pausar o continuar la pista de audio rápidamente pulsando Alt + P."
        ],
        de: [
            "Umlaute & Akzente: Tippe Ä, Ö, Ü und ß direkt auf der deutschen Tastatur oder nutze die Akzent-Taste [ ´ ] für fremdsprachige Vokale (á, é...).",
            "Klammern setzen: Halte Shift gedrückt und tippe 8 oder 9 in der oberen Zahlenreihe für runde Klammern ( ).",
            "Anführungszeichen: Drücke Shift + 2 für Anführungszeichen (\") und Shift + 1 für das Ausrufezeichen (!).",
            "Buchstabe Ü: Auf QWERTZ-Tastaturen liegt das Ü rechts neben dem P. Auf spanischen Tastaturen: Shift + ¨ dann u.",
            "Grundstellung der Hände: Lege die Zeigefinger auf F und J (mit den fühlbaren Erhebungen), um blind und präzise zu tippen.",
            "Musik-Tastenkürzel: Während Liedern oder Diktaten kannst du die Musikspur jederzeit mit Alt + P pausieren oder fortsetzen."
        ]
    };

    // Obtener texto traducido
    function t(clave, params = {}) {
        const lang = DICCIONARIO[idiomaActual] ? idiomaActual : 'es';
        let texto = DICCIONARIO[lang][clave] || DICCIONARIO['es'][clave] || clave;

        if (typeof texto === 'string' && params && typeof params === 'object') {
            for (const p in params) {
                texto = texto.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
            }
        }
        return texto;
    }

    // Traducir todos los elementos marcados en el DOM
    function actualizarDOM() {
        document.documentElement.lang = idiomaActual;

        // data-i18n (innerHTML o textContent)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const clave = el.getAttribute('data-i18n');
            const traducido = t(clave);
            if (traducido && traducido !== clave) {
                // Si contiene tags HTML como <strong> o <u>, usamos innerHTML
                if (traducido.includes('<') && traducido.includes('>')) {
                    el.innerHTML = traducido;
                } else {
                    el.textContent = traducido;
                }
            }
        });

        // data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const clave = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(clave);
        });

        // data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const clave = el.getAttribute('data-i18n-title');
            el.title = t(clave);
        });

        // Actualizar botones de cambio rápido de idioma en las barras superiores
        const botonesLang = document.querySelectorAll('.btn-quick-lang');
        botonesLang.forEach(btn => {
            btn.innerHTML = idiomaActual === 'es' ? '🇩🇪 DE' : '🇪🇸 ES';
            btn.title = idiomaActual === 'es' 
                ? 'Auf Deutsch umschalten (Alemán)' 
                : 'Cambiar a Español (Spanisch)';
        });

        // Actualizar botones del selector de idioma en el modal de Ajustes
        const btnEs = document.getElementById('btn-lang-es');
        const btnDe = document.getElementById('btn-lang-de');
        if (btnEs) btnEs.classList.toggle('activo', idiomaActual === 'es');
        if (btnDe) btnDe.classList.toggle('activo', idiomaActual === 'de');
    }

    // Cambiar idioma activo
    function setLanguage(nuevoIdioma) {
        if (!['es', 'de'].includes(nuevoIdioma)) return;
        idiomaActual = nuevoIdioma;
        try {
            localStorage.setItem(STORAGE_KEY, nuevoIdioma);
        } catch (e) {}

        actualizarDOM();

        // Notificar a toda la aplicación
        window.dispatchEvent(new CustomEvent('tpt:languagechange', { detail: { lang: nuevoIdioma } }));
    }

    function getLanguage() {
        return idiomaActual;
    }

    function toggleLanguage() {
        setLanguage(idiomaActual === 'es' ? 'de' : 'es');
    }

    function obtenerMetadatosMascota(id, lang = idiomaActual) {
        return (METADATOS_MASCOTAS[id] && METADATOS_MASCOTAS[id][lang]) 
            ? METADATOS_MASCOTAS[id][lang] 
            : null;
    }

    function obtenerMetadatosTema(id, lang = idiomaActual) {
        return (METADATOS_TEMAS[id] && METADATOS_TEMAS[id][lang]) 
            ? METADATOS_TEMAS[id][lang] 
            : null;
    }

    function obtenerConsejos(lang = idiomaActual) {
        return CONSEJOS[lang] || CONSEJOS['es'];
    }

    return {
        t: t,
        setLanguage: setLanguage,
        getLanguage: getLanguage,
        toggleLanguage: toggleLanguage,
        actualizarDOM: actualizarDOM,
        obtenerMetadatosMascota: obtenerMetadatosMascota,
        obtenerMetadatosTema: obtenerMetadatosTema,
        obtenerConsejos: obtenerConsejos
    };
})();

window.TPTi18n = TPTi18n;
