let mode = 'addition';
let level = 1;
let currentQuestion = {};
let timerInterval; // Untuk level 2
let timeLeft = 10;
let score = 0;
const WIN_THRESHOLD = 5;

// --- Variabel untuk Mode Ujian Kilat ---
let timedChallengeTimer;
let timedChallengeTimeLeft = 60;
let timedChallengeQuestions = [];
let currentTimedQuestionIndex = 0;
const MAX_TIMED_QUESTIONS = 5;
let timedChallengeCorrectCount = 0;

// --- Variabel untuk Mode Ingat & Cocokkan ---
let memorizeMatchTimer;
let memorizeMatchTimeLeft = 60; // Total waktu untuk kedua fase
let memorizeQuestionsData = []; // Menyimpan soal dan jawaban untuk fase mengingat
let currentMemorizeMatches = []; // Menyimpan pasangan yang dicocokkan pengguna
let selectedMatchElement = null; // Elemen yang sedang dipilih (dari kolom kiri/kanan)

// --- Canvas untuk menggambar garis ---
let canvas;
let ctx;
let canvasOffset; // Untuk menghitung posisi elemen relatif terhadap canvas

// --- Referensi Elemen HTML ---
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
function selectMode(selectedMode) {
    mode = selectedMode;
    mainMenu.classList.add('hidden');
    levelMenu.classList.remove('hidden');
    hideAllGameAreas();
}

function startGame(selectedLevel) {
    level = selectedLevel;
    score = 0;
    levelMenu.classList.add('hidden');
    hideAllGameAreas();
    gameArea.classList.remove('hidden');
    nextQuestion();
}

function createAnswerBoxes(numDigits) {
    answerInputsContainer.innerHTML = '';
    answerBoxes = [];
    singleAnswerInput = null;

    for (let i = 0; i < numDigits; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.maxLength = 1;
        input.min = 0;
        input.max = 9;
        input.classList.add('answer-box');
        input.id = `answer-box-${i}`;
        answerInputsContainer.prepend(input);
        answerBoxes.push(input);
    }

    answerBoxes.reverse();

    answerBoxes.forEach((box, index) => {
        box.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/[^0-9]/g, '');
            if (event.target.value.length === 1 && index < answerBoxes.length - 1) {
                answerBoxes[index + 1].focus();
            }
        });

        box.addEventListener('keydown', (event) => {
            if (event.key === 'Backspace' && event.target.value === '' && index > 0) {
                answerBoxes[index - 1].focus();
            }
            if (event.target.value.length >= 1 && event.key !== 'Backspace' && event.key !== 'Delete' && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
            }
        });

        box.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && index === answerBoxes.length - 1) {
                checkAnswer();
            }
        });
    });

    if (answerBoxes.length > 0) {
        answerBoxes[0].focus();
    }
}

function getAnswerFromBoxes() {
    let userAnswerString = '';
    answerBoxes.forEach(box => {
        userAnswerString += box.value;
    });
    return parseInt(userAnswerString);
}

