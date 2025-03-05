/***********************
 * VARIABLES DE CONFIGURACIÓN
 ***********************/
// Definición de las 5 secciones con 3 preguntas cada una (y etiquetas para la escala 1-5)
const sections = [
    {
        name: "COHERENCIA ESTRUCTURAL",
        questions: [
            { text: "¿La melodía tiene una idea motívica clara (un tema reconocible)?", left: "Sin motivo discernible", right: "El motivo es claro y creativo" },
            { text: "¿Se percibe intencionalidad en la composición de melodía y armonía?", left: "Mucha aleatoriedad en la composición", right: "Se percibe intencionalidad en la composición" },
            { text: "¿Existe una sensación de equilibrio formal (simetría de la frase, repetición/contraste)?", left: "Caótico o desequilibrado", right: "Equilibrado e intencional" }
        ]
    },
    {
        name: "INTEGRACIÓN ARMÓNICO-MELÓDICA",
        questions: [
            { text: "¿Los acordes parecen tener un propósito en relación con la melodía?", left: "Acordes aleatorios / no relacionados", right: "Los acordes complementan la melodía muy bien" },
            { text: "¿La melodía en suma a la armonía se resuelven de una manera apropiada?", left: "Hay disonancias no resueltas", right: "La melodía se resuelve de manera elegante" },
            { text: "¿La armonía crea un centro tonal claro o alguna ambigüedad intencional?", left: "Tonalmente confuso", right: "Tonalmente intencional o creativamente ambiguo" }
        ]
    },
    {
        name: "FLUIDEZ RÍTMICA",
        questions: [
            { text: "¿El ritmo de la melodía se siente natural y con un propósito?", left: "El ritmo es inconexo", right: "El ritmo fluye naturalmente" },
            { text: "¿El ritmo armónico se alinea con el fraseo de la melodía?", left: "Los acordes cambian arbitrariamente", right: "El ritmo armónico mejora el fraseo" },
            { text: "¿Se identifican patrones rítmicos distintivos?", left: "Ritmo sin patrones claros", right: "Ritmo coherente" }
        ]
    },
    {
        name: "IMPACTO EMOCIONAL Y EXPRESIVO",
        questions: [
            { text: "¿La pieza evoca un estado de ánimo o emoción específicos?", left: "Sin carácter emocional", right: "La emoción es vívida y consistente" },
            { text: "¿Se identifica la separación de las frases y/o la articulación de ideas en la melodía?", left: "No se identifica la separación de frases", right: "Se siente la separación de frases" },
            { text: "¿La música se siente emocionalmente atractiva o memorable?", left: "Olvidable", right: "Muy atractiva/memorable" }
        ]
    },
    {
        name: "ELEMENTOS INDIVIDUALES",
        questions: [
            { text: "¿La progresión de acordes es buena por sí misma (sin considerar la melodía)?", left: "Progresión sin identidad propia", right: "Progresión buena y satisfactoria" },
            { text: "¿La melodía es buena por sí misma (sin considerar los acordes)?", left: "La melodía no es buena por sí misma", right: "La melodía es buena y satisfactoria" },
            { text: "¿El ritmo de las notas se adecúan bien al tipo de compás?", left: "El ritmo no se adecúa bien al tipo de compás", right: "El ritmo distingue bien el compás" }
        ]
    },
    {
        name: "PREGUNTAS EXTRA",
        questions: [
            { text: "¿Del 0 al 10 qué calificación le das a la pieza?", left: "", right: "", scaleMin: 0, scaleMax: 10 },
            { text: "¿Tiene potencial para convertirse en una canción/obra musical completa?", options: ["Sí", "No"] }
        ]
    }
];
let songs = [];
let results = {};
let currentSongIndex = 0;
let currentSectionIndex = 0;
let currentQuestionIndex = 0;
let userData = {};

/***********************
 * REFERENCIAS A ELEMENTOS DEL DOM
 ***********************/
