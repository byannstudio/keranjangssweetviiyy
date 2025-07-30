// --- Variabel Global untuk Mengatur Status Game ---
let mode = 'addition'; // Mode default: 'addition' (penjumlahan), bisa 'subtraction'
let level = 1; // Level default: 1
let currentQuestion = {}; // Objek untuk menyimpan detail soal saat ini (angka, jawaban benar, dll.)
let score = 0; // Skor pemain di mode game biasa
const WIN_THRESHOLD = 5; // Jumlah jawaban benar untuk menang di mode level biasa (bisa disesuaikan)

// --- Variabel untuk Timer Game Biasa (Level 2) ---
let timerInterval; // ID interval untuk timer
let timeLeft = 10; // Waktu tersisa untuk Level 2

// --- Variabel untuk Mode Ujian Kilat ---
let timedChallengeTimer; // ID interval untuk timer ujian kilat
let timedChallengeTimeLeft = 60; // Waktu total untuk ujian kilat (1 menit)
let timedChallengeQuestions = []; // Array untuk menyimpan soal dan jawaban dari ujian kilat
let currentTimedQuestionIndex = 0; // Indeks soal ujian kilat yang sedang aktif
const MAX_TIMED_QUESTIONS = 5; // Jumlah soal di ujian kilat
let timedChallengeCorrectCount = 0; // Jumlah jawaban benar di ujian kilat

// --- Variabel untuk Mode Ingat & Cocokkan ---
let memorizeMatchTimer; // ID interval untuk timer mode ingat & cocokkan
let memorizeMatchTimeLeft = 60; // Waktu total untuk kedua fase (mengingat + mencocokkan)
let memorizeQuestionsData = []; // Array untuk menyimpan data soal dan jawaban yang harus diingat
let currentMemorizeMatches = []; // Array untuk menyimpan pasangan yang sudah dicocokkan pengguna
let selectedMatchElement = null; // Elemen 'match-item' yang sedang dipilih (jika menggunakan klik, sekarang diganti drag)

// --- Variabel untuk Fitur Gambar Garis Manual (Drag-to-Draw) di Mode Ingat & Cocokkan ---
let canvas; // Referensi ke elemen HTML <canvas>
let ctx; // Konteks 2D dari canvas untuk menggambar
let canvasRect; // Objek DOMRect dari memorizeMatchArea, digunakan untuk offset koordinat
let isDrawing = false; // Flag: true jika pengguna sedang drag mouse untuk menggambar garis
let startElement = null; // Elemen 'match-item' tempat drag dimulai
let currentMouseX, currentMouseY; // Posisi mouse saat ini (untuk garis sementara)

// --- Referensi Elemen HTML (cached untuk performa) ---
const mainMenu = document.getElementById('main-menu');
const levelMenu = document.getElementById('level-menu');
const gameArea = document.getElementById('game-area');
const winMessage = document.getElementById('win-message');
const loseMessage = document.getElementById('lose-message');
const loseTextElement = document.getElementById('lose-text');

const questionElement = document.getElementById('question');
const susunHintElement = document.getElementById('susun-hint');
const answerInputsContainer = document.getElementById('answer-inputs');
const feedbackElement = document.getElementById('feedback');
const timerElement = document.getElementById('timer');
const checkButton = document.getElementById('check-button');
const nextQuestionButton = document.getElementById('next-question-button');

let answerBoxes = []; // Array untuk input box digit (untuk level bersusun)
let singleAnswerInput = null; // Referensi untuk input box tunggal

// --- Elemen Ujian Kilat ---
const timedChallengeArea = document.getElementById('timed-challenge-area');
const timedQuestionDisplay = document.getElementById('timed-question-display');
const timedAnswerInput = document.getElementById('timed-answer-input');
const timedChallengeTimerElement = document.getElementById('timed-challenge-timer');
const timedChallengeProgressElement = document.getElementById('timed-challenge-progress');
const timedChallengeFeedbackElement = document.getElementById('timed-challenge-feedback');

// --- Elemen Pilih Jawaban Acak (Fase Setelah Ujian Kilat) ---
const chooseAnswerArea = document.getElementById('choose-answer-area');
const chooseQuestionDisplay = document.getElementById('choose-question-display');
const answerChoicesContainer = document.getElementById('answer-choices');
const chooseFeedbackElement = document.getElementById('choose-feedback');
let currentChooseQuestionIndex = 0; // Indeks soal yang sedang ditampilkan
let displayedChooseQuestions = []; // Soal-soal yang akan ditampilkan di fase ini
let chooseCorrectCount = 0; // Jumlah jawaban benar di fase pilih jawaban

// --- Elemen Ingat & Cocokkan ---
const memorizeMatchArea = document.getElementById('memorize-match-area');
const memorizeMatchTimerElement = document.getElementById('memorize-match-timer');
const memorizePhase = document.getElementById('memorize-phase');
const memorizeQuestionsList = document.getElementById('memorize-questions-list');
const matchPhase = document.getElementById('match-phase');
const matchQuestionsColumn = document.getElementById('match-questions-column');
const matchAnswersColumn = document.getElementById('match-answers-column');
const matchCanvas = document.getElementById('match-canvas'); // Referensi ke canvas HTML
const checkMatchButton = document.getElementById('check-match-button'); // Tombol ini tidak lagi digunakan untuk memicu pemeriksaan, tapi tetap ada di HTML
const matchFeedbackElement = document.getElementById('match-feedback');


// --- FUNGSI UTAMA GAME BIASA (Penjumlahan Manis & Pengurangan Ceria) ---

/**
 * Memilih mode game (penjumlahan/pengurangan) dan menampilkan menu level.
 * @param {string} selectedMode 'addition' atau 'subtraction'
 */
function selectMode(selectedMode) {
    mode = selectedMode;
    hideAllGameAreas(); // Sembunyikan semua area lain
    mainMenu.classList.add('hidden'); // Sembunyikan menu utama
    levelMenu.classList.remove('hidden'); // Tampilkan menu level
}

/**
 * Memulai game dengan tingkat kesulitan yang dipilih.
 * @param {number} selectedLevel Level game (1-5)
 */
function startGame(selectedLevel) {
    level = selectedLevel;
    score = 0; // Reset skor
    hideAllGameAreas();
    levelMenu.classList.add('hidden'); // Sembunyikan menu level
    gameArea.classList.remove('hidden'); // Tampilkan area game
    nextQuestion(); // Mulai soal pertama
}

/**
 * Membuat kotak input jawaban terpisah untuk setiap digit.
 * Digunakan untuk level bersusun (Level 4 & 5).
 * @param {number} numDigits Jumlah digit jawaban yang diharapkan.
 */
