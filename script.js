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
let startPoint = { x: 0, y: 0 }; // Koordinat awal untuk menggambar garis

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
// (Ini sepertinya tidak ada di HTML yang diberikan, mungkin ini adalah mode yang berbeda atau salah interpretasi.
// Saya akan abaikan bagian ini untuk saat ini, jika diperlukan, bisa ditambahkan)
// const chooseAnswerArea = document.getElementById('choose-answer-area');
// const chooseQuestionDisplay = document.getElementById('choose-question-display');
// const answerChoicesContainer = document.getElementById('answer-choices');
// const chooseFeedbackElement = document.getElementById('choose-feedback');
// let currentChooseQuestionIndex = 0;
// let displayedChooseQuestions = [];
// let chooseCorrectCount = 0;

// --- Elemen Ingat & Cocokkan ---
const memorizeMatchArea = document.getElementById('memorize-match-area');
const memorizeMatchTimerElement = document.getElementById('memorize-match-timer');
const memorizePhase = document.getElementById('memorize-phase');
const memorizeQuestionsList = document.getElementById('memorize-questions-list');
const matchPhase = document.getElementById('match-phase');
const matchQuestionsColumn = document.getElementById('match-questions-column');
const matchAnswersColumn = document.getElementById('match-answers-column');
const matchCanvas = document.getElementById('match-canvas'); // Referensi ke canvas HTML
const checkMatchButton = document.getElementById('check-match-button');
const matchFeedbackElement = document.getElementById('match-feedback');


// --- Fungsi Utilitas Global ---
function hideAllGameAreas() {
    mainMenu.classList.add('hidden');
    levelMenu.classList.add('hidden');
    gameArea.classList.add('hidden');
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    timedChallengeArea.classList.add('hidden');
    memorizeMatchArea.classList.add('hidden');
    // chooseAnswerArea.classList.add('hidden'); // Jika ada mode ini
}

function resetGame() {
    score = 0;
    currentQuestion = {};
    stopTimer();
    stopTimedChallengeTimer();
    stopMemorizeMatchTimer();
    hideAllGameAreas();
    mainMenu.classList.remove('hidden'); // Kembali ke menu utama
}

// --- FUNGSI UTAMA GAME BIASA (Penjumlahan Manis & Pengurangan Ceria) ---

/**
 * Memilih mode game (penjumlahan/pengurangan) dan menampilkan menu level.
 * @param {string} selectedMode 'addition' atau 'subtraction'
 */
function selectMode(selectedMode) {
    mode = selectedMode;
    hideAllGameAreas();
    mainMenu.classList.add('hidden');
    levelMenu.classList.remove('hidden');
}

/**
 * Memulai game dengan tingkat kesulitan yang dipilih.
 * @param {number} selectedLevel Level game (1-5)
 */
function startGame(selectedLevel) {
    level = selectedLevel;
    score = 0; // Reset skor
    hideAllGameAreas();
    levelMenu.classList.add('hidden');
    gameArea.classList.remove('hidden');
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
            // Mencegah input lebih dari 1 digit (kecuali backspace/delete)
            if (event.target.value.length >= 1 && event.key !== 'Backspace' && event.key !== 'Delete' && !event.ctrlKey && !event.metaKey) {
                 // Izinkan panah kiri/kanan, home/end
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
                    return;
                }
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
        singleAnswerInput.classList.add('single-answer-input'); // Tambahkan class untuk styling
        answerInputsContainer.appendChild(singleAnswerInput);

        singleAnswerInput.focus(); // Set fokus ke input box

        // Tambahkan event listener untuk tombol Enter
        singleAnswerInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                checkAnswer();
            }
        });
    }

    // Bersihkan feedback dan sembunyikan tombol 'Selanjutnya'
    feedbackElement.textContent = '';
    feedbackElement.classList.remove('error');
    nextQuestionButton.classList.add('hidden');
    checkButton.style.display = 'inline-block'; // Pastikan tombol cek terlihat

    // Mulai atau reset timer untuk Level 2
    if (level === 2) {
        startTimer();
        timerElement.classList.remove('hidden');
    } else {
        stopTimer(); // Pastikan timer berhenti untuk level lain
        timerElement.classList.add('hidden');
    }
}

/**
 * Memulai timer untuk Level 2.
 */