const initialFormDiv = document.getElementById("initialForm");
const evaluationDiv = document.getElementById("evaluation");
const userForm = document.getElementById("userForm");
const startBtn = document.getElementById("startBtn");
const selectFolderBtn = document.getElementById("selectFolderBtn");
const songTitle = document.getElementById("songTitle");
const songTitleCounter = document.getElementById("songTitleCounter");
const songVideo = document.getElementById("songVideo");
const sectionTitle = document.getElementById("sectionTitle");
const sectionTitleCounter = document.getElementById("sectionTitleCounter");
const questionText = document.getElementById("questionText");
const leftLabel = document.getElementById("leftLabel");
const rightLabel = document.getElementById("rightLabel");
const scaleButtonsDiv = document.getElementById("scaleButtons");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

/***********************
 * CARGA DE CANCIONES DESDE LA CARPETA LOCAL
 ***********************/
async function loadSongsFromFolder() {
    if (!window.showDirectoryPicker) {
        alert("Tu navegador no soporta la API de Acceso al Sistema de Archivos.");
        return;
    }
    try {
        const directoryHandle = await window.showDirectoryPicker();
        songs = [];
        for await (const entry of directoryHandle.values()) {
            if (entry.kind === "file" && entry.name.toLowerCase().endsWith(".mp4")) {
                const file = await entry.getFile();
                const fileURL = URL.createObjectURL(file);
                songs.push({ name: entry.name, fileURL: fileURL });
            }
        }
        songs.sort((a, b) => a.name.localeCompare(b.name));
        if (songs.length === 0) {
            alert("No se encontraron archivos mp4 en la carpeta seleccionada.");
        } else {
            alert(`Se cargaron ${songs.length} canción(es).`);
            startBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error al cargar la carpeta:", error);
    }
}

/***********************
 * ACTUALIZACIÓN DE LA INFORMACIÓN DE PROGRESO
 ***********************/
function updateProgressInfo() {
    // Actualización del contador de canciones
    songTitleCounter.textContent = `[${currentSongIndex + 1} / ${songs.length}]`;
    // Para secciones, se usa sections.length - 1 ya que la última es EXTRA
    sectionTitleCounter.textContent = `[${currentSectionIndex + 1} / ${sections.length - 1}]`;
}

/***********************
 * ACTUALIZACIÓN DEL VIDEO Y TÍTULO DE LA CANCIÓN
 ***********************/
function updateSong() {
    const currentSong = songs[currentSongIndex];
    songTitle.textContent = "MIA " + currentSong.name.replace(".mp4", "");
    songVideo.src = currentSong.fileURL;
}

/***********************
 * CREACIÓN DE LOS BOTONES DE RESPUESTA (dinámico)
 ***********************/
function createScaleButtons() {
    scaleButtonsDiv.innerHTML = "";
    const currentQ = sections[currentSectionIndex].questions[currentQuestionIndex];
    if (currentQ.options) {
        currentQ.options.forEach(option => {
            const btn = document.createElement("button");
            btn.textContent = option;
            btn.onclick = function () {
                recordAnswer(option);
                nextBtn.disabled = false;
                Array.from(scaleButtonsDiv.children).forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            };
            scaleButtonsDiv.appendChild(btn);
        });
    } else if (currentQ.scaleMin !== undefined && currentQ.scaleMax !== undefined) {
        for (let i = currentQ.scaleMin; i <= currentQ.scaleMax; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.onclick = function () {
                recordAnswer(i);
                nextBtn.disabled = false;
                Array.from(scaleButtonsDiv.children).forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            };
            scaleButtonsDiv.appendChild(btn);
        }
    } else {
        // Por defecto, escala de 1 a 5
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.onclick = function () {
                recordAnswer(i);
                nextBtn.disabled = false;
                Array.from(scaleButtonsDiv.children).forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            };
            scaleButtonsDiv.appendChild(btn);
        }
    }
}

/***********************
 * REGISTRO DE RESPUESTAS
 ***********************/
function recordAnswer(value) {
    if (!results[currentSongIndex]) {
        results[currentSongIndex] = {
            songName: songs[currentSongIndex].name.replace(".mp4", ""),
            sections: sections.map(sec =>
                Array(sec.questions.length).fill(sec.name === "EXTRA" ? "" : 0)
            )
        };
    }
    results[currentSongIndex].sections[currentSectionIndex][currentQuestionIndex] = value;
}

