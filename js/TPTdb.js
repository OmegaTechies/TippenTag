// js/TPTdb.js

const TPTDatabase = {
    db: null,

    // 1. Abrir conexión de forma segura
    abrir() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open("TippenTagDB", 2);

            request.onupgradeneeded = (event) => {
                const baseDeDatos = event.target.result;
                
                if (!baseDeDatos.objectStoreNames.contains("niveles")) {
                    baseDeDatos.createObjectStore("niveles", { keyPath: "id" });
                }
                
                // TABLA DE USUARIOS
                if (!baseDeDatos.objectStoreNames.contains("usuarios")) {
                    baseDeDatos.createObjectStore("usuarios", { keyPath: "id" });
                    console.log("Almacén de 'usuarios' creado.");
                }
            };

            // Se ejecuta cuando la conexión es exitosa
            request.onsuccess = async (event) => {
                this.db = event.target.result;
                console.log("Conexión a BD establecida.");
                await this.sembrarNivelesBase(); // Sembrado de historia
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error("Error al conectar BD:", event.target.errorCode);
                reject(event.target.error);
            };
        });
    },

    // 2. Sembrado de niveles con narrativa
    async sembrarNivelesBase() {
        const nivelesPorDefecto = [
            {
                id: "lvl_oficial_1",
                titulo: "Lección de Inicio",
                dificultad: "facil",
                modo: "viaje",
                tiempo_limite: 0,
                vidas: 0,
                texto: "Hola mundo. El gato corre.",
                historiaInicio: "Un momoye se escapó de la cárcel y empezó a robarse textos de la memoria colectiva. | Debes teclear rápido para recuperarlos. | Presta atención a como debes ubicar tus manos correctamente. | ¡Y empieza a escribir!", 
                historiaFin: "¿Eh? | ¿Quién está molestando al Gran Tututuku? | Te vas a enterar de lo que vale un peine la próxima vez",
                imgInicio: "assets/img/guiamanos.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: false,
                esOficial: true
            },
            {
                id: "lvl_oficial_2",
                titulo: "Tres Tristes Tigres",
                dificultad: "dificil",
                modo: "normal",
                tiempo_limite: 45,
                vidas: 3,
                texto: "Tres tristes tigres tragaban trigo en un trigal.",
                historiaInicio: "El momoye ha robado un trabalenguas vital para la cultura. Concéntrate, la dificultad ha aumentado.",
                historiaFin: "¡Mis tigres! | ¡Mi trigo! | Bueno no eran míos pero ya me entiendes | Me los vas a pagar con intereses, espera y verás",
                imgInicio: "assets/img/momoyetigres.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: false, 
                esOficial: true
            },
            {
                id: "lvl_oficial_3",
                titulo: "Leyenda del Páramo",
                dificultad: "normal",
                modo: "normal",
                tiempo_limite: 60,
                vidas: 3,
                texto: "Cuentan los abuelos en los páramos trujillanos que el Momoye es un duende guardián de las lagunas. Si le faltas el respeto al agua, te esconde las cosas y te hace perder el camino.",
                historiaInicio: "El Momoye huyó hacia la neblina de los Andes, dejando tras de sí un fragmento de su propia leyenda | Las comas y los acentos empiezan a ser más frecuentes aquí. | ¡Concéntrate!", 
                historiaFin: "¡Bien hecho! | El duende andino se tropezó en la neblina y soltó el pergamino. | Sigamos su rastro.",
                imgInicio: "assets/img/momoye.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: false,
                esOficial: true
            },
            
            // Literatura Alemana (Goethe)
            {
                id: "lvl_oficial_4",
                titulo: "El Rey de los Elfos",
                dificultad: "normal",
                modo: "vital",
                tiempo_limite: 0,
                vidas: 3, // Modo vital: sin límite de tiempo, pero los fallos cuestan caro
                texto: "¿Quién cabalga tan tarde a través del viento y la noche? Es un padre con su hijo. Lo tiene bien arropado en sus brazos, lo mantiene seguro, lo mantiene caliente.",
                historiaInicio: "¡Magia internacional! El Momoye cruzó el océano y robó un poema clásico de Johann Wolfgang von Goethe. | Los signos de interrogación requieren usar Shift. | Cuidado, en este modo los errores consumen vidas.",
                historiaFin: "¡Wunderbar! | El poema está a salvo. | La poesía europea no es rival para nuestra mascota.",
                imgInicio: "assets/img/reyelfos.png",
                imgFin: "mascota",
                animacionGolpe: false, 
                esOficial: true
            },

            // Tonada Venezolana (Simón Díaz)
            {
                id: "lvl_oficial_5",
                titulo: "Caballo Viejo",
                dificultad: "dificil",
                modo: "dificil",
                tiempo_limite: 55,
                vidas: 4,
                texto: "Cuando el amor llega así de esta manera, uno no se da ni cuenta. El carutal reverdece y el guamachito florece y la soga se revienta.",
                historiaInicio: "¡Oh no! Se llevó un clásico de Simón Díaz. | Esta canción tiene un ritmo rápido y fluido, ideal para practicar mecanografía continua. | ¡Sigue el compás!",
                historiaFin: "¡Excelente ritmo! | El Momoye no pudo evitar ponerse a bailar la tonada y logramos arrebatarle el texto.",
                imgInicio: "assets/img/caballoviejo.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: true, 
                esOficial: true
            },

            //Poesía en Alemán vaina dura
            {
                id: "lvl_oficial_6",
                titulo: "Oda a la Alegría",
                dificultad: "dificil",
                modo: "dificil",
                tiempo_limite: 45,
                vidas: 3,
                texto: "Freude, schöner Götterfunken, Tochter aus Elysium, Wir betreten feuertrunken, Himmlische, dein Heiligtum!",
                historiaInicio: "¡Batalla Final! | El Gran Tututuku ha combinado su magia con la pluma de Schiller, ahora puede escribir en perfecto alemán. | ¡Las mayúsculas intercaladas, diéresis (ü) y palabras complejas te pondrán a prueba! | ¡Demuestra tu DenkKraft!",
                historiaFin: "¡Victoria Absoluta! | Has dominado el teclado y recuperado toda la literatura. | El Gran Tututuku promete no volver a robar textos... por ahora.",
                imgInicio: "assets/img/momoye.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: true, // Ideal para ver a la mascota golpear al Momoye al ganar
                esOficial: true
            }
        ];

        const transaction = this.db.transaction(["niveles"], "readwrite");
        const store = transaction.objectStore("niveles");
        
        // Usamos put() para que sobrescriba los viejos si ya existían con ese ID
        nivelesPorDefecto.forEach(nivel => store.put(nivel));
        console.log("Niveles base inyectados/actualizados.");
    },

    // 3. Guardar un nuevo nivel (retorna una Promesa para que la UI espere)
    async guardarNivel(nivel) {
        await this.abrir(); // Garantiza que haya conexión antes de guardar
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["niveles"], "readwrite");
            const store = transaction.objectStore("niveles");
            
            const requestAdd = store.add(nivel);
            
            requestAdd.onsuccess = () => resolve(true);
            requestAdd.onerror = (event) => reject(event.target.error);
        });
    },
    async actualizarNivel(nivel) {
        await this.abrir(); 
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["niveles"], "readwrite");
            const store = transaction.objectStore("niveles");
            
            // put() sobrescribe el objeto que tenga el mismo 'id'
            const requestUpdate = store.put(nivel);
            
            requestUpdate.onsuccess = () => resolve(true);
            requestUpdate.onerror = (event) => reject(event.target.error);
        });
    },

    // Eliminar un nivel por su ID
    async eliminarNivel(id) {
        await this.abrir();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["niveles"], "readwrite");
            const store = transaction.objectStore("niveles");
            const requestDelete = store.delete(id);
            
            requestDelete.onsuccess = () => resolve(true);
            requestDelete.onerror = (event) => reject(event.target.error);
        });
    },

    // 4. Leer todos los niveles
    async obtenerTodos() {
        await this.abrir(); // Garantiza que haya conexión antes de leer
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["niveles"], "readonly");
            const store = transaction.objectStore("niveles");
            
            const requestGetAll = store.getAll();
            
            requestGetAll.onsuccess = () => resolve(requestGetAll.result);
            requestGetAll.onerror = (event) => reject(event.target.error);
        });
    },
    async guardarUsuario(usuario) {
        await this.abrir();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["usuarios"], "readwrite");
            const request = transaction.objectStore("usuarios").put(usuario);
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async obtenerUsuarios() {
        await this.abrir();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["usuarios"], "readonly");
            const request = transaction.objectStore("usuarios").getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
};

// Exponemos el controlador al entorno global
window.TPTDatabase = TPTDatabase;