function createAnswerBoxes(numDigits) {
    answerInputsContainer.innerHTML = ''; // Bersihkan input yang ada
    answerBoxes = []; // Reset array answerBoxes
    singleAnswerInput = null; // Pastikan input tunggal dinonaktifkan

    // Buat input box dari kanan ke kiri untuk memudahkan tampilan bersusun
    // Karena kita prepend, urutan di HTML akan terbalik, jadi perlu dibalik lagi
    for (let i = 0; i < numDigits; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.maxLength = 1; // Hanya bisa 1 digit
        input.min = 0;
        input.max = 9;
        input.classList.add('answer-box');
        input.id = `answer-box-${i}`;
        answerInputsContainer.prepend(input); // Tambahkan ke awal container (efek kanan ke kiri)
        answerBoxes.push(input);
    }

    answerBoxes.reverse(); // Balikkan array agar answerBoxes[0] adalah digit paling kiri (puluhan/ratusan)

    // Tambahkan event listener untuk navigasi keyboard dan validasi input
    answerBoxes.forEach((box, index) => {
        box.addEventListener('input', (event) => {
            // Hapus karakter non-digit dan batasi 1 digit
            event.target.value = event.target.value.replace(/[^0-9]/g, '').slice(0, 1);
            if (event.target.value.length === 1 && index < answerBoxes.length - 1) {
                answerBoxes[index + 1].focus(); // Pindah fokus ke kotak berikutnya
            }
        });

        box.addEventListener('keydown', (event) => {
            // Kembali ke kotak sebelumnya saat Backspace di kotak kosong
            if (event.key === 'Backspace' && event.target.value === '' && index > 0) {
                answerBoxes[index - 1].focus();
            }
            // Mencegah input lebih dari 1 digit
            if (event.target.value.length >= 1 && event.key !== 'Backspace' && event.key !== 'Delete' && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
            }
        });

        box.addEventListener('keypress', (event) => {
            // Otomatis cek jawaban saat Enter di kotak terakhir
            if (event.key === 'Enter' && index === answerBoxes.length - 1) {
                checkAnswer();
            }
        });
    });

    if (answerBoxes.length > 0) {
        answerBoxes[0].focus(); // Fokus ke kotak pertama
    }
}

/**
 * Mengambil jawaban dari kotak-kotak input terpisah (untuk level bersusun).
 * @returns {number | null} Jawaban pengguna sebagai angka, atau null jika ada kotak yang kosong.
 */
function getAnswerFromBoxes() {
    let userAnswerString = '';
    let allFilled = true;
    answerBoxes.forEach(box => {
        if (box.value === '') {
            allFilled = false;
        }
        userAnswerString += box.value;
    });

    if (!allFilled) {
        return null; // Mengembalikan null jika ada kotak yang belum terisi
    }
    return parseInt(userAnswerString);
}


/**
 * Menggenerasi soal matematika berdasarkan mode dan level yang dipilih.
 */
function generateQuestion() {
    let num1, num2, answer;

    susunHintElement.classList.add('hidden'); // Sembunyikan petunjuk susun secara default
    questionElement.classList.remove('question-animated'); // Hapus animasi dari soal sebelumnya
    questionElement.innerHTML = ''; // Bersihkan teks soal
    answerInputsContainer.innerHTML = ''; // Bersihkan input jawaban
    answerBoxes = []; // Reset array answerBoxes
    singleAnswerInput = null; // Reset singleAnswerInput

    if (level >= 4) { // Level 4 & 5 (susun)
        num1 = Math.floor(Math.random() * 90) + 10; // Angka 2 digit (10-99)
        num2 = Math.floor(Math.random() * 90) + 10;

        if (mode === 'subtraction') {
            // Pastikan num1 lebih besar dari num2 untuk pengurangan
            if (num2 > num1) {
                [num1, num2] = [num2, num1]; // Tukar nilai jika num2 lebih besar
            }
        } else if (mode === 'addition') {
            // Pastikan hasil penjumlahan tidak lebih dari 3 digit (max 198)
            while ((num1 + num2) > 199) {
                num1 = Math.floor(Math.random() * 90) + 10;
                num2 = Math.floor(Math.random() * 90) + 10;
            }
        }

        answer = mode === 'addition' ? num1 + num2 : num1 - num2;
        
        let operator = mode === 'addition' ? '+' : '-';
        // Tampilkan soal bersusun dengan padding agar rapi
        // `padStart(X, ' ')` menambahkan spasi di depan jika angka kurang dari X digit
        let questionText = `${String(num1).padStart(3, ' ')}\n${operator} ${String(num2).padStart(2, ' ')}\n-----\n   ?`;
        questionElement.textContent = questionText;
        // Simpan detail soal, termasuk operator untuk debugging jika perlu
        currentQuestion = { num1, num2, correctAnswer: answer, operator }; 

        const numDigits = String(answer).length;
        createAnswerBoxes(numDigits); // Buat kotak jawaban sesuai jumlah digit

        if (level === 4) { // Tampilkan petunjuk di Level 4
            susunHintElement.classList.remove('hidden');
            let hintContent = `
                <h3>Yuk, Intip Cara Susunnya! 📝</h3>
                <p>1. Mulai hitung dari angka paling **kanan** (satuan): <strong>${num1 % 10} ${operator} ${num2 % 10}</strong>.</p>
                <p>2. Tulis hasil satuannya di kotak jawaban paling kanan.</p>
                <p>3. Kalau ada sisa (misal 10 dari 5+5), ingat-ingat untuk ditambahkan ke hitungan di sebelahnya (puluhan).</p>
                <p>4. Lanjut hitung angka di sebelahnya (puluhan), dst.</p>
                <p>Ingat, selalu mulai dari belakang ya! 😉</p>
            `;
            susunHintElement.innerHTML = hintContent;
        }

    } else { // Level 1, 2, 3 (pertanyaan biasa, pakai 1 input box)
        if (level === 3) {
            num1 = Math.floor(Math.random() * 90) + 10; // Angka 2 digit (10-99)
            num2 = Math.floor(Math.random() * 90) + 10;
        } else {
            num1 = Math.floor(Math.random() * 10) + 1; // Angka 1-10
            num2 = Math.floor(Math.random() * 10) + 1;
        }

        if (mode === 'subtraction' && num2 > num1) {
            [num1, num2] = [num2, num1]; // Pastikan num1 lebih besar untuk pengurangan
        }
        
        answer = mode === 'addition' ? num1 + num2 : num1 - num2;
        
        questionElement.classList.add('question-animated'); // Tambahkan animasi
        let operatorSymbol = mode === 'addition' ? '+' : '-';
        questionElement.textContent = `${num1} ${operatorSymbol} ${num2} = ?`;
        
        currentQuestion = { num1, num2, correctAnswer: answer }; // Simpan detail soal

        // Buat input box tunggal
        singleAnswerInput = document.createElement('input');
        singleAnswerInput.type = 'number';
        singleAnswerInput.id = 'answer';
        singleAnswerInput.placeholder = 'Jawab di sini, yaaa...';
        singleAnswerInput.classList.add('single-answer-input');
        answerInputsContainer.appendChild(singleAnswerInput);
        
        // Hapus listener sebelumnya untuk mencegah duplikasi jika generateQuestion dipanggil berulang
        singleAnswerInput.removeEventListener('keypress', handleKeyPress); 
        singleAnswerInput.addEventListener('keypress', handleKeyPress);
    }
    
    // Kosongkan input jawaban
    if (singleAnswerInput) {
        singleAnswerInput.value = '';
    } else { // Jika menggunakan answerBoxes (level bersusun)
        answerBoxes.forEach(box => box.value = '');
    }

    feedbackElement.textContent = ''; // Kosongkan feedback
    checkButton.classList.remove('hidden'); // Tampilkan tombol cek jawaban
    nextQuestionButton.classList.add('hidden'); // Sembunyikan tombol selanjutnya
    
    // Fokus ke input jawaban pertama (baik single atau multiple)
    if (singleAnswerInput) {
        singleAnswerInput.focus();
    } else if (answerBoxes.length > 0) {
        answerBoxes[0].focus();
    }
}

