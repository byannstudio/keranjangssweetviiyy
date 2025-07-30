let mode = 'addition';
let level = 1;
let currentQuestion = {};
let timerInterval; // Untuk level 2
let timeLeft = 10;
let score = 0;
const WIN_THRESHOLD = 5; // Jumlah jawaban benar untuk menang di mode level biasa

// --- Variabel untuk Mode Ujian Kilat ---
let timedChallengeTimer;
let timedChallengeTimeLeft = 60; // 1 menit
let timedChallengeQuestions = []; // Menyimpan soal & jawaban dari ujian kilat
let currentTimedQuestionIndex = 0;
const MAX_TIMED_QUESTIONS = 5; // Jumlah soal di ujian kilat
let timedChallengeCorrectCount = 0; // Jumlah jawaban benar di ujian kilat

// --- Variabel untuk Mode Ingat & Cocokkan ---
let memorizeMatchTimer;
let memorizeMatchTimeLeft = 60; // Total waktu untuk kedua fase
let memorizeQuestionsData = []; // Menyimpan soal dan jawaban untuk fase mengingat
let currentMemorizeMatches = []; // Menyimpan pasangan yang dicocokkan pengguna
let selectedMatchElement = null; // Elemen yang sedang dipilih (dari kolom kiri/kanan)

// --- Canvas untuk menggambar garis ---
let canvas;
let ctx;
let canvasRect; // Untuk menghitung posisi elemen relatif terhadap canvas

// --- Referensi Elemen HTML ---
const mainMenu = document.getElementById('main-menu');
const levelMenu = document.getElementById('level-menu');
const gameArea = document.getElementById('game-area');
const winMessage = document.getElementById('win-message');
const loseMessage = document.getElementById('lose-message'); // Pesan kalah/selesai
const loseTextElement = document.getElementById('lose-text');

const questionElement = document.getElementById('question');
const susunHintElement = document.getElementById('susun-hint');
const answerInputsContainer = document.getElementById('answer-inputs');
const feedbackElement = document.getElementById('feedback');
const timerElement = document.getElementById('timer');
const checkButton = document.getElementById('check-button');
const nextQuestionButton = document.getElementById('next-question-button');

let answerBoxes = [];
let singleAnswerInput = null;

// --- Elemen Ujian Kilat ---
const timedChallengeArea = document.getElementById('timed-challenge-area');
const timedQuestionDisplay = document.getElementById('timed-question-display');
const timedAnswerInput = document.getElementById('timed-answer-input');
const timedChallengeTimerElement = document.getElementById('timed-challenge-timer');
const timedChallengeProgressElement = document.getElementById('timed-challenge-progress');
const timedChallengeFeedbackElement = document.getElementById('timed-challenge-feedback');

// --- Elemen Pilih Jawaban Acak ---
const chooseAnswerArea = document.getElementById('choose-answer-area');
const chooseQuestionDisplay = document.getElementById('choose-question-display');
const answerChoicesContainer = document.getElementById('answer-choices');
const chooseFeedbackElement = document.getElementById('choose-feedback');

// --- Elemen Ingat & Cocokkan ---
const memorizeMatchArea = document.getElementById('memorize-match-area');
const memorizeMatchTimerElement = document.getElementById('memorize-match-timer');
const memorizePhase = document.getElementById('memorize-phase');
const memorizeQuestionsList = document.getElementById('memorize-questions-list');
const matchPhase = document.getElementById('match-phase');
const matchQuestionsColumn = document.getElementById('match-questions-column');
const matchAnswersColumn = document.getElementById('match-answers-column');
const matchCanvas = document.getElementById('match-canvas');
const checkMatchButton = document.getElementById('check-match-button');
const matchFeedbackElement = document.getElementById('match-feedback');


// --- FUNGSI UTAMA GAME BIASA ---
/**
 * Memilih mode game (penjumlahan/pengurangan) dan menampilkan menu level.
 * @param {string} selectedMode 'addition' atau 'subtraction'
 */
function selectMode(selectedMode) {
    mode = selectedMode;
    mainMenu.classList.add('hidden');
    levelMenu.classList.remove('hidden');
    hideAllGameAreas(); // Pastikan area lain tersembunyi
}