/***********************
 * ACTUALIZACIÓN DE LA PREGUNTA ACTUAL
 ***********************/
function updateQuestion() {
    updateProgressInfo();
    sectionTitle.textContent = sections[currentSectionIndex].name;
    const currentQ = sections[currentSectionIndex].questions[currentQuestionIndex];
    questionText.textContent = currentQ.text;
    leftLabel.textContent = currentQ.left || "";
    rightLabel.textContent = currentQ.right || "";

    createScaleButtons();

    // Si ya hay respuesta previa, se resalta el botón correspondiente
    const prevAnswer = results[currentSongIndex]
        ? results[currentSongIndex].sections[currentSectionIndex][currentQuestionIndex]
        : (currentQ.options ? "" : 0);
    Array.from(scaleButtonsDiv.children).forEach(btn => {
        if (btn.textContent == prevAnswer) {
            btn.classList.add("selected");
            nextBtn.disabled = false;
        }
    });
    if (prevAnswer === 0 || prevAnswer === "") {
        nextBtn.disabled = true;
    }
    prevBtn.disabled = (currentSectionIndex === 0 && currentQuestionIndex === 0);
}

/***********************
 * NAVEGACIÓN ENTRE PREGUNTAS/SECCIONES
 ***********************/
function next() {
    const answer = results[currentSongIndex].sections[currentSectionIndex][currentQuestionIndex];
    if (answer === 0 || answer === "") {
        alert("Por favor seleccione una respuesta antes de avanzar.");
        return;
    }
    if (currentQuestionIndex < sections[currentSectionIndex].questions.length - 1) {
        currentQuestionIndex++;
    } else {
        if (currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            currentQuestionIndex = 0;
        } else {
            // Fin de la última sección: guardar y pasar a la siguiente canción
            saveJSON("logs_" + new Date().toISOString().replace(/[:.]/g, "-") + ".json", results[currentSongIndex]);
            setTimeout(() => {
                nextSong();
            }, 500);
            return;
        }
    }
    updateQuestion();
}

function prev() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
    } else if (currentSectionIndex > 0) {
        currentSectionIndex--;
        currentQuestionIndex = sections[currentSectionIndex].questions.length - 1;
    }
    updateQuestion();
}

/***********************
 * CAMBIO DE CANCIÓN
 ***********************/
function nextSong() {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
        currentSectionIndex = 0;
        currentQuestionIndex = 0;
        if (!results[currentSongIndex]) {
            results[currentSongIndex] = {
                songName: songs[currentSongIndex].name.replace(".mp4", ""),
                sections: sections.map(sec =>
                    Array(sec.questions.length).fill(sec.name === "EXTRA" ? "" : 0)
                )
            };
        }
        updateSong();
        updateQuestion();
    } else {
        const finalData = { user: userData, results: results };
        saveJSON(userData.initials + "_" + new Date().toISOString().replace(/[:.]/g, "-") + ".json", finalData);
        alert("Evaluación completa. ¡Gracias por participar!");
    }
}

/***********************
 * UTILIDAD: GUARDAR JSON
 ***********************/
function saveJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/***********************
 * EVENTOS
 ***********************/
prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
selectFolderBtn.addEventListener("click", loadSongsFromFolder);

userForm.addEventListener("submit", function (e) {
    e.preventDefault();
    userData.name = document.getElementById("name").value;
    userData.gender = document.getElementById("gender").value;
    userData.age = document.getElementById("age").value;
    userData.semester = document.getElementById("semester").value;
    userData.initials = userData.name.split(" ").map(n => n.charAt(0)).join("");
    initialFormDiv.style.display = "none";
    evaluationDiv.style.display = "block";
    if (!results[currentSongIndex]) {
        results[currentSongIndex] = {
            songName: songs[currentSongIndex].name.replace(".mp4", ""),
            sections: sections.map(sec =>
                Array(sec.questions.length).fill(sec.name === "EXTRA" ? "" : 0)
            )
        };
    }
    updateSong();
    updateQuestion();
});