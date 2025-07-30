document.addEventListener('DOMContentLoaded', () => {
    const gameSelectionDiv = document.getElementById('game-selection');
    const gameAreaDiv = document.getElementById('game-area');
    const gameOverScreenDiv = document.getElementById('game-over-screen');

    const startSumGameBtn = document.getElementById('start-sum-game');
    const startSubGameBtn = document.getElementById('start-sub-game');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const nextLevelBtn = document.getElementById('next-level');
    const restartGameBtn = document.getElementById('restart-game');
    const playAgainBtn = document.getElementById('play-again');

    const currentLevelSpan = document.getElementById('current-level');
    const currentScoreSpan = document.getElementById('current-score');
    const timerSpan = document.getElementById('time-left');
    const timerDisplay = document.getElementById('timer');
    const questionText = document.getElementById('question-text');
    const answerInput = document.getElementById('answer-input');
    const feedbackMessage = document.getElementById('feedback-message');
    const finalScoreSpan = document.getElementById('final-score');

    let gameType = ''; // 'sum' or 'sub'
    let currentLevel = 1;
    let score = 0;
    let correctAnswer = 0;
    let timeLeft = 0;
    let timerInterval;
    let questionCount = 0; // Untuk level cepat

    const MAX_QUESTIONS_PER_LEVEL = 5; // Jumlah soal per level (kecuali level cepat)
    const MAX_LEVEL_SUM = 3;
    const MAX_LEVEL_SUB = 3;
    const FAST_LEVEL_TIME = 10; // Detik untuk level cepat
    const FAST_LEVEL_QUESTIONS = 10; // Soal untuk level cepat

    // --- Fungsi Utama Game ---

    function startGame(type) {
        gameType = type;
        currentLevel = 1;
        score = 0;
        questionCount = 0;
        updateDisplay();
        gameSelectionDiv.classList.add('hidden');
        gameAreaDiv.classList.remove('hidden');
        gameOverScreenDiv.classList.add('hidden');
        nextLevelBtn.classList.add('hidden');
        restartGameBtn.classList.add('hidden');
        generateQuestion();
    }

    function generateQuestion() {
        answerInput.value = ''; // Kosongkan input
        answerInput.focus(); // Fokuskan kembali input
        feedbackMessage.textContent = ''; // Hapus pesan feedback

        let num1, num2;
        let question;

        if (gameType === 'sum') {
            if (currentLevel <= MAX_LEVEL_SUM) { // Level penjumlahan normal
                num1 = Math.floor(Math.random() * 10) + 1; // 1-10
                num2 = Math.floor(Math.random() * 10) + 1; // 1-10
                correctAnswer = num1 + num2;
                question = `${num1} + ${num2} = ?`;
            } else if (currentLevel === MAX_LEVEL_SUM + 1) { // Level penjumlahan cepat (Level 4)
                num1 = Math.floor(Math.random() * 10) + 1; // 1-10
                num2 = Math.floor(Math.random() * 10) + 1; // 1-10
                correctAnswer = num1 + num2;
                question = `${num1} + ${num2} = ?`;
                startFastLevelTimer();
                timerDisplay.classList.remove('hidden');
            }
        } else if (gameType === 'sub') {
            if (currentLevel <= MAX_LEVEL_SUB) { // Level pengurangan normal
                num1 = Math.floor(Math.random() * 10) + 1; // 1-10
                num2 = Math.floor(Math.random() * num1) + 1; // Pastikan num1 >= num2
                correctAnswer = num1 - num2;
                question = `${num1} - ${num2} = ?`;
            } else if (currentLevel === MAX_LEVEL_SUB + 1) { // Level pengurangan cepat (Level 4)
                num1 = Math.floor(Math.random() * 10) + 1; // 1-10
                num2 = Math.floor(Math.random() * num1) + 1; // Pastikan num1 >= num2
                correctAnswer = num1 - num2;
                question = `${num1} - ${num2} = ?`;
                startFastLevelTimer();
                timerDisplay.classList.remove('hidden');
            }
        }
        questionText.textContent = question;
        updateDisplay();
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value);
        if (isNaN(userAnswer)) {
            feedbackMessage.textContent = 'Masukkan angka!';
            return;
        }

        if (userAnswer === correctAnswer) {
            score += 10;
            feedbackMessage.textContent = 'Benar! 🎉';
        } else {
            feedbackMessage.textContent = `Salah! Jawaban: ${correctAnswer} 🙁`;
        }

        updateDisplay();

        // Logika untuk level cepat
        if ((gameType === 'sum' && currentLevel === MAX_LEVEL_SUM + 1) || (gameType === 'sub' && currentLevel === MAX_LEVEL_SUB + 1)) {
            questionCount++;
            if (questionCount < FAST_LEVEL_QUESTIONS && timeLeft > 0) {
                setTimeout(generateQuestion, 1000); // Lanjut soal setelah 1 detik feedback
            } else {
                endGame();
            }
        } else {
            // Logika untuk level normal
            setTimeout(() => {
                questionCount++;
                if (questionCount < MAX_QUESTIONS_PER_LEVEL) {
                    generateQuestion();
                } else {
                    currentLevel++;
                    if ((gameType === 'sum' && currentLevel <= MAX_LEVEL_SUM + 1) || (gameType === 'sub' && currentLevel <= MAX_LEVEL_SUB + 1)) {
                         // Masuk ke level berikutnya, atau level cepat
                        questionCount = 0; // Reset question count untuk level baru
                        feedbackMessage.textContent = '';
                        if ((gameType === 'sum' && currentLevel === MAX_LEVEL_SUM + 1) || (gameType === 'sub' && currentLevel === MAX_LEVEL_SUB + 1)) {
                            alert('Selamat! Anda masuk ke Level Cepat!');
                            startFastLevelTimer();
                        }
                        generateQuestion();
                    } else {
                        endGame(); // Game selesai jika semua level dilewati
                    }
                }
            }, 1000); // Tunda sebentar sebelum soal baru
        }
    }

    function updateDisplay() {
        currentLevelSpan.textContent = currentLevel;
        currentScoreSpan.textContent = score;
        timerSpan.textContent = timeLeft;
    }

    function startFastLevelTimer() {
        clearInterval(timerInterval); // Hapus timer sebelumnya jika ada
        timeLeft = FAST_LEVEL_TIME;
        timerDisplay.classList.remove('hidden');
        timerSpan.textContent = timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame(); // Game berakhir jika waktu habis
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval); // Berhenti timer
        gameAreaDiv.classList.add('hidden');
        gameOverScreenDiv.classList.remove('hidden');
        finalScoreSpan.textContent = score;
        timerDisplay.classList.add('hidden'); // Sembunyikan timer di akhir game
    }

    function resetGame() {
        clearInterval(timerInterval); // Pastikan timer berhenti
        gameSelectionDiv.classList.remove('hidden');
        gameAreaDiv.classList.add('hidden');
        gameOverScreenDiv.classList.add('hidden');
        currentLevel = 1;
        score = 0;
        timeLeft = 0;
        questionCount = 0;
        updateDisplay();
        feedbackMessage.textContent = '';
        timerDisplay.classList.add('hidden');
    }

    // --- Event Listeners ---
    startSumGameBtn.addEventListener('click', () => startGame('sum'));
    startSubGameBtn.addEventListener('click', () => startGame('sub'));
    submitAnswerBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    nextLevelBtn.addEventListener('click', () => {
        // Logika next level saat ini dihandle di checkAnswer untuk soal normal
        // Tombol ini mungkin tidak terlalu diperlukan dengan alur saat ini,
        // atau bisa diaktifkan untuk memulai level berikutnya secara manual jika mau
    });
    restartGameBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
});