function generateQuestion() {
    let num1, num2, answer;

    susunHintElement.classList.add('hidden');
    questionElement.classList.remove('question-animated');
    questionElement.innerHTML = '';
    answerInputsContainer.innerHTML = '';
    answerBoxes = [];
    singleAnswerInput = null;

    if (level >= 4) { // Level 4 & 5 (susun)
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 90) + 10;

        if (mode === 'subtraction' && num2 > num1) {
            [num1, num2] = [num2, num1];
        } else if (mode === 'addition' && (num1 + num2) > 199) {
            do {
                num1 = Math.floor(Math.random() * 90) + 10;
                num2 = Math.floor(Math.random() * 90) + 10;
            } while ((num1 + num2) > 199);
        }

        answer = mode === 'addition' ? num1 + num2 : num1 - num2;
        
        let operator = mode === 'addition' ? '+' : '-';
        let questionText = `${String(num1).padStart(2, ' ')}\n${operator} ${String(num2).padStart(2, ' ')}\n-----\n  ?`;
        questionElement.textContent = questionText;
        currentQuestion = { num1, num2, correctAnswer: answer, operator };

        const numDigits = String(answer).length;
        createAnswerBoxes(numDigits);

        if (level === 4) {
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
            num1 = Math.floor(Math.random() * 90) + 10;
            num2 = Math.floor(Math.random() * 90) + 10;
        } else {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
        }

        if (mode === 'subtraction' && num2 > num1) [num1, num2] = [num2, num1];
        
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
    
    if (singleAnswerInput) {
        singleAnswerInput.value = '';
    } else {
        answerBoxes.forEach(box => box.value = '');
    }

    feedbackElement.textContent = '';
    checkButton.classList.remove('hidden');
    nextQuestionButton.classList.add('hidden');
    
    if (singleAnswerInput) {
        singleAnswerInput.focus();
    } else if (answerBoxes.length > 0) {
        answerBoxes[0].focus();
    }
}

