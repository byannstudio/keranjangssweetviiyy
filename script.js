// --- Elemen HTML Utama ---
const gameArea = document.getElementById('gameArea');
const btnGame1 = document.getElementById('btnGame1');
const btnGame3 = document.getElementById('btnGame3');
const btnGame4 = document.getElementById('btnGame4');

// --- Objek Audio (Pastikan file suara ada di assets/sounds/) ---
const audioCorrect = new Audio('assets/sounds/benar.mp3'); // Suara benar
const audioWrong = new Audio('assets/sounds/salah.mp3');   // Suara salah
const audioCelebrate = new Audio('assets/sounds/celebrate.mp3'); // Suara perayaan untuk lebih dari 5 jawaban

// --- Fungsi Umum untuk Memuat Konten Game ---
function loadGame(gameContentHTML) {
    gameArea.innerHTML = gameContentHTML;
}

// --- Game 1: Rumah Beruang Angka (Penjumlahan & Pengurangan) ---
let currentOperation = ''; // 'penjumlahan' atau 'pengurangan'
let currentLevel = 0;
let correctAnswer = 0;
let timerInterval; // Untuk timer level 2 & 3
let timeLeft = 0;

function showGame1Menu() {
    const game1HTML = `
        <div class="game1-menu">
            <h2>Pilih Petualangan Angka Beruang!</h2>
            <button class="game1-option-button" id="btnChoosePenjumlahan">Penjumlahan (+)</button>
            <button class="game1-option-button" id="btnChoosePengurangan">Pengurangan (-)</button>
            <p>Atau pilih Level langsung:</p>
            <div class="level-selection">
                <button class="level-button" data-level="1">1</button>
                <button class="level-button" data-level="2">2</button>
                <button class="level-button" data-level="3">3</button>
                <button class="level-button" data-level="4">4</button>
                <button class="level-button" data-level="5">5</button>
            </div>
        </div>
    `;
    loadGame(game1HTML);

    // Event Listeners untuk Game 1 Menu
    document.getElementById('btnChoosePenjumlahan').addEventListener('click', () => {
        currentOperation = 'penjumlahan';
        showLevelSelection();
    });
    document.getElementById('btnChoosePengurangan').addEventListener('click', () => {
        currentOperation = 'pengurangan';
        showLevelSelection();
    });
    document.querySelectorAll('.level-button').forEach(button => {
        button.addEventListener('click', (event) => {
            currentLevel = parseInt(event.target.dataset.level);
            // Jika langsung pilih level, default operasi ke penjumlahan (bisa diubah)
            if (currentOperation === '') currentOperation = 'penjumlahan';
            startGame1Level(currentLevel, currentOperation);
        });
    });
}

function showLevelSelection() {
    const levelSelectionHTML = `
        <div class="game1-menu">
            <h2>Pilih Level ${currentOperation === 'penjumlahan' ? 'Penjumlahan' : 'Pengurangan'}</h2>
            <div class="level-selection">
                <button class="level-button" data-level="1">1</button>
                <button class="level-button" data-level="2">2</button>
                <button class="level-button" data-level="3">3</button>
                <button class="level-button" data-level="4">4</button>
                <button class="level-button" data-level="5">5</button>
            </div>
            <button class="game1-option-button" id="btnBackToGame1Menu">Kembali</button>
        </div>
    `;
    loadGame(levelSelectionHTML);

    document.querySelectorAll('.level-button').forEach(button => {
        button.addEventListener('click', (event) => {
            currentLevel = parseInt(event.target.dataset.level);
            startGame1Level(currentLevel, currentOperation);
        });
    });
    document.getElementById('btnBackToGame1Menu').addEventListener('click', showGame1Menu);
}

