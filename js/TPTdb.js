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
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "Un momoye se escapó de la cárcel y empezó a robarse textos de la memoria colectiva. | Debes teclear rápido para recuperarlos. | Presta atención a como debes ubicar tus manos correctamente. | ¡Y empieza a escribir!", 
                historiaFin: "¿Eh? | ¿Quién está molestando al Gran Tututuku? | Te vas a enterar de lo que vale un peine la próxima vez",
                imgInicio: "assets/img/guiamanos.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: false,
                esOficial: true
            },
            {
                id: "lvl_oficial_2",
                titulo: "Guten Tag!",
                dificultad: "facil",
                modo: "normal",
                tiempo_limite: 60,
                vidas: 3,
                texto: "Guten Tag! Mein Name ist DenkKraft. Ich lerne Deutsch. Das ist sehr gut. Die Sonne scheint und der Himmel ist blau.",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "El Momoye ha cruzado la frontera y ahora roba frases básicas en alemán. | ¡Es hora de calentar los dedos con palabras sencillas! | Recuerda: en alemán los sustantivos (como Name, Sonne, Himmel) siempre empiezan en mayúscula.",
                historiaFin: "¡Sehr gut! | Recuperaste el texto y asustaste al Momoye con tu excelente tecleo. ¡El idioma no es un límite!",
                imgInicio: "assets/img/momoye.png",
                imgFin: "mascota",
                animacionGolpe: false,
                esOficial: true
            },
            {
                id: "lvl_oficial_3",
                titulo: "Tres Tristes Tigres",
                dificultad: "normal",
                modo: "normal",
                tiempo_limite: 45,
                vidas: 3,
                texto: "Tres tristes tigres tragaban trigo en un trigal.",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "El momoye ha robado un trabalenguas vital para la cultura. Concéntrate, la dificultad ha aumentado.",
                historiaFin: "¡Mis tigres! | ¡Mi trigo! | Bueno no eran míos pero ya me entiendes | Me los vas a pagar con intereses, espera y verás",
                imgInicio: "assets/img/momoyetigres.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: false, 
                esOficial: true
            },
            {
                id: "lvl_oficial_4",
                titulo: "Hänsel und Gretel",
                dificultad: "normal",
                modo: "normal",
                tiempo_limite: 70,
                vidas: 3,
                texto: "Vor einem grossen Walde wohnte ein armer Holzhacker mit seiner Frau und seinen zwei Kindern; das Bübchen hiess Hänsel und das Mädchen Gretel",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "¡El Momoye se ha metido en los cuentos clásicos de los Hermanos Grimm! | Aquí te encontrarás por primera vez con las diéresis (ä, ü), se pueden hacer apretando Alt + Diéresis (está ubicada al lado de la letra P o de la Ñ según la distribución) seguida de la vocal que usarás.| ¡Mantén el ritmo y no te dejes intimidar!",
                historiaFin: "¡Wunderbar! | El duende andino soltó el cuento y huyó hacia el bosque oscuro. ¡Sigue así!",
                imgInicio: "assets/img/momoye.png",
                imgFin: "mascota",
                animacionGolpe: false,
                esOficial: true
            },
            {
                id: "lvl_oficial_5",
                titulo: "Leyenda del Páramo",
                dificultad: "normal",
                modo: "normal",
                tiempo_limite: 60,
                vidas: 3,
                texto: "Cuentan los abuelos en los páramos trujillanos que el Momoye es un duende guardián de las lagunas. Si le faltas el respeto al agua, te esconde las cosas y te hace perder el camino.",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "El Momoye huyó hacia la neblina de los Andes, dejando tras de sí un fragmento de su propia leyenda | Las comas y los acentos empiezan a ser más frecuentes aquí. | ¡Concéntrate!", 
                historiaFin: "¡Bien hecho! | El duende andino se tropezó en la neblina y soltó el pergamino. | Sigamos su rastro.",
                imgInicio: "assets/img/momoye.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: false,
                esOficial: true
            },
            
            // Literatura Alemana (Goethe)
            {
                id: "lvl_oficial_6",
                titulo: "El Rey de los Elfos",
                dificultad: "normal",
                modo: "vital",
                tiempo_limite: 0,
                vidas: 3, // Modo vital: sin límite de tiempo, pero los fallos cuestan caro
                texto: "¿Quién cabalga tan tarde entre la noche y el viento? Es un padre abrazando a su hijo. Lo lleva seguro en sus brazos, lo mantiene abrigado y a salvo.",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "¡Magia internacional! El Momoye cruzó el océano y robó un poema clásico de Johann Wolfgang von Goethe. | Los signos de interrogación requieren usar Shift. | Cuidado, en este modo los errores consumen vidas.",
                historiaFin: "¡Wunderbar! | El poema está a salvo. | La poesía europea no es rival para nuestra mascota.",
                imgInicio: "assets/img/reyelfos.png",
                imgFin: "mascota",
                animacionGolpe: false, 
                esOficial: true
            },

            // // Alma Llanera (Rafael Bolívar Coronado)
           {
                id: "lvl_oficial_7",
                titulo: "El Alma Llanera",
                dificultad: "dificil",
                modo: "dificil",
                tiempo_limite: 55,
                vidas: 4,
                texto: "Yo nací en esta ribera del Arauca vibrador, soy hermano de las espumas, de las garzas, de las rosas y del sol. Me arrulló la viva diana de la brisa en el palmar.",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "¡El Momoye se atrevió a robar el segundo himno nacional venezolano! | La letra del Alma Llanera está en peligro. | La puntuación y el vocabulario pondrán a prueba tu velocidad. ¡Escribe rápido!",
                historiaFin: "¡Bravo! | Recuperaste la letra intacta y el duende andino salió corriendo de vuelta hacia el llano.",
                imgInicio: "assets/img/momoye.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: true, 
                esOficial: true
            },

            
            // Literatura Alemana (Heinrich Heine)
            {
                id: "lvl_oficial_8",
                titulo: "Die Lorelei",
                dificultad: "dificil",
                modo: "dificil",
                tiempo_limite: 65,
                vidas: 4,
                texto: "Ich weiss nicht, was soll es bedeuten, dass ich so traurig bin; ein Märchen aus alten Zeiten, das kommt mir nicht aus dem Sinn. Die Luft ist kühl und es dunkelt, und ruhig fliesst der Rhein.",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "¡El Momoye navegó hasta el río Rin y robó el poema más famoso de Heinrich Heine! | Recuerda que en alemán todos los sustantivos van en mayúscula. | ¡Cuidado con las las diéresis (ä, ü)!",
                historiaFin: "¡Ausgezeichnet! | La leyenda de la sirena del Rin está a salvo. | El Momoye no pudo con semejante nivel de gramática europea.",
                imgInicio: "assets/img/momoye.png",
                imgFin: "mascota", 
                animacionGolpe: true, // La mascota le dará un golpe al Momoye al terminar
                esOficial: true
            },
            //Poesía en Alemán vaina dura
            {
                id: "lvl_oficial_9",
                titulo: "Oda a la Alegría",
                dificultad: "dificil",
                modo: "dificil",
                tiempo_limite: 45,
                vidas: 3,
                texto: "Freude, schöner Götterfunken, Tochter aus Elysium, Wir betreten feuertrunken, Himmlische, dein Heiligtum! Deine Zauber binden wieder, was die Mode streng geteilt; alle Menschen werden Brüder, wo dein sanfter Flügel weilt.",
                autorNombre: "DenkKraft",
                autorId: "denkkraft_oficial",
                historiaInicio: "¡Batalla Final! | El Gran Tututuku ha combinado su magia con la pluma de Schiller, ahora puede escribir en perfecto alemán. | ¡Las mayúsculas intercaladas, diéresis (ü) y palabras complejas te pondrán a prueba! | ¡Demuestra tu DenkKraft!",
                historiaFin: "¡Victoria Absoluta! | Has dominado el teclado y recuperado toda la literatura. | El Gran Tututuku promete no volver a robar textos... por ahora.",
                imgInicio: "assets/img/momoye.png",
                imgFin: "assets/img/momoye.png",
                animacionGolpe: true, // Ideal para ver a la mascota golpear al Momoye al ganar
                esOficial: true
            },
            {
                id: "lvl_oficial_99",
                titulo: "La Cucaracha",
                dificultad: "dificil",
                modo: "dificil",
                tiempo_limite: 77,
                vidas: 5,
                texto: "La cucaracha, la cucaracha. Ya no puede caminar.\nPorque no tiene, porque le falta. La patita de atrás.\nLa cucaracha, la cucaracha. Ya no puede caminar.\nPorque no tiene, porque le falta. La patita de atrás.  \nUna cucaracha grande se pasea en la cocina. Y la chancla de mi madre le ha quitado una patita.\nEsta coja cucaracha nunca se da por vencida y aunque le falte una pata, baila siempre en la cocina.",
                autorNombre: "DenkKraft", 
                autorId: "denkkraft_oficial",
                historiaInicio: "Gracias individuo de gran dialecto vía escrita, ese momoye maleante me tenía atrapado entre sus artículos robados | Estoy tan feliz que podría bailar aún si me faltara una...",
                historiaFin: "Mejor ayudame a llegar a un hospital",
                imgInicio: "assets/img/lacucaracha1.png",
                imgFin: "assets/img/lacucaracha2.png",
                animacionGolpe: false,
                esOficial: true,
                archivoAudio: "assets/audio/La_cucaracha.mp3" 
            }
            
        ];
        

        const transaction = this.db.transaction(["niveles"], "readwrite");
        const store = transaction.objectStore("niveles");
        
        // Usamos put() para que sobrescriba los viejos si ya existían con ese ID
        nivelesPorDefecto.forEach(nivel => store.put(nivel));
        console.log("Niveles base inyectados/actualizados.");
    },

    // 3. Guardar un nuevo nivel o actualizarlo si ya existe
    async guardarNivel(nivel) {
        await this.abrir(); // Garantiza que haya conexión antes de guardar
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["niveles"], "readwrite");
            const store = transaction.objectStore("niveles");
            
            const requestAdd = store.put(nivel);
            
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

    // Obtener un nivel específico por su ID
    async obtenerNivelPorId(id) {
        await this.abrir();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["niveles"], "readonly");
            const store = transaction.objectStore("niveles");
            const requestGet = store.get(id);
            requestGet.onsuccess = () => resolve(requestGet.result);
            requestGet.onerror = (event) => reject(event.target.error);
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