function nextQuestion() {
    if (score >= WIN_THRESHOLD) {
        showWinMessage();
        return;
    }
    generateQuestion();

    if (level === 2) {
        timeLeft = 10;
        timerElement.textContent = `Waktu: ${timeLeft} detik ⏳`;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Waktu: ${timeLeft} detik ⏳`;
            if (timeLeft <= 3 && timeLeft > 0) {
                timerElement.style.color = 'red';
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
        timerElement.textContent = '';
        clearInterval(timerInterval);
    }
}

function checkAnswer() {
    let userAnswer;

    if (level >= 4) {
        userAnswer = getAnswerFromBoxes();
        const allFilled = answerBoxes.every(box => box.value !== '');
        if (!allFilled) {
            feedbackElement.textContent = 'Isi semua kotak jawaban dulu, ya! 🤔';
            return;
        }
    } else {
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
        if (level === 2) clearInterval(timerInterval);
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

function handleKeyPress(event) {
    if (event.key === 'Enter' && singleAnswerInput && singleAnswerInput.value !== '') {
        if (!checkButton.classList.contains('hidden')) {
            checkAnswer();
        } 
        else if (!nextQuestionButton.classList.contains('hidden')) {
            nextQuestion();
        }
    }
}

function showWinMessage() {
    hideAllGameAreas();
    winMessage.classList.remove('hidden');
    clearInterval(timerInterval);
    if (singleAnswerInput) {
        singleAnswerInput.removeEventListener('keypress', handleKeyPress);
    }
    answerBoxes.forEach(box => box.removeEventListener('keypress', handleKeyPress));
}

function showLoseMessage(message) {
    hideAllGameAreas();
    loseMessage.classList.remove('hidden');
    loseTextElement.textContent = message;
    clearInterval(timedChallengeTimer);
    clearInterval(memorizeMatchTimer); // Pastikan timer mode baru juga berhenti
}

function hideAllGameAreas() {
    mainMenu.classList.add('hidden');
    levelMenu.classList.add('hidden');
    gameArea.classList.add('hidden');
    timedChallengeArea.classList.add('hidden');
    chooseAnswerArea.classList.add('hidden');
    memorizeMatchArea.classList.add('hidden'); // Sembunyikan mode baru
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    // Clear any active timers
    clearInterval(timerInterval);
    clearInterval(timedChallengeTimer);
    clearInterval(memorizeMatchTimer); // Clear timer mode baru
}

function resetGame() {
    hideAllGameAreas();
    mainMenu.classList.remove('hidden');
    score = 0;
    feedbackElement.textContent = '';
    timerElement.textContent = '';
    answerInputsContainer.innerHTML = '';
    answerBoxes = [];
    singleAnswerInput = null;

    // Reset timed challenge specific variables
    timedChallengeTimeLeft = 60;
    currentTimedQuestionIndex = 0;
    timedChallengeQuestions = [];
    timedChallengeCorrectCount = 0;
    timedChallengeFeedbackElement.textContent = '';
    timedAnswerInput.value = '';
    timedChallengeTimerElement.style.color = '#e74c3c';
    timedChallengeTimerElement.textContent = 'Waktu: 60 detik';
    timedChallengeProgressElement.textContent = 'Soal 0/5';

    // Reset memorize & match specific variables
    memorizeMatchTimeLeft = 60;
    memorizeQuestionsData = [];
    currentMemorizeMatches = [];
    selectedMatchElement = null;
    clearCanvas(); // Bersihkan canvas
}


// --- FUNGSI UJIAN KILAT (EXISTING CODE) ---
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

    for (let i = 0; i < MAX_TIMED_QUESTIONS; i++) {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;
        timedChallengeQuestions.push({
            question: `${num1} + ${num2} = ?`,
            correctAnswer: num1 + num2,
            userAnswer: null
        });
    }

    displayTimedQuestion();
    startTimedChallengeTimer();
    timedAnswerInput.focus();
    timedAnswerInput.addEventListener('keypress', handleTimedChallengeKeyPress);
}

function displayTimedQuestion() {
    if (currentTimedQuestionIndex < MAX_TIMED_QUESTIONS) {
        const q = timedChallengeQuestions[currentTimedQuestionIndex];
        timedQuestionDisplay.textContent = q.question;
        timedChallengeProgressElement.textContent = `Soal ${currentTimedQuestionIndex + 1}/${MAX_TIMED_QUESTIONS}`;
        timedAnswerInput.value = '';
        timedAnswerInput.focus();
    } else {
        endTimedChallenge();
    }
}

function startTimedChallengeTimer() {
    clearInterval(timedChallengeTimer);
    timedChallengeTimerElement.textContent = `Waktu: ${timedChallengeTimeLeft} detik`;
    timedChallengeTimer = setInterval(() => {
        timedChallengeTimeLeft--;
        timedChallengeTimerElement.textContent = `Waktu: ${timedChallengeTimeLeft} detik`;
        
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
                setTimeout(() => { resetGame(); }, 1500);
            } else {
                for (let i = currentTimedQuestionIndex; i < MAX_TIMED_QUESTIONS; i++) {
                    timedChallengeQuestions[i].userAnswer = null;
                }
                showLoseMessage('Waktu Ujian Kilat Habis! Lanjut ke fase berikutnya.');
                setTimeout(() => {
                    hideAllGameAreas();
                    startChooseAnswerPhase();
                }, 1500);
            }
        }
    }, 1000);
}

function submitTimedAnswer() {
    const userAnswer = parseInt(timedAnswerInput.value);
    const currentQ = timedChallengeQuestions[currentTimedQuestionIndex];

    if (isNaN(userAnswer)) {
        timedChallengeFeedbackElement.textContent = 'Isi jawabanmu dulu ya!';
        return;
    }

    currentQ.userAnswer = userAnswer;
    
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
        }, 1000);
    } else {
        endTimedChallenge();
    }
}

function handleTimedChallengeKeyPress(event) {
    if (event.key === 'Enter' && timedAnswerInput.value !== '') {
        submitTimedAnswer();
    }
}

function endTimedChallenge() {
    clearInterval(timedChallengeTimer);
    timedAnswerInput.removeEventListener('keypress', handleTimedChallengeKeyPress);
    hideAllGameAreas();
    startChooseAnswerPhase();
}


// --- FUNGSI PILIH JAWABAN ACAK (EXISTING CODE) ---
let currentChooseQuestionIndex = 0;
let displayedChooseQuestions = [];
let chooseCorrectCount = 0;

function startChooseAnswerPhase() {
    chooseAnswerArea.classList.remove('hidden');
    currentChooseQuestionIndex = 0;
    chooseCorrectCount = 0;
    chooseFeedbackElement.textContent = '';
    
    displayedChooseQuestions = timedChallengeQuestions.filter(q => q.userAnswer !== null); // Hanya soal yang dijawab di fase pertama
    if (displayedChooseQuestions.length === 0) {
        showLoseMessage('Tidak ada soal yang dijawab di Ujian Kilat untuk fase ini.');
        return;
    }
    shuffleArray(displayedChooseQuestions);

    displayChooseQuestion();
}

function displayChooseQuestion() {
    if (currentChooseQuestionIndex < displayedChooseQuestions.length) {
        const q = displayedChooseQuestions[currentChooseQuestionIndex];
        chooseQuestionDisplay.textContent = q.question;
        answerChoicesContainer.innerHTML = '';

        let choices = [];
        choices.push(q.correctAnswer);

        while (choices.length < 4) {
            let randomWrongAnswer = Math.floor(Math.random() * 20) + 2;
            if (!choices.includes(randomWrongAnswer) && randomWrongAnswer !== q.correctAnswer) {
                choices.push(randomWrongAnswer);
            }
        }
        
        shuffleArray(choices);

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choice;
            button.onclick = () => selectChoice(choice, q.correctAnswer, button);
            answerChoicesContainer.appendChild(button);
        });

    } else {
        showFinalTimedChallengeResults();
    }
}

function selectChoice(selectedAnswer, correctAnswer, buttonElement) {
    Array.from(answerChoicesContainer.children).forEach(btn => btn.disabled = true);

    if (selectedAnswer === correctAnswer) {
        chooseFeedbackElement.textContent = '🎉 Benar! Hebat!';
        buttonElement.classList.add('correct');
        chooseCorrectCount++;
    } else {
        chooseFeedbackElement.textContent = `😅 Salah! Jawaban yang benar adalah ${correctAnswer}.`;
        buttonElement.classList.add('wrong');
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
    }, 1500);
}

function showFinalTimedChallengeResults() {
    hideAllGameAreas();
    let finalMessage = `Kamu menjawab benar ${timedChallengeCorrectCount} dari ${MAX_TIMED_QUESTIONS} soal di Ujian Kilat.`;
    finalMessage += `\nDi fase Pilih Jawaban, kamu benar ${chooseCorrectCount} dari ${displayedChooseQuestions.length} soal.`;

    if (timedChallengeCorrectCount + chooseCorrectCount >= (MAX_TIMED_QUESTIONS * 2) - 2) {
        showWinMessage();
        document.getElementById('win-message').querySelector('p').textContent = finalMessage + "\nKamu luar biasa, juara matematika!";
    } else {
        showLoseMessage(finalMessage + "\nTerus berlatih ya, pasti bisa lebih baik!");
    }
}

// --- FUNGSI BARU: MODE INGAT & COCOKKAN ---

function startMemorizeMatchMode() {
    hideAllGameAreas();
    memorizeMatchArea.classList.remove('hidden');
    memorizePhase.classList.remove('hidden');
    matchPhase.classList.add('hidden'); // Sembunyikan fase mencocokkan dulu
    
    memorizeMatchTimeLeft = 60; // Total waktu
    currentMemorizeMatches = [];
    selectedMatchElement = null;
    clearCanvas();

    memorizeQuestionsData = []; // Reset data soal
    memorizeQuestionsList.innerHTML = ''; // Bersihkan daftar soal

    // Generate 5 soal penjumlahan 1-10
    for (let i = 0; i < 5; i++) {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;
        let questionText = `${num1} + ${num2}`;
        let correctAnswer = num1 + num2;
        memorizeQuestionsData.push({ id: `q${i}`, question: questionText, answer: correctAnswer });

        const listItem = document.createElement('div');
        listItem.classList.add('memorize-item');
        listItem.textContent = `${questionText} = ${correctAnswer}`;
        memorizeQuestionsList.appendChild(listItem);
    }

    startMemorizeMatchTimer();
}

function startMemorizeMatchTimer() {
    clearInterval(memorizeMatchTimer);
    memorizeMatchTimerElement.textContent = `Waktu: ${memorizeMatchTimeLeft} detik`;
    memorizeMatchTimer = setInterval(() => {
        memorizeMatchTimeLeft--;
        memorizeMatchTimerElement.textContent = `Waktu: ${memorizeMatchTimeLeft} detik`;

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

function showMatchPhase() {
    memorizePhase.classList.add('hidden');
    matchPhase.classList.remove('hidden');
    memorizeMatchTimerElement.textContent = `Waktu Selesai! Sekarang Cocokkan!`; // Update timer text

    // Atur ukuran canvas sesuai dengan elemen parent
    canvas = document.getElementById('match-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = matchPhase.offsetWidth;
    canvas.height = matchPhase.offsetHeight; // Ambil tinggi dari match-phase

    // Hitung offset canvas relatif terhadap viewport
    canvasOffset = memorizeMatchArea.getBoundingClientRect();

    displayMatchQuestionsAndAnswers();
}

function displayMatchQuestionsAndAnswers() {
    matchQuestionsColumn.innerHTML = '';
    matchAnswersColumn.innerHTML = '';
    
    // Soal yang diacak
    let shuffledQuestions = [...memorizeQuestionsData];
    shuffleArray(shuffledQuestions);

    // Jawaban yang diacak
    let shuffledAnswers = [...memorizeQuestionsData];
    shuffleArray(shuffledAnswers);

    shuffledQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('match-item');
        questionDiv.textContent = q.question;
        questionDiv.dataset.questionId = q.id; // Simpan ID asli soal
        questionDiv.dataset.type = 'question';
        questionDiv.onclick = () => selectMatchItem(questionDiv);
        matchQuestionsColumn.appendChild(questionDiv);
    });

    shuffledAnswers.forEach((a, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('match-item');
        answerDiv.textContent = a.answer; // Tampilkan hanya jawaban
        answerDiv.dataset.answerId = a.id; // Simpan ID asli jawaban
        answerDiv.dataset.type = 'answer';
        answerDiv.onclick = () => selectMatchItem(answerDiv);
        matchAnswersColumn.appendChild(answerDiv);
    });
}

function selectMatchItem(element) {
    // Bersihkan semua highlight sebelumnya kecuali yang sedang dipilih
    document.querySelectorAll('.match-item').forEach(item => {
        if (item !== element && item !== selectedMatchElement) {
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
        if (selectedMatchElement.dataset.type === element.dataset.type) {
            // Jika tipe sama (misal: soal dengan soal), batalkan pilihan sebelumnya
            selectedMatchElement.classList.remove('selected');
            selectedMatchElement = element;
        } else {
            // Tipe berbeda (soal dengan jawaban), coba cocokkan
            const questionElement = selectedMatchElement.dataset.type === 'question' ? selectedMatchElement : element;
            const answerElement = selectedMatchElement.dataset.type === 'answer' ? selectedMatchElement : element;

            // Pastikan kedua elemen dari kolom yang berbeda
            if (questionElement.parentNode === matchAnswersColumn || answerElement.parentNode === matchQuestionsColumn) {
                // Ini mencegah mencocokkan elemen dari kolom yang sama (misal: Q1 dengan A1 yang keduanya di kolom jawaban)
                 selectedMatchElement.classList.remove('selected');
                 selectedMatchElement = element;
                 return;
            }


            const questionId = questionElement.dataset.questionId;
            const answerId = answerElement.dataset.answerId;

            // Cari data asli soal dari ID
            const originalQuestion = memorizeQuestionsData.find(q => q.id === questionId);
            const originalAnswer = memorizeQuestionsData.find(a => a.id === answerId);

            if (originalQuestion && originalAnswer && originalQuestion.id === originalAnswer.id) {
                // Jawaban benar, garis putus-putus
                drawLine(questionElement, answerElement, 'green', true); // true for dashed line for correct
                currentMemorizeMatches.push({
                    questionId: questionId,
                    answerId: answerId,
                    isCorrect: true,
                    elements: [questionElement, answerElement]
                });
            } else {
                // Jawaban salah, garis merah solid
                drawLine(questionElement, answerElement, 'red', false);
                currentMemorizeMatches.push({
                    questionId: questionId,
                    answerId: answerId,
                    isCorrect: false,
                    elements: [questionElement, answerElement]
                });
            }
            
            // Nonaktifkan elemen yang sudah dicocokkan
            questionElement.onclick = null;
            answerElement.onclick = null;
            questionElement.classList.add('matched');
            answerElement.classList.add('matched');

            // Hapus highlight dan reset pilihan
            selectedMatchElement.classList.remove('selected');
            element.classList.remove('selected');
            selectedMatchElement = null;

            // Periksa jika semua sudah dicocokkan
            if (currentMemorizeMatches.length === memorizeQuestionsData.length) {
                checkMatches(); // Otomatis periksa jika semua sudah dicocokkan
            }
        }
    }
}


function drawLine(el1, el2, color, isDashed = false) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    // Hitung posisi relatif terhadap canvas
    const x1 = rect1.left + rect1.width / 2 - canvasOffset.left;
    const y1 = rect1.top + rect1.height / 2 - canvasOffset.top;
    const x2 = rect2.left + rect2.width / 2 - canvasOffset.left;
    const y2 = rect2.top + rect2.height / 2 - canvasOffset.top;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (isDashed) {
        ctx.setLineDash([5, 5]); // Garis putus-putus
    } else {
        ctx.setLineDash([]); // Garis solid
    }
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function clearCanvas() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function checkMatches() {
    let correctCount = 0;
    currentMemorizeMatches.forEach(match => {
        if (match.isCorrect) {
            correctCount++;
        }
    });

    matchFeedbackElement.textContent = `Kamu benar ${correctCount} dari ${memorizeQuestionsData.length} pasangan!`;

    // Berikan feedback visual pada garis dan item
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

    setTimeout(() => {
        if (correctCount === memorizeQuestionsData.length) {
            showWinMessage();
            document.getElementById('win-message').querySelector('p').textContent = `Selamat! Kamu berhasil mencocokkan semua soal dengan benar! 🎉`;
        } else {
            showLoseMessage(`Maaf, kamu hanya berhasil mencocokkan ${correctCount} dari ${memorizeQuestionsData.length} soal dengan benar.`);
        }
    }, 2000); // Tunda sebentar agar pemain bisa melihat hasilnya
}


// --- UTILITY FUNCTIONS ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    hideAllGameAreas();
    mainMenu.classList.remove('hidden');

    // Inisialisasi canvas (pastikan saat memorizeMatchArea sudah visible)
    // Akan diatur ukurannya saat showMatchPhase()
    canvas = document.getElementById('match-canvas');
    ctx = canvas.getContext('2d');
    
    // Pastikan ukuran canvas sesuai dengan parent container saat resize
    window.addEventListener('resize', () => {
        if (!memorizeMatchArea.classList.contains('hidden')) {
            canvas.width = matchPhase.offsetWidth;
            canvas.height = matchPhase.offsetHeight;
            canvasOffset = memorizeMatchArea.getBoundingClientRect();
            // Gambar ulang garis jika ada
            redrawLines(); 
        }
    });
});

function redrawLines() {
    clearCanvas();
    currentMemorizeMatches.forEach(match => {
        // Periksa apakah elemen masih ada di DOM (belum dihapus/diganti)
        if (document.body.contains(match.elements[0]) && document.body.contains(match.elements[1])) {
            drawLine(match.elements[0], match.elements[1], match.isCorrect ? 'green' : 'red', match.isCorrect);
        }
    });
}