function generateQuestion(operation, level) {
    let num1, num2;
    let questionText = '';
    let answer = 0;

    switch (level) {
        case 1: // Penjumlahan/Pengurangan normal 1-10
        case 2:
        case 3:
            num1 = Math.floor(Math.random() * 10) + 1; // 1-10
            num2 = Math.floor(Math.random() * 10) + 1; // 1-10
            if (operation === 'penjumlahan') {
                answer = num1 + num2;
                questionText = `${num1} + ${num2} = ?`;
            } else { // pengurangan
                // Pastikan hasil tidak negatif
                if (num1 < num2) [num1, num2] = [num2, num1]; // Swap jika num1 lebih kecil
                answer = num1 - num2;
                questionText = `${num1} - ${num2} = ?`;
            }
            break;
        case 4: // Penjumlahan/Pengurangan susun (sederhana)
            // Untuk demo, kita buat yang hasilnya 2-3 digit
            if (operation === 'penjumlahan') {
                num1 = Math.floor(Math.random() * 90) + 10; // 10-99
                num2 = Math.floor(Math.random() * 90) + 10; // 10-99
                answer = num1 + num2;
                // Representasi susun, bisa dipecah di HTML
                questionText = `
                    ${num1}
                    <br>${operation === 'penjumlahan' ? '+' : '-'} ${num2}
                    <br>----
                    <br>?
                `;
            } else { // pengurangan
                num1 = Math.floor(Math.random() * 90) + 10;
                num2 = Math.floor(Math.random() * 90) + 10;
                if (num1 < num2) [num1, num2] = [num2, num1];
                answer = num1 - num2;
                 questionText = `
                    ${num1}
                    <br>${operation === 'penjumlahan' ? '+' : '-'} ${num2}
                    <br>----
                    <br>?
                `;
            }
            break;
        case 5: // Level Bebas (Contoh: Menemukan angka hilang)
            num1 = Math.floor(Math.random() * 15) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            let result = num1 + num2;
            let missingPart = Math.floor(Math.random() * 3); // 0=num1, 1=num2, 2=result

            if (missingPart === 0) {
                questionText = `? + ${num2} = ${result}`;
                answer = num1;
            } else if (missingPart === 1) {
                questionText = `${num1} + ? = ${result}`;
                answer = num2;
            } else {
                questionText = `${num1} + ${num2} = ?`;
                answer = result;
            }
            break;
    }
    return { questionText, answer };
}

