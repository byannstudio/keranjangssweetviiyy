let mode = 'addition';
let level = 1;
let currentQuestion = {};
let timerInterval;
let timeLeft = 10;
let score = 0;
const WIN_THRESHOLD = 5;

const mainMenu = document.getElementById('main-menu');
const levelMenu = document.getElementById('level-menu');
const gameArea = document.getElementById('game-area');
const winMessage = document.getElementById('win-message');
const questionElement = document.getElementById('question');
const susunHintElement = document.getElementById('susun-hint');
const answerInputsContainer = document.getElementById('answer-inputs');
const feedbackElement = document.getElementById('feedback');
const timerElement = document.getElementById('timer');
const checkButton = document.getElementById('check-button');
const nextQuestionButton = document.getElementById('next-question-button');

// Variabel untuk menyimpan referensi kotak input saat ini
let answerBoxes = [];
let singleAnswerInput = null; // Untuk input tunggal di level 1-3

function selectMode(selectedMode) {
    mode = selectedMode;
    mainMenu.classList.add('hidden');
    levelMenu.classList.remove('hidden');
}

function startGame(selectedLevel) {
    level = selectedLevel;
    score = 0;
    levelMenu.classList.add('hidden');
    gameArea.classList.remove('hidden');
    nextQuestion();
}

function createAnswerBoxes(numDigits) {
    answerInputsContainer.innerHTML = ''; // Bersihkan container sebelumnya
    answerBoxes = []; // Reset array kotak jawaban
    singleAnswerInput = null; // Pastikan input tunggal direset

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

    answerBoxes.reverse(); // Balik urutan agar indeks 0 adalah kotak paling kiri

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

    susunHintElement.classList.add('hidden'); // Sembunyikan petunjuk secara default
    questionElement.classList.remove('question-fancy'); // Hapus gaya fancy
    questionElement.innerHTML = ''; // Bersihkan innerHTML
    answerInputsContainer.innerHTML = ''; // Bersihkan kontainer input
    answerBoxes = []; // Reset array kotak jawaban
    singleAnswerInput = null; // Reset single input

    if (level >= 4) { // Level 4 & 5 (susun)
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 90) + 10;

        if (mode === 'subtraction' && num2 > num1) {
            [num1, num2] = [num2, num1];
        } else if (mode === 'addition' && (num1 + num2) > 199) { // Batasi hasil penjumlahan agar tidak terlalu besar (maksimal 199)
            // Kalau terlalu besar, buat ulang
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
        
        // Tampilkan soal dengan gaya fancy
        questionElement.classList.add('question-fancy');
        let operatorSymbol = mode === 'addition' ? '+' : '-';
        questionElement.innerHTML = `
            <span class="emoji-side">✨</span>
            ${num1} ${operatorSymbol} ${num2} = ?
            <span class="emoji-side">💖</span>
        `;
        
        currentQuestion = { num1, num2, correctAnswer: answer };

        // Buat satu kotak input biasa (seperti sebelumnya)
        singleAnswerInput = document.createElement('input');
        singleAnswerInput.type = 'number';
        singleAnswerInput.id = 'answer'; // Pastikan ID ini unik atau sesuaikan
        singleAnswerInput.placeholder = 'Jawab di sini, yaaa...';
        singleAnswerInput.classList.add('single-answer-input'); // Tambahkan class baru
        answerInputsContainer.appendChild(singleAnswerInput);
        
        singleAnswerInput.focus();
        singleAnswerInput.addEventListener('keypress', handleKeyPress);
    }
    
    // Kosongkan semua input box yang relevan
    if (singleAnswerInput) {
        singleAnswerInput.value = '';
    } else {
        answerBoxes.forEach(box => box.value = '');
    }

    feedbackElement.textContent = '';
    checkButton.classList.remove('hidden');
    nextQuestionButton.classList.add('hidden');
    
    // Fokuskan input yang relevan
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

    if (level >= 4) { // Untuk level susun, ambil jawaban dari kotak-kotak
        userAnswer = getAnswerFromBoxes();
        const allFilled = answerBoxes.every(box => box.value !== '');
        if (!allFilled) {
            feedbackElement.textContent = 'Isi semua kotak jawaban dulu, ya! 🤔';
            return;
        }
    } else { // Untuk level biasa, ambil dari satu input
        if (!singleAnswerInput) { // Pastikan input ada
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
    // Ini hanya untuk Level 1, 2, 3 (satu input)
    // Event listener ini sekarang ditambahkan langsung ke `singleAnswerInput` di `generateQuestion`
    if (event.key === 'Enter' && singleAnswerInput && singleAnswerInput.value !== '') {
        if (!checkButton.classList.contains('hidden')) {
            checkAnswer();
        } 
        else if (!nextQuestionButton.classList.contains('hidden')) {
            nextQuestion();
        }
    }
    // Untuk Level 4/5, Enter diatur per kotak di `createAnswerBoxes`
}

function showWinMessage() {
    gameArea.classList.add('hidden');
    winMessage.classList.remove('hidden');
    clearInterval(timerInterval);
    // Hapus event listener keypress dari input
    if (singleAnswerInput) {
        singleAnswerInput.removeEventListener('keypress', handleKeyPress);
    }
    answerBoxes.forEach(box => box.removeEventListener('keypress', handleKeyPress));
}

function resetGame() {
    winMessage.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    score = 0;
    feedbackElement.textContent = '';
    timerElement.textContent = '';
    answerInputsContainer.innerHTML = ''; // Pastikan kotak jawaban dihapus
    answerBoxes = []; // Reset array
    singleAnswerInput = null; // Reset input tunggal
}

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
    levelMenu.classList.add('hidden');
    gameArea.classList.add('hidden');
    winMessage.classList.add('hidden');
});