function startTimer() {
    stopTimer(); // Hentikan timer sebelumnya jika ada
    timeLeft = 10; // Reset waktu
    timerElement.textContent = `Waktu: ${timeLeft} detik`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Waktu: ${timeLeft} detik`;
        if (timeLeft <= 0) {
            stopTimer();
            loseGame('Waktu Habis!');
        }
    }, 1000);
}

/**
 * Menghentikan timer game biasa.
 */
function stopTimer() {
    clearInterval(timerInterval);
}

/**
 * Memeriksa jawaban yang dimasukkan pengguna.
 */
function checkAnswer() {
    let userAnswer;
    if (level >= 4) {
        userAnswer = getAnswerFromBoxes();
        if (userAnswer === null) {
            feedbackElement.textContent = 'Isi semua kotak jawaban, ya!';
            feedbackElement.classList.add('error');
            return;
        }
    } else {
        if (!singleAnswerInput) { // Jaga-jaga jika input tidak ada (error inisialisasi)
            feedbackElement.textContent = 'Terjadi kesalahan, coba lagi.';
            feedbackElement.classList.add('error');
            return;
        }
        userAnswer = parseInt(singleAnswerInput.value);
        if (isNaN(userAnswer)) {
            feedbackElement.textContent = 'Masukkan angka, yaaa!';
            feedbackElement.classList.add('error');
            return;
        }
    }

    // Hentikan timer Level 2 segera setelah menjawab
    if (level === 2) {
        stopTimer();
    }

    if (userAnswer === currentQuestion.correctAnswer) {
        feedbackElement.textContent = 'Horeee! Benar! 🎉';
        feedbackElement.classList.remove('error');
        feedbackElement.style.color = '#4CAF50'; // Hijau
        score++;
        checkButton.style.display = 'none'; // Sembunyikan tombol cek
        nextQuestionButton.classList.remove('hidden'); // Tampilkan tombol selanjutnya
        // Jika input box tunggal, nonaktifkan untuk mencegah perubahan
        if (singleAnswerInput) singleAnswerInput.disabled = true;
        // Jika kotak bersusun, nonaktifkan semua
        answerBoxes.forEach(box => box.disabled = true);
    } else {
        feedbackElement.textContent = `Waduh, salah! Jawaban yang benar adalah ${currentQuestion.correctAnswer} 😢`;
        feedbackElement.classList.add('error');
        feedbackElement.style.color = '#F44336'; // Merah
        checkButton.style.display = 'none'; // Sembunyikan tombol cek
        nextQuestionButton.classList.remove('hidden'); // Tampilkan tombol selanjutnya
        // Jika input box tunggal, nonaktifkan untuk mencegah perubahan
        if (singleAnswerInput) singleAnswerInput.disabled = true;
        // Jika kotak bersusun, nonaktifkan semua
        answerBoxes.forEach(box => box.disabled = true);
    }
}

/**
 * Melanjutkan ke soal berikutnya atau menampilkan pesan menang/kalah.
 */
function nextQuestion() {
    // Reset input dan feedback
    if (singleAnswerInput) {
        singleAnswerInput.value = '';
        singleAnswerInput.disabled = false;
        singleAnswerInput.focus();
    }
    answerBoxes.forEach(box => {
        box.value = '';
        box.disabled = false;
    });

    feedbackElement.textContent = '';
    nextQuestionButton.classList.add('hidden');
    checkButton.style.display = 'inline-block'; // Tampilkan kembali tombol cek

    if (score >= WIN_THRESHOLD) {
        winGame();
    } else {
        generateQuestion();
    }
}

/**
 * Menampilkan pesan kemenangan.
 */
function winGame() {
    hideAllGameAreas();
    winMessage.classList.remove('hidden');
}

/**
 * Menampilkan pesan kekalahan.
 * @param {string} reason Alasan kekalahan (misal: "Waktu Habis!")
 */
function loseGame(reason) {
    hideAllGameAreas();
    loseTextElement.textContent = reason;
    loseMessage.classList.remove('hidden');
}

// --- FUNGSI MODE UJIAN KILAT (Timed Challenge) ---

/**
 * Memulai mode Ujian Kilat.
 */
function startTimedChallenge() {
    hideAllGameAreas();
    timedChallengeArea.classList.remove('hidden');
    timedChallengeQuestions = [];
    currentTimedQuestionIndex = 0;
    timedChallengeCorrectCount = 0;
    timedChallengeTimeLeft = 60; // Reset waktu untuk ujian kilat

    // Generate semua soal untuk ujian kilat
    for (let i = 0; i < MAX_TIMED_QUESTIONS; i++) {
        let num1 = Math.floor(Math.random() * 20) + 1; // Angka 1-20
        let num2 = Math.floor(Math.random() * 20) + 1;
        let operatorSymbol = '+'; // Ujian kilat hanya penjumlahan
        let correctAnswer = num1 + num2;
        timedChallengeQuestions.push({
            question: `${num1} ${operatorSymbol} ${num2} = ?`,
            correctAnswer: correctAnswer
        });
    }

    displayTimedQuestion();
    startTimedChallengeTimer();
    timedAnswerInput.focus();
}

/**
 * Menampilkan soal ujian kilat saat ini.
 */
function displayTimedQuestion() {
    if (currentTimedQuestionIndex < MAX_TIMED_QUESTIONS) {
        timedQuestionDisplay.textContent = timedChallengeQuestions[currentTimedQuestionIndex].question;
        timedAnswerInput.value = ''; // Bersihkan input
        timedChallengeProgressElement.textContent = `Soal ${currentTimedQuestionIndex + 1}/${MAX_TIMED_QUESTIONS}`;
        timedChallengeFeedbackElement.textContent = ''; // Bersihkan feedback
    } else {
        // Semua soal sudah terjawab
        finishTimedChallenge();
    }
}

/**
 * Memulai timer untuk mode Ujian Kilat.
 */
function startTimedChallengeTimer() {
    stopTimedChallengeTimer(); // Hentikan timer sebelumnya
    timedChallengeTimerElement.textContent = `Waktu: ${timedChallengeTimeLeft} detik`;
    timedChallengeTimer = setInterval(() => {
        timedChallengeTimeLeft--;
        timedChallengeTimerElement.textContent = `Waktu: ${timedChallengeTimeLeft} detik`;
        if (timedChallengeTimeLeft <= 0) {
            stopTimedChallengeTimer();
            finishTimedChallenge();
        }
    }, 1000);
}

/**
 * Menghentikan timer ujian kilat.
 */
function stopTimedChallengeTimer() {
    clearInterval(timedChallengeTimer);
}

/**
 * Mengirim jawaban untuk soal ujian kilat.
 */
function submitTimedAnswer() {
    const userAnswer = parseInt(timedAnswerInput.value);
    if (isNaN(userAnswer)) {
        timedChallengeFeedbackElement.textContent = 'Isi jawaban dulu, ya!';
        timedChallengeFeedbackElement.style.color = '#F44336';
        return;
    }

    const correctAnswer = timedChallengeQuestions[currentTimedQuestionIndex].correctAnswer;

    if (userAnswer === correctAnswer) {
        timedChallengeCorrectCount++;
        timedChallengeFeedbackElement.textContent = 'Benar! 👍';
        timedChallengeFeedbackElement.style.color = '#4CAF50';
    } else {
        timedChallengeFeedbackElement.textContent = `Salah! Jawaban: ${correctAnswer} 👎`;
        timedChallengeFeedbackElement.style.color = '#F44336';
    }

    currentTimedQuestionIndex++;
    // Beri sedikit jeda sebelum menampilkan soal berikutnya agar pengguna bisa melihat feedback
    setTimeout(() => {
        displayTimedQuestion();
        timedAnswerInput.focus();
    }, 800);
}

/**
 * Menyelesaikan mode Ujian Kilat dan menampilkan hasil.
 */
function finishTimedChallenge() {
    stopTimedChallengeTimer();
    let resultMessage = '';
    if (timedChallengeCorrectCount >= MAX_TIMED_QUESTIONS) {
        winGame();
        return; // Langsung ke winGame jika semua benar
    } else {
        resultMessage = `Kamu berhasil menjawab ${timedChallengeCorrectCount} dari ${MAX_TIMED_QUESTIONS} soal. Terus semangat belajar, ya!`;
        loseGame(resultMessage);
    }
}


// --- FUNGSI MODE INGAT & COCOKKAN (Memorize & Match) ---

/**
 * Memulai mode Ingat & Cocokkan.
 */
function startMemorizeMatchMode() {
    hideAllGameAreas();
    memorizeMatchArea.classList.remove('hidden');
    memorizeMatchTimeLeft = 60; // Reset waktu
    memorizeQuestionsData = [];
    currentMemorizeMatches = [];
    clearCanvas(); // Bersihkan garis di canvas
    
    matchFeedbackElement.textContent = ''; // Bersihkan feedback

    // Generate 5 pasangan soal-jawaban
    for (let i = 0; i < 5; i++) {
        let num1 = Math.floor(Math.random() * 15) + 5; // Angka 5-19
        let num2 = Math.floor(Math.random() * 15) + 5;
        let questionText = `${num1} + ${num2}`;
        let answer = num1 + num2;
        memorizeQuestionsData.push({ question: questionText, answer: answer, id: i });
    }

    shuffleArray(memorizeQuestionsData); // Acak urutan pertanyaan untuk fase mengingat

    displayMemorizePhase();
    startMemorizeMatchTimer();
    checkMatchButton.classList.add('hidden'); // Sembunyikan tombol ini, karena akan otomatis dicek saat drag/drop
    
    // Inisialisasi canvas
    canvas = matchCanvas;
    ctx = canvas.getContext('2d');
    // Set canvas dimensions to match its parent for correct drawing (important!)
    const matchColumnsRect = document.querySelector('.match-columns').getBoundingClientRect();
    canvas.width = matchColumnsRect.width;
    canvas.height = matchColumnsRect.height;
    
    // Add event listeners for drawing
    setupCanvasDrawingListeners();
}

/**
 * Mengacak array.
 * @param {Array} array Array yang akan diacak.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Menampilkan fase mengingat soal dan jawaban.
 */
function displayMemorizePhase() {
    memorizePhase.classList.remove('hidden');
    matchPhase.classList.add('hidden');
    memorizeQuestionsList.innerHTML = '';

    memorizeQuestionsData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('memorize-item');
        div.textContent = `${item.question} = ${item.answer}`;
        memorizeQuestionsList.appendChild(div);
    });

    // Pindah ke fase mencocokkan setelah beberapa detik (misal 5-7 detik)
    setTimeout(() => {
        displayMatchPhase();
    }, 7000); // 7 detik untuk mengingat
}

/**
 * Menampilkan fase mencocokkan.
 */
function displayMatchPhase() {
    memorizePhase.classList.add('hidden');
    matchPhase.classList.remove('hidden');
    memorizeMatchTimerElement.style.color = '#e74c3c'; // Ganti warna timer agar lebih terlihat

    matchQuestionsColumn.innerHTML = '';
    matchAnswersColumn.innerHTML = '';

    let questionsToDisplay = memorizeQuestionsData.map(item => ({ id: item.id, text: item.question }));
    let answersToDisplay = memorizeQuestionsData.map(item => ({ id: item.id, text: item.answer }));

    shuffleArray(questionsToDisplay);
    shuffleArray(answersToDisplay);

    questionsToDisplay.forEach(q => {
        const div = document.createElement('div');
        div.classList.add('match-item');
        div.dataset.id = `q-${q.id}`; // id unik untuk pertanyaan
        div.textContent = q.text;
        matchQuestionsColumn.appendChild(div);
    });

    answersToDisplay.forEach(a => {
        const div = document.createElement('div');
        div.classList.add('match-item');
        div.dataset.id = `a-${a.id}`; // id unik untuk jawaban
        div.textContent = a.text;
        matchAnswersColumn.appendChild(div);
    });

    // Perbarui posisi canvas jika ukuran elemen berubah
    const matchColumnsRect = document.querySelector('.match-columns').getBoundingClientRect();
    canvas.width = matchColumnsRect.width;
    canvas.height = matchColumnsRect.height;
    canvas.style.left = `${matchQuestionsColumn.getBoundingClientRect().right - matchColumnsRect.left}px`;
    canvas.style.top = `0px`; // Sesuaikan jika ada padding di .match-columns

    addMatchItemListeners(); // Tambahkan event listener untuk setiap item yang bisa dicocokkan
}

/**
 * Memulai timer untuk mode Ingat & Cocokkan.
 */
function startMemorizeMatchTimer() {
    stopMemorizeMatchTimer();
    memorizeMatchTimerElement.textContent = `Waktu: ${memorizeMatchTimeLeft} detik`;
    memorizeMatchTimer = setInterval(() => {
        memorizeMatchTimeLeft--;
        memorizeMatchTimerElement.textContent = `Waktu: ${memorizeMatchTimeLeft} detik`;
        if (memorizeMatchTimeLeft <= 0) {
            stopMemorizeMatchTimer();
            finishMemorizeMatch();
        }
    }, 1000);
}

/**
 * Menghentikan timer mode Ingat & Cocokkan.
 */
function stopMemorizeMatchTimer() {
    clearInterval(memorizeMatchTimer);
}

/**
 * Menyiapkan event listener untuk menggambar garis di canvas.
 */
function setupCanvasDrawingListeners() {
    // Pastikan canvas dan ctx sudah diinisialisasi
    if (!canvas || !ctx) {
        console.error("Canvas atau Context belum diinisialisasi.");
        return;
    }

    const memorizeMatchAreaRect = memorizeMatchArea.getBoundingClientRect();

    memorizeMatchArea.addEventListener('mousedown', (e) => {
        // Hanya mulai menggambar jika klik pada item di kolom pertanyaan
        startElement = e.target.closest('.match-item');
        if (startElement && startElement.parentElement.id === 'match-questions-column' && !startElement.classList.contains('matched')) {
            isDrawing = true;
            startElement.classList.add('selected'); // Highlight item yang dipilih
            // Dapatkan posisi relatif terhadap memorizeMatchArea untuk menggambar di canvas
            const startRect = startElement.getBoundingClientRect();
            startPoint = {
                x: (startRect.right - memorizeMatchAreaRect.left), // Ujung kanan item pertanyaan
                y: (startRect.top + startRect.height / 2 - memorizeMatchAreaRect.top)
            };
            currentMouseX = startPoint.x;
            currentMouseY = startPoint.y;
        }
    });

    memorizeMatchArea.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;

        // Dapatkan posisi mouse relatif terhadap memorizeMatchArea
        currentMouseX = e.clientX - memorizeMatchAreaRect.left;
        currentMouseY = e.clientY - memorizeMatchAreaRect.top;

        redrawLines(); // Gambar ulang semua garis yang sudah dicocokkan
        drawCurrentLine(startPoint.x, startPoint.y, currentMouseX, currentMouseY); // Gambar garis sementara
    });

    memorizeMatchArea.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        if (startElement) {
            startElement.classList.remove('selected');
        }

        const endElement = e.target.closest('.match-item');
        if (endElement && endElement.parentElement.id === 'match-answers-column' && !endElement.classList.contains('matched')) {
            // Drop pada item di kolom jawaban
            const questionId = startElement.dataset.id.replace('q-', '');
            const answerId = endElement.dataset.id.replace('a-', '');

            // Pastikan belum ada pasangan yang sama dan item belum dicocokkan
            const alreadyMatched = currentMemorizeMatches.some(match =>
                (match.questionId === questionId && match.answerId === answerId) ||
                (match.questionId === questionId && match.answerId === answerId)
            );

            if (!alreadyMatched && questionId === answerId) { // Jawaban benar
                currentMemorizeMatches.push({
                    questionEl: startElement,
                    answerEl: endElement,
                    questionId: questionId,
                    answerId: answerId
                });
                startElement.classList.add('matched');
                endElement.classList.add('matched');
                matchFeedbackElement.textContent = 'Cocok! Lanjutkan! 👍';
                matchFeedbackElement.style.color = '#4CAF50';
                
                // Redraw semua garis termasuk yang baru
                redrawLines();

                // Cek apakah semua sudah cocok
                if (currentMemorizeMatches.length === memorizeQuestionsData.length) {
                    setTimeout(finishMemorizeMatch, 500); // Beri sedikit jeda
                }
            } else if (questionId !== answerId) { // Jawaban salah
                matchFeedbackElement.textContent = 'Salah cocok! Coba lagi. 👎';
                matchFeedbackElement.style.color = '#F44336';
                redrawLines(); // Gambar ulang untuk membersihkan garis yang salah
            }
        } else {
            // Drop di luar target yang valid, bersihkan garis sementara
            redrawLines();
        }
    });

    // Mencegah masalah saat mouse meninggalkan area saat drag
    memorizeMatchArea.addEventListener('mouseleave', () => {
        if (isDrawing) {
            isDrawing = false;
            if (startElement) {
                startElement.classList.remove('selected');
            }
            redrawLines();
        }
    });
}

/**
 * Menambahkan event listener ke setiap item pencocokan (untuk drag and drop).
 */
function addMatchItemListeners() {
    document.querySelectorAll('.match-item').forEach(item => {
        // Tambahkan atribut draggable
        item.draggable = true;
        // Event listener dragstart, dragover, drop akan dihandle secara global di memorizeMatchArea
        // Karena kita menggambar di canvas, kita hanya perlu info posisi mouse
        // Event listener mouseup/mousedown/mousemove di memorizeMatchArea sudah menangani ini
    });
}

/**
 * Menggambar ulang semua garis yang sudah dicocokkan di canvas.
 */
function redrawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan seluruh canvas

    const memorizeMatchAreaRect = memorizeMatchArea.getBoundingClientRect();

    currentMemorizeMatches.forEach(match => {
        const qRect = match.questionEl.getBoundingClientRect();
        const aRect = match.answerEl.getBoundingClientRect();

        const startX = (qRect.right - memorizeMatchAreaRect.left);
        const startY = (qRect.top + qRect.height / 2 - memorizeMatchAreaRect.top);
        const endX = (aRect.left - memorizeMatchAreaRect.left);
        const endY = (aRect.top + aRect.height / 2 - memorizeMatchAreaRect.top);

        drawLine(startX, startY, endX, endY, '#4CAF50'); // Hijau untuk garis benar
    });
}

/**
 * Menggambar satu garis di canvas.
 * @param {number} x1 Koordinat X awal.
 * @param {number} y1 Koordinat Y awal.
 * @param {number} x2 Koordinat X akhir.
 * @param {number} y2 Koordinat Y akhir.
 * @param {string} color Warna garis.
 */
function drawLine(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
}

/**
 * Menggambar garis sementara saat drag.
 */
function drawCurrentLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#ff69b4'; // Pink untuk garis sementara
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Garis putus-putus
    ctx.stroke();
    ctx.setLineDash([]); // Reset ke garis solid
}

/**
 * Membersihkan semua garis di canvas.
 */
function clearCanvas() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Menyelesaikan mode Ingat & Cocokkan dan menampilkan hasil.
 */
function finishMemorizeMatch() {
    stopMemorizeMatchTimer();
    clearCanvas(); // Pastikan canvas bersih saat selesai

    let allCorrect = currentMemorizeMatches.length === memorizeQuestionsData.length;

    if (allCorrect) {
        winGame();
    } else {
        loseGame(`Kamu hanya berhasil mencocokkan ${currentMemorizeMatches.length} dari ${memorizeQuestionsData.length} pasangan. Coba lagi, ya!`);
    }
}

// --- Event Listener Global (untuk memastikan DOM sudah siap) ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial setup: show main menu, hide other areas
    hideAllGameAreas();
    mainMenu.classList.remove('hidden');

    // Attach initial event listeners to buttons that are always visible or appear first
    document.querySelector('button[onclick="selectMode(\'addition\')"]').addEventListener('click', () => selectMode('addition'));
    document.querySelector('button[onclick="selectMode(\'subtraction\')"]').addEventListener('click', () => selectMode('subtraction'));
    document.querySelector('button[onclick="startTimedChallenge()"]').addEventListener('click', startTimedChallenge);
    document.querySelector('button[onclick="startMemorizeMatchMode()"]').addEventListener('click', startMemorizeMatchMode);

    // Add listeners for level selection buttons (delegation or directly if they exist on load)
    document.querySelectorAll('#level-menu button').forEach(button => {
        button.addEventListener('click', (e) => {
            const levelNum = parseInt(e.target.textContent.match(/\d+/)[0]);
            startGame(levelNum);
        });
    });

    // Add listeners for general game buttons
    checkButton.addEventListener('click', checkAnswer);
    nextQuestionButton.addEventListener('click', nextQuestion);
    document.querySelectorAll('#win-message button, #lose-message button').forEach(button => {
        button.addEventListener('click', resetGame);
    });
});