function startGame1Level(level, operation) {
    currentLevel = level;
    currentOperation = operation;
    clearInterval(timerInterval); // Bersihkan timer sebelumnya jika ada

    const { questionText, answer } = generateQuestion(operation, level);
    correctAnswer = answer;

    let levelHTML = `
        <div class="game-question-area">
            <h2>Level ${level} - ${operation === 'penjumlahan' ? 'Penjumlahan' : 'Pengurangan'}</h2>
            ${(level === 2 || level === 3) ? '<div class="timer-display" id="timerDisplay"></div>' : ''}
            <div class="question-text">${questionText}</div>
            <input type="number" id="answerInput" class="answer-input" placeholder="Jawaban" autofocus>
            <button id="submitAnswer" class="submit-button">Jawab!</button>
            <div id="feedbackMessage" class="feedback-message"></div>
            <button id="backToLevels" class="game1-option-button">Kembali ke Level</button>
        </div>
    `;

    // Untuk level 4 (susun), sesuaikan input menjadi beberapa kolom jika perlu
    if (level === 4) {
        // Contoh sederhana untuk level 4, input masih satu. Untuk multiple input, perlu DOM manipulation lebih lanjut
        levelHTML = `
            <div class="game-question-area">
                <h2>Level ${level} - Susun ${operation === 'penjumlahan' ? 'Penjumlahan' : 'Pengurangan'}</h2>
                <div class="question-text" style="line-height: 1.5;">${questionText}</div>
                <input type="number" id="answerInput" class="answer-input" placeholder="Jawaban" autofocus>
                <button id="submitAnswer" class="submit-button">Jawab!</button>
                <div id="feedbackMessage" class="feedback-message"></div>
                <button id="backToLevels" class="game1-option-button">Kembali ke Level</button>
            </div>
        `;
    }

    loadGame(levelHTML);

    const answerInput = document.getElementById('answerInput');
    const submitButton = document.getElementById('submitAnswer');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const backToLevelsButton = document.getElementById('backToLevels');

    // Event listener untuk tombol submit
    submitButton.addEventListener('click', () => checkAnswer(answerInput, feedbackMessage));
    // Event listener untuk 'Enter' di input
    answerInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkAnswer(answerInput, feedbackMessage);
        }
    });

    backToLevelsButton.addEventListener('click', showLevelSelection);

    // Timer untuk Level 2 dan 3
    if (level === 2 || level === 3) {
        timeLeft = (level === 2) ? 10 : 5;
        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.textContent = `Waktu: ${timeLeft} detik`;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Waktu: ${timeLeft} detik`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                feedbackMessage.textContent = 'Waktu Habis! Jawaban yang benar adalah ' + correctAnswer;
                feedbackMessage.className = 'feedback-message feedback-wrong';
                audioWrong.play();
                submitButton.disabled = true; // Nonaktifkan tombol
                answerInput.disabled = true;  // Nonaktifkan input
                // Otomatis pindah soal setelah beberapa detik
                setTimeout(() => startGame1Level(level, operation), 2000);
            }
        }, 1000);
    }
}

function checkAnswer(inputElement, feedbackElement) {
    clearInterval(timerInterval); // Hentikan timer saat jawaban diberikan
    const userAnswer = parseInt(inputElement.value);

    if (userAnswer === correctAnswer) {
        feedbackElement.textContent = 'Hebat! Kamu Benar! 🎉';
        feedbackElement.className = 'feedback-message feedback-correct';
        audioCorrect.play();
    } else {
        feedbackElement.textContent = `Ups! Jawabanmu Salah. Yang benar adalah ${correctAnswer}. 😔`;
        feedbackElement.className = 'feedback-message feedback-wrong';
        audioWrong.play();
    }
    inputElement.value = ''; // Kosongkan input
    setTimeout(() => startGame1Level(currentLevel, currentOperation), 1500); // Lanjut soal berikutnya
}


// --- Game 3: Ujian Kilat 1 Menit ---
let scoreGame3 = 0;
let game3Timer;
let game3TimeLeft = 60;
let game3OperationType = ''; // 'penjumlahan' or 'pengurangan'

function showGame3Menu() {
    const game3HTML = `
        <div class="game1-menu">
            <h2>Ujian Kilat 1 Menit!</h2>
            <p>Seberapa banyak soal yang bisa kamu jawab dalam 1 menit?</p>
            <button class="game1-option-button" id="btnGame3Penjumlahan">Mulai Penjumlahan</button>
            <button class="game1-option-button" id="btnGame3Pengurangan">Mulai Pengurangan</button>
            <button class="game1-option-button" id="btnBackToMainMenuFromGame3">Kembali</button>
        </div>
    `;
    loadGame(game3HTML);

    document.getElementById('btnGame3Penjumlahan').addEventListener('click', () => {
        game3OperationType = 'penjumlahan';
        startGame3();
    });
    document.getElementById('btnGame3Pengurangan').addEventListener('click', () => {
        game3OperationType = 'pengurangan';
        startGame3();
    });
    document.getElementById('btnBackToMainMenuFromGame3').addEventListener('click', showWelcomeScreen);
}

function startGame3() {
    scoreGame3 = 0;
    game3TimeLeft = 60;
    
    const game3QuestionHTML = `
        <div class="game-question-area">
            <div class="timer-display" id="game3TimerDisplay">Waktu: 60 detik</div>
            <div class="question-text" id="game3Question"></div>
            <input type="number" id="game3AnswerInput" class="answer-input" placeholder="Jawaban" autofocus>
            <button id="game3SubmitAnswer" class="submit-button">Jawab!</button>
            <div class="feedback-message" id="game3Feedback"></div>
            <div class="score-display" style="font-size: 1.5em; margin-top: 10px; color: #8C5642;">Skor: <span id="game3Score">0</span></div>
        </div>
    `;
    loadGame(game3QuestionHTML);

    const game3TimerDisplay = document.getElementById('game3TimerDisplay');
    const game3QuestionEl = document.getElementById('game3Question');
    const game3AnswerInput = document.getElementById('game3AnswerInput');
    const game3SubmitBtn = document.getElementById('game3SubmitAnswer');
    const game3FeedbackEl = document.getElementById('game3Feedback');
    const game3ScoreEl = document.getElementById('game3Score');

    function generateGame3Question() {
        let num1 = Math.floor(Math.random() * 15) + 5; // Angka lebih besar sedikit
        let num2 = Math.floor(Math.random() * 10) + 1;
        let question, answer;

        if (game3OperationType === 'penjumlahan') {
            answer = num1 + num2;
            question = `${num1} + ${num2} = ?`;
        } else {
            if (num1 < num2) [num1, num2] = [num2, num1]; // Pastikan num1 > num2
            answer = num1 - num2;
            question = `${num1} - ${num2} = ?`;
        }
        game3QuestionEl.textContent = question;
        game3QuestionEl.dataset.correctAnswer = answer; // Simpan jawaban di dataset
        game3AnswerInput.value = ''; // Clear input
        game3AnswerInput.focus();
    }

    function checkGame3Answer() {
        const userAnswer = parseInt(game3AnswerInput.value);
        const correctAnswer = parseInt(game3QuestionEl.dataset.correctAnswer);

        if (userAnswer === correctAnswer) {
            scoreGame3++;
            game3ScoreEl.textContent = scoreGame3;
            game3FeedbackEl.textContent = 'Benar! 🎉';
            game3FeedbackEl.className = 'feedback-message feedback-correct';
            audioCorrect.play();
        } else {
            game3FeedbackEl.textContent = 'Salah! 😔';
            game3FeedbackEl.className = 'feedback-message feedback-wrong';
            audioWrong.play();
        }
        generateGame3Question(); // Langsung soal berikutnya
    }

    game3SubmitBtn.addEventListener('click', checkGame3Answer);
    game3AnswerInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkGame3Answer();
        }
    });

    // Mulai Timer
    game3Timer = setInterval(() => {
        game3TimeLeft--;
        game3TimerDisplay.textContent = `Waktu: ${game3TimeLeft} detik`;

        if (game3TimeLeft <= 0) {
            clearInterval(game3Timer);
            endGame3();
        }
    }, 1000);

    generateGame3Question(); // Soal pertama
}

function endGame3() {
    clearInterval(game3Timer);
    let emoji = '';
    let message = `Waktu Habis! Kamu berhasil menjawab ${scoreGame3} soal. `;

    if (scoreGame3 >= 15) { // Angka disesuaikan
        emoji = '💖✨🤩🥳🎉🎊';
        audioCelebrate.play(); // Mainkan suara perayaan heboh
        message += 'Kamu HEBAT BANGET! ';
    } else if (scoreGame3 >= 5) {
        emoji = '🥳🎉';
        message += 'Luar biasa! Pertahankan! ';
    } else if (scoreGame3 >= 3) {
        emoji = '🤩';
        message += 'Bagus! Terus semangat ya! ';
    } else {
        emoji = '😢';
        message += 'Jangan menyerah ya, coba lagi! ';
    }

    const endScreenHTML = `
        <div class="game1-menu">
            <h2>Ujian Selesai!</h2>
            <p>${message}</p>
            <p class="emoji-result" style="font-size: 4em; margin-top: 20px;">${emoji}</p>
            <button class="game1-option-button" id="btnPlayAgainGame3">Main Lagi</button>
            <button class="game1-option-button" id="btnBackToMainMenuFromGame3End">Kembali ke Menu Utama</button>
        </div>
    `;
    loadGame(endScreenHTML);

    document.getElementById('btnPlayAgainGame3').addEventListener('click', showGame3Menu); // Kembali ke menu pilih operasi
    document.getElementById('btnBackToMainMenuFromGame3End').addEventListener('click', showWelcomeScreen);
}


// --- Game 4: Ingat dan Cocokkan ---
let pairsToMemorize = [];
let memorizationTimer;
let matchTimer; // Optional, jika ada timer di fase mencocokkan
let matchTimeLeft = 60;
const totalPairs = 5; // Jumlah pasangan soal-jawaban

function showGame4Menu() {
    const game4HTML = `
        <div class="game1-menu">
            <h2>Ingat dan Cocokkan!</h2>
            <p>Ingat pasangan soal dan jawaban ini selama 1 menit, lalu cocokkan!</p>
            <button class="game1-option-button" id="btnStartGame4">Mulai Game 4</button>
            <button class="game1-option-button" id="btnBackToMainMenuFromGame4">Kembali</button>
        </div>
    `;
    loadGame(game4HTML);

    document.getElementById('btnStartGame4').addEventListener('click', startGame4Memorize);
    document.getElementById('btnBackToMainMenuFromGame4').addEventListener('click', showWelcomeScreen);
}

function generateMathPairs(count) {
    const pairs = [];
    for (let i = 0; i < count; i++) {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operator = Math.random() < 0.5 ? '+' : '-';

        let question, answer;
        if (operator === '+') {
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
        } else {
            // Pastikan pengurangan tidak menghasilkan negatif
            let n1 = Math.max(num1, num2);
            let n2 = Math.min(num1, num2);
            question = `${n1} - ${n2}`;
            answer = n1 - n2;
        }
        pairs.push({ question: question, answer: answer });
    }
    return pairs;
}

function startGame4Memorize() {
    pairsToMemorize = generateMathPairs(totalPairs);

    const memorizeHTML = `
        <div class="game-question-area game4-memorize-area">
            <h2>Ingat Baik-Baik!</h2>
            <div class="timer-display" id="game4MemorizeTimer">Waktu Mengingat: 60 detik</div>
            <div class="pairs-grid">
                ${pairsToMemorize.map((pair, index) => `
                    <div class="pair-item">
                        <div class="pair-question">${pair.question} =</div>
                        <div class="pair-answer">${pair.answer}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    loadGame(memorizeHTML);

    const game4MemorizeTimer = document.getElementById('game4MemorizeTimer');
    matchTimeLeft = 60; // Reset waktu mengingat

    memorizationTimer = setInterval(() => {
        matchTimeLeft--;
        game4MemorizeTimer.textContent = `Waktu Mengingat: ${matchTimeLeft} detik`;

        if (matchTimeLeft <= 0) {
            clearInterval(memorizationTimer);
            startGame4Match();
        }
    }, 1000);
}

function startGame4Match() {
    // Acak ulang untuk mencocokkan
    let allItems = [];
    pairsToMemorize.forEach(pair => {
        allItems.push({ type: 'question', value: pair.question, id: pair.answer });
        allItems.push({ type: 'answer', value: pair.answer, id: pair.answer }); // ID sama untuk pasangannya
    });
    // Acak urutan
    allItems.sort(() => Math.random() - 0.5);

    const matchHTML = `
        <div class="game-question-area game4-match-area">
            <h2>Cocokkan Pasangannya!</h2>
            <div class="match-grid" id="matchGrid">
                ${allItems.map((item, index) => `
                    <div class="match-item" data-type="${item.type}" data-id="${item.id}" data-value="${item.value}">
                        ${item.value}
                    </div>
                `).join('')}
            </div>
            <div id="matchFeedback" class="feedback-message" style="margin-top: 20px;"></div>
            <button class="game1-option-button" id="btnRestartGame4" style="margin-top: 20px;">Main Lagi</button>
            <button class="game1-option-button" id="btnBackToMainMenuFromGame4Match">Kembali ke Menu Utama</button>
        </div>
    `;
    loadGame(matchHTML);

    const matchGrid = document.getElementById('matchGrid');
    const matchFeedback = document.getElementById('matchFeedback');
    let selectedItems = [];
    let matchedPairsCount = 0;

    matchGrid.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.match-item');
        if (!clickedItem || clickedItem.classList.contains('matched') || selectedItems.includes(clickedItem)) {
            return;
        }

        clickedItem.classList.add('selected');
        selectedItems.push(clickedItem);

        if (selectedItems.length === 2) {
            const [item1, item2] = selectedItems;
            
            // Periksa apakah tipenya berbeda (pertanyaan dan jawaban) dan ID-nya sama
            if (item1.dataset.type !== item2.dataset.type && item1.dataset.id === item2.dataset.id) {
                // Pasangan Cocok!
                item1.classList.remove('selected');
                item2.classList.remove('selected');
                item1.classList.add('matched');
                item2.classList.add('matched');
                audioCorrect.play();
                matchFeedback.textContent = 'Cocok! 🎉';
                matchFeedback.className = 'feedback-message feedback-correct';
                matchedPairsCount++;

                if (matchedPairsCount === totalPairs) {
                    setTimeout(() => {
                        matchFeedback.textContent = 'Hebat! Semua Pasangan Cocok! 💖✨';
                        matchFeedback.className = 'feedback-message feedback-correct';
                        audioCelebrate.play();
                    }, 500);
                }
            } else {
                // Tidak Cocok
                audioWrong.play();
                matchFeedback.textContent = 'Tidak Cocok! 😔 Coba lagi.';
                matchFeedback.className = 'feedback-message feedback-wrong';
                
                setTimeout(() => {
                    item1.classList.remove('selected');
                    item2.classList.remove('selected');
                    matchFeedback.textContent = ''; // Hapus pesan setelah jeda
                }, 800);
            }
            selectedItems = []; // Reset pilihan
        }
    });

    document.getElementById('btnRestartGame4').addEventListener('click', showGame4Menu);
    document.getElementById('btnBackToMainMenuFromGame4Match').addEventListener('click', showWelcomeScreen);
}


// --- Fungsi untuk Kembali ke Layar Selamat Datang ---
function showWelcomeScreen() {
    const welcomeHTML = `
        <p class="welcome-text">Pilih game favoritmu di atas ya!</p>
    `;
    loadGame(welcomeHTML);
    // Bersihkan semua timer jika ada
    clearInterval(timerInterval);
    clearInterval(game3Timer);
    clearInterval(memorizationTimer);
    clearInterval(matchTimer);
}

// --- Event Listeners untuk Tombol Navigasi Utama ---
btnGame1.addEventListener('click', showGame1Menu);
btnGame3.addEventListener('click', showGame3Menu);
btnGame4.addEventListener('click', showGame4Menu);

// Tampilkan layar selamat datang saat pertama kali load
showWelcomeScreen();