/**
 * Memulai game dengan tingkat kesulitan yang dipilih.
 * @param {number} selectedLevel Level game (1-5)
 */
function startGame(selectedLevel) {
    level = selectedLevel;
    score = 0;
    levelMenu.classList.add('hidden');
    hideAllGameAreas();
    gameArea.classList.remove('hidden'); // Tampilkan game area
    nextQuestion();
}

/**
 * Membuat kotak input jawaban terpisah untuk setiap digit.
 * Digunakan untuk level bersusun.
 * @param {number} numDigits Jumlah digit jawaban.
 */
function createAnswerBoxes(numDigits) {
    answerInputsContainer.innerHTML = '';
    answerBoxes = [];
    singleAnswerInput = null; // Pastikan input tunggal dinonaktifkan

    for (let i = 0; i < numDigits; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.maxLength = 1; // Hanya bisa 1 digit
        input.min = 0;
        input.max = 9;
        input.classList.add('answer-box');
        input.id = `answer-box-${i}`;
        answerInputsContainer.prepend(input); // Tambahkan dari kanan ke kiri
        answerBoxes.push(input);
    }

    answerBoxes.reverse(); // Urutkan kembali agar box[0] adalah digit pertama

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
 * @returns {number} Jawaban pengguna sebagai angka.
 */
function getAnswerFromBoxes() {
    let userAnswerString = '';
    answerBoxes.forEach(box => {
        userAnswerString += box.value;
    });
    return parseInt(userAnswerString);
}


/**
 * Menggenerasi soal matematika berdasarkan mode dan level yang dipilih.
 */
function generateQuestion() {
    let num1, num2, answer;

    susunHintElement.classList.add('hidden');
    questionElement.classList.remove('question-animated');
    questionElement.innerHTML = '';
    answerInputsContainer.innerHTML = '';
    answerBoxes = [];
    singleAnswerInput = null;

    if (level >= 4) { // Level 4 & 5 (susun)
        num1 = Math.floor(Math.random() * 90) + 10; // Angka 2 digit (10-99)
        num2 = Math.floor(Math.random() * 90) + 10;

        if (mode === 'subtraction' && num2 > num1) {
            [num1, num2] = [num2, num1]; // Pastikan num1 lebih besar untuk pengurangan
        } else if (mode === 'addition' && (num1 + num2) > 199) {
            // Pastikan hasil penjumlahan tidak lebih dari 3 digit (max 198)
            do {
                num1 = Math.floor(Math.random() * 90) + 10;
                num2 = Math.floor(Math.random() * 90) + 10;
            } while ((num1 + num2) > 199);
        }

        answer = mode === 'addition' ? num1 + num2 : num1 - num2;
        
        let operator = mode === 'addition' ? '+' : '-';
        // Tampilkan soal bersusun dengan padding agar rapi
        let questionText = `${String(num1).padStart(2, ' ')}\n${operator} ${String(num2).padStart(2, ' ')}\n-----\n  ?`;
        questionElement.textContent = questionText;
        currentQuestion = { num1, num2, correctAnswer: answer, operator };

        const numDigits = String(answer).length;
        createAnswerBoxes(numDigits); // Buat kotak jawaban sesuai jumlah digit

        if (level === 4) { // Tampilkan petunjuk di Level 4
            susunHintElement.classList.remove('hidden');
            let hintContent = `
                <h3>Yuk, Intip Cara Susunnya! 📝</h3>
                <p>1. Mulai hitung dari angka paling **kanan** (satuan): <strong>${num1 % 10} ${operator} ${num2 % 10}</strong>.</p>
                <p>2. Tulis hasil satuannya di kotak jawaban paling kanan.</p>
                <p>3. Kalau ada sisa (puluhan dari penjumlahan), ingat-ingat untuk ditambahkan ke hitungan berikutnya.</p>
                <p>4. Lanjut hitung angka di sebelahnya (puluhan), dst.</p>
                <p>Ingat, selalu mulai dari belakang ya! 😉</p>
            `;
            susunHintElement.innerHTML = hintContent;
        }

    } else { // Level 1, 2, 3 (pertanyaan biasa, pakai 1 input box)
        if (level === 3) {
            num1 = Math.floor(Math.random() * 90) + 10; // Angka 2 digit
            num2 = Math.floor(Math.random() * 90) + 10;
        } else {
            num1 = Math.floor(Math.random() * 10) + 1; // Angka 1-10
            num2 = Math.floor(Math.random() * 10) + 1;
        }

        if (mode === 'subtraction' && num2 > num1) [num1, num2] = [num2, num1]; // Pastikan num1 lebih besar
        
        answer = mode === 'addition' ? num1 + num2 : num1 - num2;
        
        questionElement.classList.add('question-animated');
        let operatorSymbol = mode === 'addition' ? '+' : '-';
        questionElement.textContent = `${num1} ${operatorSymbol} ${num2} = ?`;
        
        currentQuestion = { num1, num2, correctAnswer: answer };

        singleAnswerInput = document.createElement('input');
        singleAnswerInput.type = 'number';
        singleAnswerInput.id = 'answer';
        singleAnswerInput.placeholder = 'Jawab di sini, yaaa...';
        singleAnswerInput.classList.add('single-answer-input');
        answerInputsContainer.appendChild(singleAnswerInput);
        
        singleAnswerInput.focus();
        singleAnswerInput.addEventListener('keypress', handleKeyPress);
    }
    
    // Kosongkan input jawaban
    if (singleAnswerInput) {
        singleAnswerInput.value = '';
    } else {
        answerBoxes.forEach(box => box.value = '');
    }

    feedbackElement.textContent = '';
    checkButton.classList.remove('hidden');
    nextQuestionButton.classList.add('hidden');
    
    // Fokus ke input jawaban pertama
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
        showWinMessage();
        return;
    }
    generateQuestion();

    if (level === 2) { // Logic timer hanya untuk Level 2
        timeLeft = 10;
        timerElement.textContent = `Waktu: ${timeLeft} detik ⏳`;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Waktu: ${timeLeft} detik ⏳`;
            if (timeLeft <= 3 && timeLeft > 0) {
                timerElement.style.color = 'red'; // Warna merah saat waktu menipis
            } else {
                timerElement.style.color = '#e83e8c';
            }

            if (timeLeft === 0) {
                clearInterval(timerInterval);
                feedbackElement.textContent = '⏰ Waktu Habis! Yuk, coba lagi!';
                checkButton.classList.add('hidden');
                nextQuestionButton.classList.remove('hidden');
            }
        }, 1000);
    } else {
        timerElement.textContent = ''; // Tidak ada timer untuk level lain
        clearInterval(timerInterval);
    }
}

/**
 * Memeriksa jawaban pengguna.
 */
function checkAnswer() {
    let userAnswer;

    if (level >= 4) { // Untuk level bersusun
        userAnswer = getAnswerFromBoxes();
        const allFilled = answerBoxes.every(box => box.value !== '');
        if (!allFilled) {
            feedbackElement.textContent = 'Isi semua kotak jawaban dulu, ya! 🤔';
            return;
        }
    } else { // Untuk level biasa
        if (!singleAnswerInput) {
            feedbackElement.textContent = 'Ada masalah dengan input jawaban. Coba lagi!';
            return;
        }
        userAnswer = parseInt(singleAnswerInput.value);
        if (isNaN(userAnswer)) {
            feedbackElement.textContent = 'Isi jawabanmu dulu, ya! 🤔';
            return;
        }
    }

    if (userAnswer === currentQuestion.correctAnswer) {
        feedbackElement.textContent = '💖 Yeay, Benar! Kamu Hebat! 🎉';
        score++;
        if (level === 2) clearInterval(timerInterval); // Hentikan timer jika benar di level 2
        checkButton.classList.add('hidden');
        nextQuestionButton.classList.remove('hidden');
    } else {
        feedbackElement.textContent = '❌ Ups, salah! Jangan nyerah, coba lagi! 😅';
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
 * Handle penekanan tombol Enter pada input jawaban.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (!checkButton.classList.contains('hidden') && (singleAnswerInput && singleAnswerInput.value !== '')) {
            checkAnswer();
        } 
        else if (!nextQuestionButton.classList.contains('hidden')) {
            nextQuestion();
        }
    }
}

/**
 * Menampilkan pesan kemenangan.
 */
function showWinMessage() {
    hideAllGameAreas();
    winMessage.classList.remove('hidden');
    clearInterval(timerInterval); // Hentikan timer
    // Hapus event listener untuk menghindari duplikasi
    if (singleAnswerInput) {
        singleAnswerInput.removeEventListener('keypress', handleKeyPress);
    }
    answerBoxes.forEach(box => box.removeEventListener('keypress', handleKeyPress));
}

/**
 * Menampilkan pesan kekalahan atau selesai ujian.
 * @param {string} message Pesan yang akan ditampilkan.
 */
function showLoseMessage(message) {
    hideAllGameAreas();
    loseMessage.classList.remove('hidden');
    loseTextElement.textContent = message;
    clearInterval(timedChallengeTimer); // Hentikan timer ujian kilat
    clearInterval(memorizeMatchTimer); // Hentikan timer mode ingat & cocokkan
}

/**
 * Menyembunyikan semua area game dan pesan.
 */
function hideAllGameAreas() {
    mainMenu.classList.add('hidden');
    levelMenu.classList.add('hidden');
    gameArea.classList.add('hidden');
    timedChallengeArea.classList.add('hidden');
    chooseAnswerArea.classList.add('hidden');
    memorizeMatchArea.classList.add('hidden'); // Sembunyikan mode baru
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    // Bersihkan semua timer aktif
    clearInterval(timerInterval);
    clearInterval(timedChallengeTimer);
    clearInterval(memorizeMatchTimer);
}

/**
 * Mereset game ke kondisi awal menu utama.
 */
function resetGame() {
    hideAllGameAreas();
    mainMenu.classList.remove('hidden');
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
    timedChallengeTimerElement.style.color = '#e74c3c';
    timedChallengeTimerElement.textContent = 'Waktu: 60 detik';
    timedChallengeProgressElement.textContent = 'Soal 0/5';

    // Reset variabel spesifik ingat & cocokkan
    memorizeMatchTimeLeft = 60;
    memorizeQuestionsData = [];
    currentMemorizeMatches = [];
    selectedMatchElement = null;
    clearCanvas(); // Bersihkan canvas
}


// --- FUNGSI UNTUK MODE UJIAN KILAT ---
/**
 * Memulai mode ujian kilat.
 */
function startTimedChallenge() {
    hideAllGameAreas();
    timedChallengeArea.classList.remove('hidden');
    timedChallengeTimeLeft = 60;
    currentTimedQuestionIndex = 0;
    timedChallengeQuestions = [];
    timedChallengeCorrectCount = 0;
    timedChallengeFeedbackElement.textContent = '';
    timedAnswerInput.value = '';
    timedChallengeTimerElement.style.color = '#e74c3c';

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

    displayTimedQuestion();
    startTimedChallengeTimer();
    timedAnswerInput.focus();
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
    clearInterval(timedChallengeTimer);
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
            timedChallengeTimerElement.style.color = '#e74c3c';
        }

        if (timedChallengeTimeLeft <= 0) {
            clearInterval(timedChallengeTimer);
            if (currentTimedQuestionIndex === 0) { // Jika belum jawab sama sekali
                showLoseMessage('Waktu Ujian Kilat Habis! Kamu belum menjawab soal.');
                setTimeout(() => { resetGame(); }, 1500); // Langsung reset
            } else {
                // Sisa soal yang belum dijawab dianggap tidak terjawab
                for (let i = currentTimedQuestionIndex; i < MAX_TIMED_QUESTIONS; i++) {
                    timedChallengeQuestions[i].userAnswer = null;
                }
                showLoseMessage('Waktu Ujian Kilat Habis! Lanjut ke fase berikutnya.');
                setTimeout(() => {
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
        return;
    }

    currentQ.userAnswer = userAnswer; // Simpan jawaban pengguna
    
    if (userAnswer === currentQ.correctAnswer) {
        timedChallengeFeedbackElement.textContent = '✔ Benar!';
        timedChallengeCorrectCount++;
    } else {
        timedChallengeFeedbackElement.textContent = `✖ Salah! Jawabannya ${currentQ.correctAnswer}`;
    }

    currentTimedQuestionIndex++;
    if (currentTimedQuestionIndex < MAX_TIMED_QUESTIONS) {
        setTimeout(() => {
            timedChallengeFeedbackElement.textContent = '';
            displayTimedQuestion();
        }, 1000); // Beri jeda sebentar sebelum soal berikutnya
    } else {
        endTimedChallenge(); // Semua soal sudah dijawab
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
    clearInterval(timedChallengeTimer);
    timedAnswerInput.removeEventListener('keypress', handleTimedChallengeKeyPress);
    hideAllGameAreas();
    startChooseAnswerPhase();
}


// --- FUNGSI UNTUK MODE PILIH JAWABAN ACAK ---
let currentChooseQuestionIndex = 0;
let displayedChooseQuestions = [];
let chooseCorrectCount = 0;

/**
 * Memulai fase pilih jawaban acak.
 */
function startChooseAnswerPhase() {
    chooseAnswerArea.classList.remove('hidden');
    currentChooseQuestionIndex = 0;
    chooseCorrectCount = 0;
    chooseFeedbackElement.textContent = '';
    
    // Hanya gunakan soal yang dijawab di fase pertama (bukan yang null)
    displayedChooseQuestions = timedChallengeQuestions.filter(q => q.userAnswer !== null);
    if (displayedChooseQuestions.length === 0) {
        // Jika tidak ada soal yang dijawab di ujian kilat, langsung kalah
        showLoseMessage('Tidak ada soal yang dijawab di Ujian Kilat untuk fase ini.');
        setTimeout(() => { resetGame(); }, 1500);
        return;
    }
    shuffleArray(displayedChooseQuestions); // Acak urutan soal

    displayChooseQuestion();
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
        let choices = [];
        choices.push(q.correctAnswer); // Jawaban benar

        // Tambahkan 3 jawaban acak yang salah
        while (choices.length < 4) {
            let randomWrongAnswer = Math.floor(Math.random() * 20) + 2; // Jawaban acak antara 2-21
            // Pastikan jawaban salah tidak sama dengan jawaban benar atau jawaban salah lainnya
            if (!choices.includes(randomWrongAnswer) && randomWrongAnswer !== q.correctAnswer) {
                choices.push(randomWrongAnswer);
            }
        }
        
        shuffleArray(choices); // Acak urutan pilihan

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choice;
            button.onclick = () => selectChoice(choice, q.correctAnswer, button);
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
    // Nonaktifkan semua tombol pilihan setelah memilih
    Array.from(answerChoicesContainer.children).forEach(btn => btn.disabled = true);

    if (selectedAnswer === correctAnswer) {
        chooseFeedbackElement.textContent = '🎉 Benar! Hebat!';
        buttonElement.classList.add('correct');
        chooseCorrectCount++;
    } else {
        chooseFeedbackElement.textContent = `😅 Salah! Jawaban yang benar adalah ${correctAnswer}.`;
        buttonElement.classList.add('wrong');
        // Cari tombol jawaban yang benar dan tandai
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
            displayChooseQuestion();
        } else {
            showFinalTimedChallengeResults();
        }
    }, 1500); // Jeda sebelum soal berikutnya
}

/**
 * Menampilkan hasil akhir dari mode ujian kilat dan pilih jawaban.
 */
function showFinalTimedChallengeResults() {
    hideAllGameAreas();
    let finalMessage = `Kamu menjawab benar ${timedChallengeCorrectCount} dari ${MAX_TIMED_QUESTIONS} soal di Ujian Kilat.`;
    finalMessage += `\nDi fase Pilih Jawaban, kamu benar ${chooseCorrectCount} dari ${displayedChooseQuestions.length} soal.`;

    // Kriteria kemenangan (bisa disesuaikan)
    if (timedChallengeCorrectCount + chooseCorrectCount >= (MAX_TIMED_QUESTIONS * 2) - 2) { 
        showWinMessage();
        document.getElementById('win-message').querySelector('p').textContent = finalMessage + "\nKamu luar biasa, juara matematika!";
    } else {
        showLoseMessage(finalMessage + "\nTerus berlatih ya, pasti bisa lebih baik!");
    }
}


// --- FUNGSI BARU: MODE INGAT & COCOKKAN ---

/**
 * Memulai mode ingat & cocokkan.
 */
function startMemorizeMatchMode() {
    hideAllGameAreas();
    memorizeMatchArea.classList.remove('hidden');
    memorizePhase.classList.remove('hidden');
    matchPhase.classList.add('hidden'); // Sembunyikan fase mencocokkan dulu
    
    memorizeMatchTimeLeft = 60; // Total waktu
    currentMemorizeMatches = [];
    selectedMatchElement = null;
    clearCanvas(); // Bersihkan canvas dari sesi sebelumnya

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

    startMemorizeMatchTimer();
}

/**
 * Memulai timer untuk mode ingat & cocokkan.
 */
function startMemorizeMatchTimer() {
    clearInterval(memorizeMatchTimer);
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
            memorizeMatchTimerElement.style.color = '#28a745';
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
    memorizePhase.classList.add('hidden');
    matchPhase.classList.remove('hidden');
    memorizeMatchTimerElement.textContent = `Waktu Selesai! Sekarang Cocokkan!`; // Update timer text

    // Atur ukuran canvas sesuai dengan elemen parent (matchPhase)
    canvas = document.getElementById('match-canvas');
    ctx = canvas.getContext('2d');
    
    // Perbarui ukuran canvas sebelum menggambar
    const containerRect = memorizeMatchArea.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height; // Set canvas height to match memorizeMatchArea height
    
    // Hitung offset canvas relatif terhadap viewport
    canvasRect = memorizeMatchArea.getBoundingClientRect();

    displayMatchQuestionsAndAnswers();
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
    shuffledQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('match-item');
        questionDiv.textContent = q.question;
        questionDiv.dataset.questionId = q.id; // Simpan ID asli soal
        questionDiv.dataset.type = 'question'; // Tipe elemen
        questionDiv.onclick = () => selectMatchItem(questionDiv);
        matchQuestionsColumn.appendChild(questionDiv);
    });

    // Buat elemen untuk kolom jawaban
    shuffledAnswers.forEach((a, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('match-item');
        answerDiv.textContent = a.answer; // Tampilkan hanya jawaban
        answerDiv.dataset.answerId = a.id; // Simpan ID asli jawaban
        answerDiv.dataset.type = 'answer'; // Tipe elemen
        answerDiv.onclick = () => selectMatchItem(answerDiv);
        matchAnswersColumn.appendChild(answerDiv);
    });
}

/**
 * Memilih item (soal atau jawaban) di fase mencocokkan untuk digaris.
 * @param {HTMLElement} element Elemen yang diklik.
 */
function selectMatchItem(element) {
    // Jika elemen ini sudah dicocokkan, jangan lakukan apa-apa
    if (element.classList.contains('matched')) {
        return;
    }

    // Hapus semua highlight kecuali yang sedang dipilih atau yang sudah dicocokkan
    document.querySelectorAll('.match-item').forEach(item => {
        if (item !== element && item !== selectedMatchElement && !item.classList.contains('matched')) {
            item.classList.remove('selected');
        }
    });

    // Jika elemen yang sama diklik lagi, batalkan pilihan
    if (selectedMatchElement === element) {
        element.classList.remove('selected');
        selectedMatchElement = null;
        return;
    }

    element.classList.add('selected');

    if (selectedMatchElement === null) {
        selectedMatchElement = element;
    } else {
        // Dua elemen sudah dipilih
        // Pastikan bukan elemen dari tipe yang sama (soal dengan soal, jawaban dengan jawaban)
        if (selectedMatchElement.dataset.type === element.dataset.type) {
            selectedMatchElement.classList.remove('selected'); // Batalkan pilihan sebelumnya
            selectedMatchElement = element; // Pilih elemen yang baru
            return;
        }

        // Pastikan kedua elemen dari kolom yang berbeda (misal: question dari kiri, answer dari kanan)
        const questionElement = selectedMatchElement.dataset.type === 'question' ? selectedMatchElement : element;
        const answerElement = selectedMatchElement.dataset.type === 'answer' ? selectedMatchElement : element;

        // Cek apakah pertanyaan dari kolom kiri dan jawaban dari kolom kanan
        if (questionElement.parentNode.id !== 'match-questions-column' || answerElement.parentNode.id !== 'match-answers-column') {
             // Ini akan mencegah pencocokan elemen di kolom yang salah (misal Q dari kolom kanan, atau A dari kolom kiri)
             selectedMatchElement.classList.remove('selected');
             selectedMatchElement = element;
             return;
        }


        const questionId = questionElement.dataset.questionId;
        const answerId = answerElement.dataset.answerId;

        // Cari data asli soal dari ID
        const originalQuestion = memorizeQuestionsData.find(q => q.id === questionId);
        const originalAnswer = memorizeQuestionsData.find(a => a.id === answerId);

        let isCorrectMatch = false;
        if (originalQuestion && originalAnswer && originalQuestion.id === originalAnswer.id) {
            isCorrectMatch = true;
            // Jawaban benar, garis hijau putus-putus
            drawLine(questionElement, answerElement, 'green', true); 
        } else {
            // Jawaban salah, garis merah solid
            drawLine(questionElement, answerElement, 'red', false);
        }
        
        currentMemorizeMatches.push({
            questionId: questionId,
            answerId: answerId,
            isCorrect: isCorrectMatch,
            elements: [questionElement, answerElement] // Simpan referensi elemen
        });
        
        // Nonaktifkan dan tandai elemen yang sudah dicocokkan
        questionElement.onclick = null;
        answerElement.onclick = null;
        questionElement.classList.add('matched');
        answerElement.classList.add('matched');

        // Hapus highlight dan reset pilihan
        selectedMatchElement.classList.remove('selected');
        element.classList.remove('selected');
        selectedMatchElement = null;

        // Periksa jika semua sudah dicocokkan secara otomatis
        if (currentMemorizeMatches.length === memorizeQuestionsData.length) {
            checkMatches();
        }
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
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    // Hitung posisi tengah elemen relatif terhadap CANVAS
    // Kita perlu offset dari posisi canvas itu sendiri
    const x1 = rect1.left + rect1.width / 2 - canvasRect.left;
    const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
    const x2 = rect2.left + rect2.width / 2 - canvasRect.left;
    const y2 = rect2.top + rect2.height / 2 - canvasRect.top;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (isDashed) {
        ctx.setLineDash([5, 5]); // Garis putus-putus: 5px garis, 5px spasi
    } else {
        ctx.setLineDash([]); // Garis solid
    }
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
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
    let correctCount = 0;
    currentMemorizeMatches.forEach(match => {
        if (match.isCorrect) {
            correctCount++;
        }
    });

    matchFeedbackElement.textContent = `Kamu benar ${correctCount} dari ${memorizeQuestionsData.length} pasangan!`;

    // Berikan feedback visual pada garis dan item (border/background)
    currentMemorizeMatches.forEach(match => {
        if (match.isCorrect) {
            match.elements[0].style.borderColor = '#28a745'; // Hijau
            match.elements[1].style.borderColor = '#28a745';
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
            showLoseMessage(`Maaf, kamu hanya berhasil mencocokkan ${correctCount} dari ${memorizeQuestionsData.length} soal dengan benar.`);
        }
    }, 2000); // Tunda sebentar agar pemain bisa melihat hasilnya
}


// --- FUNGSI UTILITY ---
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

    // Inisialisasi canvas (pastikan saat memorizeMatchArea sudah visible)
    // Akan diatur ukurannya dan context saat showMatchPhase() dipanggil.
    // Dapatkan referensi awal agar tidak null
    canvas = document.getElementById('match-canvas');
    ctx = canvas.getContext('2d');
    
    // Pastikan ukuran canvas sesuai dengan parent container saat resize
    window.addEventListener('resize', () => {
        if (!memorizeMatchArea.classList.contains('hidden')) {
            // Perbarui ukuran canvas
            const containerRect = memorizeMatchArea.getBoundingClientRect();
            canvas.width = containerRect.width;
            canvas.height = containerRect.height;
            // Perbarui offset canvas
            canvasRect = memorizeMatchArea.getBoundingClientRect();
            // Gambar ulang garis jika ada
            redrawLines(); 
        }
    });
});

/**
 * Menggambar ulang semua garis yang sudah dicocokkan di canvas.
 * Berguna saat layar di-resize.
 */
function redrawLines() {
    clearCanvas();
    currentMemorizeMatches.forEach(match => {
        // Periksa apakah elemen masih ada di DOM (belum dihapus/diganti)
        // Ini penting karena resize bisa membuat posisi berubah
        if (document.body.contains(match.elements[0]) && document.body.contains(match.elements[1])) {
            drawLine(match.elements[0], match.elements[1], match.isCorrect ? 'green' : 'red', match.isCorrect);
        }
    });
}