/**
 * Pindah ke pertanyaan berikutnya atau tampilkan pesan menang.
 */
function nextQuestion() {
    if (score >= WIN_THRESHOLD) {
        showWinMessage(); // Jika skor sudah cukup, tampilkan pesan menang
        return;
    }
    generateQuestion(); // Generate soal baru

    if (level === 2) { // Logic timer hanya untuk Level 2
        timeLeft = 10; // Reset waktu
        timerElement.textContent = `Waktu: ${timeLeft} detik ⏳`;
        clearInterval(timerInterval); // Hentikan timer sebelumnya jika ada
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Waktu: ${timeLeft} detik ⏳`;
            if (timeLeft <= 3 && timeLeft > 0) {
                timerElement.style.color = 'red'; // Warna merah saat waktu menipis
            } else {
                timerElement.style.color = '#e83e8c'; // Warna default (pink cerah)
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval); // Hentikan timer
                feedbackElement.textContent = '⏰ Waktu Habis! Yuk, coba lagi!';
                checkButton.classList.add('hidden'); // Sembunyikan tombol cek
                nextQuestionButton.classList.remove('hidden'); // Tampilkan tombol selanjutnya
                // Optional: Beri waktu singkat agar pesan terlihat, lalu lanjutkan
                // setTimeout(() => nextQuestion(), 1500); // Lanjut otomatis setelah waktu habis
            }
        }, 1000); // Update setiap 1 detik
    } else {
        timerElement.textContent = ''; // Tidak ada timer untuk level lain
        clearInterval(timerInterval); // Pastikan timer dihentikan
    }
}

/**
 * Memeriksa jawaban pengguna.
 */
function checkAnswer() {
    let userAnswer;

    if (level >= 4) { // Untuk level bersusun (multiple input boxes)
        userAnswer = getAnswerFromBoxes();
        if (userAnswer === null) { // Jika ada kotak yang kosong
            feedbackElement.textContent = 'Isi semua kotak jawaban dulu, ya! 🤔';
            feedbackElement.style.color = '#F44336'; // Merah untuk pesan error
            return;
        }
    } else { // Untuk level biasa (single input box)
        if (!singleAnswerInput) {
            console.error("Single answer input element is missing.");
            feedbackElement.textContent = 'Terjadi kesalahan pada input jawaban. Mohon coba muat ulang halaman.';
            feedbackElement.style.color = '#F44336';
            return;
        }
        userAnswer = parseInt(singleAnswerInput.value);
        if (isNaN(userAnswer)) { // Jika input kosong atau bukan angka
            feedbackElement.textContent = 'Isi jawabanmu dulu, ya! 🤔';
            feedbackElement.style.color = '#F44336';
            return;
        }
    }

    if (userAnswer === currentQuestion.correctAnswer) {
        feedbackElement.textContent = '💖 Yeay, Benar! Kamu Hebat! 🎉';
        feedbackElement.style.color = '#4CAF50'; // Hijau untuk benar
        score++;
        if (level === 2) clearInterval(timerInterval); // Hentikan timer jika benar di level 2
        checkButton.classList.add('hidden'); // Sembunyikan tombol cek
        nextQuestionButton.classList.remove('hidden'); // Tampilkan tombol selanjutnya
    } else {
        feedbackElement.textContent = `❌ Ups, salah! Jawaban yang benar adalah ${currentQuestion.correctAnswer}. Jangan nyerah, coba lagi! 😅`;
        feedbackElement.style.color = '#F44336'; // Merah untuk salah
        // Kosongkan input dan fokus kembali
        if (singleAnswerInput) {
            singleAnswerInput.value = '';
            singleAnswerInput.focus();
        } else {
            answerBoxes.forEach(box => box.value = '');
            if (answerBoxes.length > 0) {
                answerBoxes[0].focus();
            }
        }
    }
}

/**
 * Handle penekanan tombol Enter pada input jawaban di game biasa.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        // Cek apakah tombol "Yuk, Jawab!" terlihat dan input tidak kosong
        if (!checkButton.classList.contains('hidden') && (singleAnswerInput && singleAnswerInput.value !== '')) {
            checkAnswer(); 
        } 
        // Cek apakah tombol "Pertanyaan Selanjutnya!" terlihat
        else if (!nextQuestionButton.classList.contains('hidden')) {
            nextQuestion(); 
        }
    }
}


// --- FUNGSI UTILITY GLOBAL ---

/**
 * Menampilkan pesan kemenangan.
 */
function showWinMessage() {
    hideAllGameAreas();
    winMessage.classList.remove('hidden');
    // Pastikan semua timer dihentikan
    clearInterval(timerInterval);
    clearInterval(timedChallengeTimer);
    clearInterval(memorizeMatchTimer);
    // Hapus event listener untuk input box game biasa jika ada
    if (singleAnswerInput) {
        singleAnswerInput.removeEventListener('keypress', handleKeyPress);
    }
    answerBoxes.forEach(box => box.removeEventListener('keypress', handleKeyPress));
    // Nonaktifkan drawing listener untuk mode Ingat & Cocokkan
    removeCanvasDrawingListeners();
}

/**
 * Menampilkan pesan kekalahan atau selesai ujian.
 * @param {string} message Pesan yang akan ditampilkan.
 */
function showLoseMessage(message) {
    hideAllGameAreas();
    loseMessage.classList.remove('hidden');
    loseTextElement.textContent = message; // Atur teks pesan kekalahan
    // Pastikan semua timer dihentikan
    clearInterval(timerInterval);
    clearInterval(timedChallengeTimer);
    clearInterval(memorizeMatchTimer);
    // Nonaktifkan drawing listener
    removeCanvasDrawingListeners();
}

/**
 * Menyembunyikan semua area game dan pesan.
 * Juga menghentikan semua timer aktif dan menghapus event listener canvas.
 */
function hideAllGameAreas() {
    mainMenu.classList.add('hidden');
    levelMenu.classList.add('hidden');
    gameArea.classList.add('hidden');
    timedChallengeArea.classList.add('hidden');
    chooseAnswerArea.classList.add('hidden');
    memorizeMatchArea.classList.add('hidden');
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    
    // Bersihkan semua timer aktif
    clearInterval(timerInterval);
    clearInterval(timedChallengeTimer);
    clearInterval(memorizeMatchTimer);
    
    // Nonaktifkan drawing listener setiap kali hide
    removeCanvasDrawingListeners();
}

/**
 * Mereset game ke kondisi awal menu utama.
 */
function resetGame() {
    hideAllGameAreas();
    mainMenu.classList.remove('hidden'); // Tampilkan kembali menu utama

    // Reset semua variabel game biasa
    score = 0;
    feedbackElement.textContent = '';
    timerElement.textContent = '';
    answerInputsContainer.innerHTML = '';
    answerBoxes = [];
    singleAnswerInput = null;

    // Reset variabel spesifik ujian kilat
    timedChallengeTimeLeft = 60;
    currentTimedQuestionIndex = 0;
    timedChallengeQuestions = [];
    timedChallengeCorrectCount = 0;
    timedChallengeFeedbackElement.textContent = '';
    timedAnswerInput.value = '';
    timedChallengeTimerElement.style.color = '#e74c3c'; // Reset warna timer
    timedChallengeTimerElement.textContent = 'Waktu: 60 detik';
    timedChallengeProgressElement.textContent = 'Soal 0/5';
    // Hapus event listener khusus ujian kilat
    timedAnswerInput.removeEventListener('keypress', handleTimedChallengeKeyPress);

    // Reset variabel spesifik pilih jawaban acak
    currentChooseQuestionIndex = 0;
    displayedChooseQuestions = [];
    chooseCorrectCount = 0;
    chooseFeedbackElement.textContent = '';
    answerChoicesContainer.innerHTML = '';


    // Reset variabel spesifik ingat & cocokkan
    memorizeMatchTimeLeft = 60;
    memorizeQuestionsData = [];
    currentMemorizeMatches = [];
    selectedMatchElement = null; // Reset
    startElement = null; // Reset startElement untuk drag
    isDrawing = false; // Reset drawing flag
    clearCanvas(); // Bersihkan canvas

    // Hapus semua event listener canvas (dipanggil juga di hideAllGameAreas)
    removeCanvasDrawingListeners();
}


// --- FUNGSI UNTUK MODE UJIAN KILAT ---

/**
 * Memulai mode ujian kilat.
 */
function startTimedChallenge() {
    hideAllGameAreas();
    timedChallengeArea.classList.remove('hidden'); // Tampilkan area ujian kilat
    
    // Reset variabel ujian kilat
    timedChallengeTimeLeft = 60;
    currentTimedQuestionIndex = 0;
    timedChallengeQuestions = [];
    timedChallengeCorrectCount = 0;
    timedChallengeFeedbackElement.textContent = '';
    timedAnswerInput.value = '';
    timedChallengeTimerElement.style.color = '#e74c3c'; // Warna timer default (merah)
    timedChallengeProgressElement.textContent = `Soal 0/${MAX_TIMED_QUESTIONS}`;


    // Generate 5 soal penjumlahan 1-10 untuk ujian kilat
    for (let i = 0; i < MAX_TIMED_QUESTIONS; i++) {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;
        timedChallengeQuestions.push({
            question: `${num1} + ${num2} = ?`,
            correctAnswer: num1 + num2,
            userAnswer: null // Untuk menyimpan jawaban pengguna sementara
        });
    }

    displayTimedQuestion(); // Tampilkan soal pertama
    startTimedChallengeTimer(); // Mulai timer
    timedAnswerInput.focus(); // Fokuskan input
    // Tambahkan event listener untuk Enter
    timedAnswerInput.removeEventListener('keypress', handleTimedChallengeKeyPress); // Hapus dulu
    timedAnswerInput.addEventListener('keypress', handleTimedChallengeKeyPress);
}

/**
 * Menampilkan soal ujian kilat saat ini.
 */
function displayTimedQuestion() {
    if (currentTimedQuestionIndex < MAX_TIMED_QUESTIONS) {
        const q = timedChallengeQuestions[currentTimedQuestionIndex];
        timedQuestionDisplay.textContent = q.question;
        timedChallengeProgressElement.textContent = `Soal ${currentTimedQuestionIndex + 1}/${MAX_TIMED_QUESTIONS}`;
        timedAnswerInput.value = ''; // Kosongkan input
        timedAnswerInput.focus();
    } else {
        // Jika semua soal sudah ditampilkan/dijawab
        endTimedChallenge();
    }
}

/**
 * Memulai timer untuk ujian kilat.
 */
function startTimedChallengeTimer() {
    clearInterval(timedChallengeTimer); // Pastikan timer sebelumnya dihentikan
    timedChallengeTimerElement.textContent = `Waktu: ${timedChallengeTimeLeft} detik`;
    timedChallengeTimer = setInterval(() => {
        timedChallengeTimeLeft--;
        timedChallengeTimerElement.textContent = `Waktu: ${timedChallengeTimeLeft} detik`;
        
        // Perubahan warna timer
        if (timedChallengeTimeLeft <= 10 && timedChallengeTimeLeft > 0) {
            timedChallengeTimerElement.style.color = 'orange';
        } else if (timedChallengeTimeLeft <= 5 && timedChallengeTimeLeft > 0) {
            timedChallengeTimerElement.style.color = 'red';
        } else {
            timedChallengeTimerElement.style.color = '#e74c3c'; // Warna default (merah)
        }

        if (timedChallengeTimeLeft <= 0) {
            clearInterval(timedChallengeTimer);
            // Cek apakah belum ada soal yang dijawab (input kosong di soal pertama)
            if (currentTimedQuestionIndex === 0 && timedAnswerInput.value === '') { 
                showLoseMessage('Waktu Ujian Kilat Habis! Kamu belum sempat menjawab soal. Yuk, coba lagi nanti!');
                // Tidak langsung reset, biarkan user klik tombol "Coba Lagi!"
            } else {
                // Sisa soal yang belum dijawab dianggap tidak terjawab
                for (let i = currentTimedQuestionIndex; i < MAX_TIMED_QUESTIONS; i++) {
                    timedChallengeQuestions[i].userAnswer = null; // Tandai sebagai tidak terjawab
                }
                showLoseMessage('Waktu Ujian Kilat Habis! Lanjut ke fase berikutnya.');
                setTimeout(() => { // Beri jeda agar pesan terbaca
                    hideAllGameAreas();
                    startChooseAnswerPhase(); // Lanjut ke fase pilih jawaban
                }, 1500); 
            }
        }
    }, 1000);
}

/**
 * Mengirimkan jawaban untuk soal ujian kilat.
 */
function submitTimedAnswer() {
    const userAnswer = parseInt(timedAnswerInput.value);
    const currentQ = timedChallengeQuestions[currentTimedQuestionIndex];

    if (isNaN(userAnswer)) {
        timedChallengeFeedbackElement.textContent = 'Isi jawabanmu dulu ya!';
        timedChallengeFeedbackElement.style.color = '#F44336'; // Merah
        return;
    }

    currentQ.userAnswer = userAnswer; // Simpan jawaban pengguna
    
    if (userAnswer === currentQ.correctAnswer) {
        timedChallengeFeedbackElement.textContent = '✔ Benar!';
        timedChallengeFeedbackElement.style.color = '#4CAF50'; // Hijau
        timedChallengeCorrectCount++;
    } else {
        timedChallengeFeedbackElement.textContent = `✖ Salah! Jawaban: ${currentQ.correctAnswer}`;
        timedChallengeFeedbackElement.style.color = '#F44336'; // Merah
    }

    currentTimedQuestionIndex++; // Pindah ke soal berikutnya
    if (currentTimedQuestionIndex < MAX_TIMED_QUESTIONS) {
        setTimeout(() => {
            timedChallengeFeedbackElement.textContent = '';
            displayTimedQuestion(); // Tampilkan soal berikutnya
        }, 1000); // Beri jeda sebentar sebelum soal berikutnya
    } else {
        endTimedChallenge(); // Semua soal sudah dijawab atau waktu habis
    }
}

/**
 * Handle penekanan tombol Enter pada input jawaban ujian kilat.
 * @param {KeyboardEvent} event
 */
function handleTimedChallengeKeyPress(event) {
    if (event.key === 'Enter' && timedAnswerInput.value !== '') {
        submitTimedAnswer();
    }
}

/**
 * Mengakhiri ujian kilat dan transisi ke fase pilih jawaban.
 */
function endTimedChallenge() {
    clearInterval(timedChallengeTimer); // Hentikan timer
    timedAnswerInput.removeEventListener('keypress', handleTimedChallengeKeyPress); // Hapus listener
    hideAllGameAreas(); // Sembunyikan area ujian kilat
    startChooseAnswerPhase(); // Lanjut ke fase pilih jawaban
}


// --- FUNGSI UNTUK MODE PILIH JAWABAN ACAK ---

/**
 * Memulai fase pilih jawaban acak.
 */
function startChooseAnswerPhase() {
    chooseAnswerArea.classList.remove('hidden'); // Tampilkan area pilih jawaban
    currentChooseQuestionIndex = 0; // Reset indeks soal
    chooseCorrectCount = 0; // Reset hitungan benar
    chooseFeedbackElement.textContent = '';
    
    // Hanya gunakan soal yang DIJAWAB (bukan null) di fase ujian kilat
    displayedChooseQuestions = timedChallengeQuestions.filter(q => q.userAnswer !== null);
    if (displayedChooseQuestions.length === 0) {
        // Jika tidak ada soal yang dijawab di ujian kilat, langsung kalah
        showLoseMessage('Kamu belum menjawab soal apapun di Ujian Kilat. Yuk, coba lagi dari awal!');
        // Tidak langsung reset, biarkan user klik tombol "Coba Lagi!"
        return;
    }
    shuffleArray(displayedChooseQuestions); // Acak urutan soal untuk fase ini

    displayChooseQuestion(); // Tampilkan soal pertama untuk fase ini
}

/**
 * Menampilkan soal untuk fase pilih jawaban.
 */
function displayChooseQuestion() {
    if (currentChooseQuestionIndex < displayedChooseQuestions.length) {
        const q = displayedChooseQuestions[currentChooseQuestionIndex];
        chooseQuestionDisplay.textContent = q.question;
        answerChoicesContainer.innerHTML = ''; // Bersihkan pilihan sebelumnya

        // Generate pilihan jawaban
        let choices = new Set(); // Gunakan Set untuk menghindari duplikasi
        choices.add(q.correctAnswer); // Jawaban benar

        // Tambahkan 3 jawaban acak yang salah
        while (choices.size < 4) {
            let randomWrongAnswer;
            // Angka acak di sekitar jawaban benar, atau rentang yang masuk akal
            if (q.correctAnswer > 10) { // Untuk hasil yang lebih besar, rentang acak lebih lebar
                randomWrongAnswer = Math.floor(Math.random() * 20) + Math.max(1, q.correctAnswer - 10);
            } else { // Untuk hasil kecil
                randomWrongAnswer = Math.floor(Math.random() * 15) + 1;
            }
            
            // Pastikan jawaban salah tidak sama dengan jawaban benar
            if (randomWrongAnswer !== q.correctAnswer) {
                choices.add(randomWrongAnswer);
            }
        }
        
        let shuffledChoices = Array.from(choices); // Ubah Set ke Array
        shuffleArray(shuffledChoices); // Acak urutan pilihan

        shuffledChoices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choice;
            button.onclick = () => selectChoice(choice, q.correctAnswer, button); // Tambahkan event listener
            answerChoicesContainer.appendChild(button);
        });

    } else {
        // Semua soal sudah dijawab, tampilkan hasil akhir
        showFinalTimedChallengeResults();
    }
}

/**
 * Memilih jawaban di fase pilihan acak.
 * @param {number} selectedAnswer Jawaban yang dipilih pengguna.
 * @param {number} correctAnswer Jawaban yang benar.
 * @param {HTMLElement} buttonElement Tombol yang diklik.
 */
function selectChoice(selectedAnswer, correctAnswer, buttonElement) {
    // Nonaktifkan semua tombol pilihan setelah memilih untuk mencegah klik ganda
    Array.from(answerChoicesContainer.children).forEach(btn => btn.disabled = true);

    if (selectedAnswer === correctAnswer) {
        chooseFeedbackElement.textContent = '🎉 Benar! Hebat!';
        chooseFeedbackElement.style.color = '#4CAF50'; // Hijau
        buttonElement.classList.add('correct'); // Tambahkan kelas untuk gaya benar
        chooseCorrectCount++;
    } else {
        chooseFeedbackElement.textContent = `😅 Salah! Jawaban yang benar adalah ${correctAnswer}.`;
        chooseFeedbackElement.style.color = '#F44336'; // Merah
        buttonElement.classList.add('wrong'); // Tambahkan kelas untuk gaya salah
        // Cari tombol jawaban yang benar dan tandai juga
        Array.from(answerChoicesContainer.children).forEach(btn => {
            if (parseInt(btn.textContent) === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    currentChooseQuestionIndex++;
    setTimeout(() => {
        chooseFeedbackElement.textContent = '';
        if (currentChooseQuestionIndex < displayedChooseQuestions.length) {
            displayChooseQuestion(); // Tampilkan soal berikutnya
        } else {
            showFinalTimedChallengeResults(); // Tampilkan hasil akhir
        }
    }, 1500); // Jeda sebentar sebelum soal berikutnya
}

/**
 * Menampilkan hasil akhir dari mode ujian kilat dan pilih jawaban.
 */
function showFinalTimedChallengeResults() {
    hideAllGameAreas();
    let finalMessage = `Kamu menjawab benar ${timedChallengeCorrectCount} dari ${MAX_TIMED_QUESTIONS} soal di Ujian Kilat pertama.`;
    finalMessage += `\nDi fase Pilih Jawaban, kamu benar ${chooseCorrectCount} dari ${displayedChooseQuestions.length} soal yang kamu jawab di fase pertama.`;

    // Kriteria kemenangan (bisa disesuaikan)
    // Contoh: Minimal 3 benar di Ujian Kilat dan minimal 3 benar di Pilih Jawaban
    if (timedChallengeCorrectCount >= 3 && chooseCorrectCount >= 3) { 
        showWinMessage();
        document.getElementById('win-message').querySelector('p').textContent = finalMessage + "\nKamu luar biasa, juara matematika!";
    } else {
        showLoseMessage(finalMessage + "\nTerus berlatih ya, pasti bisa lebih baik lagi! Semangat! 💪");
    }
}


// --- FUNGSI BARU: MODE INGAT & COCOKKAN ---

/**
 * Memulai mode ingat & cocokkan.
 */
function startMemorizeMatchMode() {
    hideAllGameAreas();
    memorizeMatchArea.classList.remove('hidden'); // Tampilkan area mode
    memorizePhase.classList.remove('hidden'); // Tampilkan fase mengingat
    matchPhase.classList.add('hidden'); // Sembunyikan fase mencocokkan dulu
    
    // Reset variabel mode
    memorizeMatchTimeLeft = 60; // Total waktu
    currentMemorizeMatches = [];
    selectedMatchElement = null;
    startElement = null;
    isDrawing = false;
    clearCanvas(); // Bersihkan canvas (penting untuk memulai game baru)

    memorizeQuestionsData = []; // Reset data soal
    memorizeQuestionsList.innerHTML = ''; // Bersihkan daftar soal

    // Generate 5 soal penjumlahan 1-10
    for (let i = 0; i < 5; i++) {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;
        let questionText = `${num1} + ${num2}`;
        let correctAnswer = num1 + num2;
        // Simpan id unik untuk setiap soal (misal: q0, q1, dst.)
        memorizeQuestionsData.push({ id: `q${i}`, question: questionText, answer: correctAnswer });

        const listItem = document.createElement('div');
        listItem.classList.add('memorize-item');
        listItem.textContent = `${questionText} = ${correctAnswer}`;
        memorizeQuestionsList.appendChild(listItem);
    }

    startMemorizeMatchTimer(); // Mulai timer
}

/**
 * Memulai timer untuk mode ingat & cocokkan.
 */
function startMemorizeMatchTimer() {
    clearInterval(memorizeMatchTimer); // Hentikan timer sebelumnya
    memorizeMatchTimerElement.textContent = `Waktu: ${memorizeMatchTimeLeft} detik`;
    memorizeMatchTimer = setInterval(() => {
        memorizeMatchTimeLeft--;
        memorizeMatchTimerElement.textContent = `Waktu: ${memorizeMatchTimeLeft} detik`;

        // Perubahan warna timer
        if (memorizeMatchTimeLeft <= 10 && memorizeMatchTimeLeft > 0) {
            memorizeMatchTimerElement.style.color = 'orange';
        } else if (memorizeMatchTimeLeft <= 5 && memorizeMatchTimeLeft > 0) {
            memorizeMatchTimerElement.style.color = 'red';
        } else {
            memorizeMatchTimerElement.style.color = '#28a745'; // Warna default (hijau)
        }

        if (memorizeMatchTimeLeft <= 0) {
            clearInterval(memorizeMatchTimer);
            showMatchPhase(); // Pindah ke fase mencocokkan
        }
    }, 1000);
}

/**
 * Menampilkan fase mencocokkan.
 */
function showMatchPhase() {
    memorizePhase.classList.add('hidden'); // Sembunyikan fase mengingat
    matchPhase.classList.remove('hidden'); // Tampilkan fase mencocokkan
    memorizeMatchTimerElement.textContent = `Waktu Selesai! Sekarang Cocokkan!`; // Update timer text

    // Pastikan canvas dan konteksnya sudah diinisialisasi dengan benar
    canvas = document.getElementById('match-canvas');
    ctx = canvas.getContext('2d');
    
    // Atur ukuran atribut canvas sesuai dengan ukuran elemen kontainer utamanya.
    // Ini sangat penting agar drawing tidak diskalakan/buram.
    const containerRect = memorizeMatchArea.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    
    // Simpan posisi absolut dari memorizeMatchArea (induk canvas)
    // untuk perhitungan offset koordinat. Ini perlu di-update jika layout berubah.
    canvasRect = memorizeMatchArea.getBoundingClientRect();

    displayMatchQuestionsAndAnswers(); // Tampilkan soal dan jawaban yang diacak

    // Tambahkan event listener untuk menggambar garis manual (drag-to-draw)
    addCanvasDrawingListeners();
}

/**
 * Menampilkan soal dan jawaban yang diacak untuk fase mencocokkan.
 */
function displayMatchQuestionsAndAnswers() {
    matchQuestionsColumn.innerHTML = '';
    matchAnswersColumn.innerHTML = '';
    
    // Salin dan acak data soal dan jawaban secara terpisah
    let shuffledQuestions = [...memorizeQuestionsData];
    shuffleArray(shuffledQuestions);

    let shuffledAnswers = [...memorizeQuestionsData];
    shuffleArray(shuffledAnswers);

    // Buat elemen untuk kolom soal
    shuffledQuestions.forEach((q) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('match-item');
        questionDiv.textContent = q.question;
        questionDiv.dataset.questionId = q.id; // Simpan ID asli soal
        questionDiv.dataset.type = 'question'; // Tipe elemen (penting untuk logika drag)
        matchQuestionsColumn.appendChild(questionDiv);
    });

    // Buat elemen untuk kolom jawaban
    shuffledAnswers.forEach((a) => {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('match-item');
        answerDiv.textContent = a.answer; // Tampilkan hanya jawaban
        answerDiv.dataset.answerId = a.id; // Simpan ID asli jawaban
        answerDiv.dataset.type = 'answer'; // Tipe elemen (penting untuk logika drag)
        matchAnswersColumn.appendChild(answerDiv);
    });
}

/**
 * Menambahkan event listener ke canvas untuk menggambar garis secara manual.
 */
function addCanvasDrawingListeners() {
    // Hapus listener sebelumnya jika ada, untuk menghindari duplikasi
    removeCanvasDrawingListeners(); 

    // Tambahkan kelas untuk mengaktifkan pointer-events pada canvas melalui CSS
    memorizeMatchArea.classList.add('active-drawing');

    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseout', handleCanvasMouseUp); // Jika mouse keluar canvas saat drag
}

/**
 * Menghapus event listener dari canvas.
 */
function removeCanvasDrawingListeners() {
    canvas.removeEventListener('mousedown', handleCanvasMouseDown);
    canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    canvas.removeEventListener('mouseup', handleCanvasMouseUp);
    canvas.removeEventListener('mouseout', handleCanvasMouseUp);

    // Hapus kelas untuk menonaktifkan pointer-events pada canvas melalui CSS
    memorizeMatchArea.classList.remove('active-drawing');
}

/**
 * Handle saat tombol mouse ditekan di canvas.
 * @param {MouseEvent} event
 */
function handleCanvasMouseDown(event) {
    // Hanya proses klik kiri
    if (event.button !== 0) return;

    // Mendapatkan elemen 'match-item' di bawah kursor
    // Kita perlu menggunakan `elementFromPoint` karena canvas memiliki `pointer-events: none`
    // Namun, karena sekarang kita set `pointer-events: auto` saat menggambar, `event.target` bisa jadi canvas itu sendiri
    // Kita perlu cari elemen di lokasi klik, di luar canvas.
    // Metode ini sedikit rumit, coba cari elemen DOM di koordinat mouse, abaikan canvas itu sendiri
    canvas.style.pointerEvents = 'none'; // Temporarily disable canvas pointer events
    const clickedElement = document.elementFromPoint(event.clientX, event.clientY)?.closest('.match-item');
    canvas.style.pointerEvents = 'auto'; // Re-enable canvas pointer events

    // Pastikan elemen yang diklik adalah 'match-item' dan belum dicocokkan
    if (clickedElement && !clickedElement.classList.contains('matched')) {
        isDrawing = true; // Set flag sedang menggambar
        startElement = clickedElement; // Simpan elemen awal
        startElement.classList.add('selected'); // Beri highlight

        // Simpan posisi mouse awal relatif terhadap canvas
        currentMouseX = event.clientX - canvasRect.left;
        currentMouseY = event.clientY - canvasRect.top;
    }
}

/**
 * Handle saat mouse bergerak di canvas (jika sedang menggambar).
 * @param {MouseEvent} event
 */
function handleCanvasMouseMove(event) {
    if (!isDrawing) return; // Hanya jalankan jika sedang menggambar

    // Bersihkan canvas dan gambar ulang garis-garis yang sudah dicocokkan
    clearCanvas();
    redrawLines();

    // Gambar garis "sementara" dari startElement ke posisi kursor saat ini
    const startRect = startElement.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2 - canvasRect.left;
    const startY = startRect.top + startRect.height / 2 - canvasRect.top;

    currentMouseX = event.clientX - canvasRect.left;
    currentMouseY = event.clientY - canvasRect.top;

    ctx.beginPath();
    ctx.strokeStyle = '#ff69b4'; // Warna garis drag (pink cerah)
    ctx.lineWidth = 3;
    ctx.setLineDash([]); // Garis solid
    ctx.moveTo(startX, startY);
    ctx.lineTo(currentMouseX, currentMouseY);
    ctx.stroke();
}

/**
 * Handle saat tombol mouse dilepas di canvas.
 * @param {MouseEvent} event
 */
function handleCanvasMouseUp(event) {
    if (!isDrawing) return; // Hanya jalankan jika sebelumnya sedang menggambar

    isDrawing = false; // Reset flag
    if (startElement) { // Pastikan startElement ada sebelum mencoba menghapus kelas
        startElement.classList.remove('selected'); // Hapus highlight
    }
    
    // Bersihkan garis sementara yang sedang digambar
    clearCanvas();
    redrawLines(); // Gambar ulang garis yang sudah permanen

    // Dapatkan elemen tempat mouse dilepas (handle jika dilepas di luar elemen juga)
    canvas.style.pointerEvents = 'none'; // Temporarily disable canvas pointer events
    const endElement = document.elementFromPoint(event.clientX, event.clientY)?.closest('.match-item');
    canvas.style.pointerEvents = 'auto'; // Re-enable canvas pointer events

    // Validasi: Jika dilepas di luar elemen, di elemen yang sama, atau di elemen yang sudah dicocokkan
    if (!endElement || endElement === startElement || endElement.classList.contains('matched')) {
        startElement = null; // Reset startElement
        return;
    }

    // Pastikan tipe elemen berbeda (soal ke jawaban, atau sebaliknya)
    if (startElement.dataset.type === endElement.dataset.type) {
        startElement = null;
        return;
    }

    // Identifikasi elemen soal dan jawaban
    const questionElement = startElement.dataset.type === 'question' ? startElement : endElement;
    const answerElement = startElement.dataset.type === 'answer' ? startElement : endElement;

    // Validasi apakah elemen soal dari kolom pertanyaan dan elemen jawaban dari kolom jawaban
    if (questionElement.parentNode.id !== 'match-questions-column' || answerElement.parentNode.id !== 'match-answers-column') {
        startElement = null;
        return;
    }

    const questionId = questionElement.dataset.questionId;
    const answerId = answerElement.dataset.answerId;

    // Cari data asli soal dari ID
    const originalQuestion = memorizeQuestionsData.find(q => q.id === questionId);
    const originalAnswer = memorizeQuestionsData.find(a => a.id === answerId);

    let isCorrectMatch = false;
    // Cek apakah ID soal dan ID jawaban cocok (dari data asli)
    if (originalQuestion && originalAnswer && originalQuestion.id === originalAnswer.id) {
        isCorrectMatch = true;
        drawLine(questionElement, answerElement, 'green', true); // Garis hijau putus-putus
    } else {
        drawLine(questionElement, answerElement, 'red', false); // Garis merah solid
    }
    
    // Simpan pasangan yang dicocokkan
    currentMemorizeMatches.push({
        questionId: questionId,
        answerId: answerId,
        isCorrect: isCorrectMatch,
        elements: [questionElement, answerElement] // Simpan referensi elemen agar bisa di-redraw
    });
    
    // Tandai elemen sebagai sudah dicocokkan dan nonaktifkan interaksi untuk elemen tersebut
    questionElement.classList.add('matched');
    answerElement.classList.add('matched');

    startElement = null; // Reset startElement

    // Periksa jika semua sudah dicocokkan secara otomatis
    if (currentMemorizeMatches.length === memorizeQuestionsData.length) {
        checkMatches(); // Panggil fungsi cek hasil
    }
}


/**
 * Menggambar garis di canvas antara dua elemen HTML.
 * @param {HTMLElement} el1 Elemen pertama.
 * @param {HTMLElement} el2 Elemen kedua.
 * @param {string} color Warna garis.
 * @param {boolean} isDashed true jika garis putus-putus, false jika solid.
 */
function drawLine(el1, el2, color, isDashed = false) {
    // Pastikan ctx dan canvasRect sudah ada
    if (!ctx || !canvasRect) {
        console.error("Canvas context or canvasRect not initialized. Cannot draw line.");
        return;
    }

    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    // Hitung posisi tengah elemen relatif terhadap CANVAS
    // Kita perlu offset dari posisi canvas (memorizeMatchArea) itu sendiri
    const x1 = rect1.left + rect1.width / 2 - canvasRect.left;
    const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
    const x2 = rect2.left + rect2.width / 2 - canvasRect.left;
    const y2 = rect2.top + rect2.height / 2 - canvasRect.top;

    ctx.beginPath(); // Mulai jalur baru
    ctx.strokeStyle = color; // Atur warna garis
    ctx.lineWidth = 3; // Atur ketebalan garis
    if (isDashed) {
        ctx.setLineDash([5, 5]); // Garis putus-putus: 5px garis, 5px spasi
    } else {
        ctx.setLineDash([]); // Garis solid (solid line)
    }
    ctx.moveTo(x1, y1); // Pindahkan pena ke titik awal
    ctx.lineTo(x2, y2); // Gambar garis ke titik akhir
    ctx.stroke(); // Tampilkan garis
}

/**
 * Membersihkan seluruh isi canvas.
 */
function clearCanvas() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Memeriksa hasil pencocokan di fase mencocokkan.
 */
function checkMatches() {
    // Nonaktifkan sementara event mouse agar tidak ada interaksi saat hasil ditampilkan
    removeCanvasDrawingListeners();
    checkMatchButton.disabled = true; // Nonaktifkan tombol periksa (jika ada)

    let correctCount = 0;
    currentMemorizeMatches.forEach(match => {
        if (match.isCorrect) {
            correctCount++;
        }
    });

    matchFeedbackElement.textContent = `Kamu benar ${correctCount} dari ${memorizeQuestionsData.length} pasangan!`;
    matchFeedbackElement.style.color = (correctCount === memorizeQuestionsData.length) ? '#4CAF50' : '#F44336';


    // Berikan feedback visual pada garis dan item (border/background)
    currentMemorizeMatches.forEach(match => {
        if (match.isCorrect) {
            match.elements[0].style.borderColor = '#28a745'; // Hijau
            match.elements[1].style.borderColor = '#28a745';
            match.elements[0].style.backgroundColor = '#d9f7d9'; // Background hijau muda
            match.elements[1].style.backgroundColor = '#d9f7d9';
        } else {
            match.elements[0].style.borderColor = '#dc3545'; // Merah
            match.elements[1].style.borderColor = '#dc3545';
            match.elements[0].style.backgroundColor = '#f8d7da'; // Background merah muda
            match.elements[1].style.backgroundColor = '#f8d7da';
        }
    });

    // Setelah feedback, tampilkan pesan akhir
    setTimeout(() => {
        if (correctCount === memorizeQuestionsData.length) {
            showWinMessage();
            document.getElementById('win-message').querySelector('p').textContent = `Selamat! Kamu berhasil mencocokkan semua soal dengan benar! 🎉`;
        } else {
            showLoseMessage(`Maaf, kamu hanya berhasil mencocokkan ${correctCount} dari ${memorizeQuestionsData.length} soal dengan benar. Terus berlatih ya!`);
        }
    }, 2000); // Tunda sebentar agar pemain bisa melihat hasilnya
}


// --- FUNGSI UTILITY UMUM ---

/**
 * Mengacak urutan elemen dalam sebuah array (Fisher-Yates shuffle).
 * @param {Array} array Array yang akan diacak.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// --- INISIALISASI SAAT HALAMAN DIMUAT ---
document.addEventListener('DOMContentLoaded', () => {
    hideAllGameAreas(); // Sembunyikan semua area di awal
    mainMenu.classList.remove('hidden'); // Tampilkan menu utama

    // Dapatkan referensi awal canvas dan konteksnya
    canvas = document.getElementById('match-canvas');
    ctx = canvas.getContext('2d');
    
    // Pastikan ukuran canvas sesuai dengan parent container saat resize
    window.addEventListener('resize', () => {
        // Hanya perlu update jika mode "Ingat & Cocokkan" sedang aktif
        if (!memorizeMatchArea.classList.contains('hidden')) {
            // Perbarui ukuran atribut canvas agar sesuai dengan dimensi CSS
            const containerRect = memorizeMatchArea.getBoundingClientRect();
            canvas.width = containerRect.width;
            canvas.height = containerRect.height;
            
            // Perbarui offset canvas (posisi memorizeMatchArea)
            canvasRect = memorizeMatchArea.getBoundingClientRect();
            
            // Gambar ulang garis jika ada, karena posisi elemen mungkin berubah
            redrawLines(); 
        }
    });
});

/**
 * Menggambar ulang semua garis yang sudah dicocokkan di canvas.
 * Berguna saat layar di-resize atau saat ada garis sementara digambar.
 */
function redrawLines() {
    clearCanvas(); // Bersihkan seluruh canvas
    currentMemorizeMatches.forEach(match => {
        // Periksa apakah elemen masih ada di DOM (belum dihapus/diganti)
        // Ini penting karena elemen bisa saja di-render ulang atau tidak lagi di DOM setelah suatu aksi
        if (document.body.contains(match.elements[0]) && document.body.contains(match.elements[1])) {
            drawLine(match.elements[0], match.elements[1], match.isCorrect ? 'green' : 'red', match.isCorrect);
        }
    });
}
