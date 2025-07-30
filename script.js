document.addEventListener('DOMContentLoaded', () => {
    // --- General UI Elements ---
    const folderTitles = document.querySelectorAll('.folder-title');
    const hitCountElement = document.getElementById('hitCount');
    const closeGameBtns = document.querySelectorAll('.game-window .close-btn');

    // --- Audio Elements ---
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');
    const loseSound = document.getElementById('loseSound');
    const whackSound = document.getElementById('whackSound');
    const popSound = document.getElementById('popSound');

    // --- Game Window Elements ---
    const gameWindows = {
        guess: document.getElementById('guessGameWindow'),
        rps: document.getElementById('rpsGameWindow'),
        whacAMole: document.getElementById('whacAMoleGameWindow')
    };

    // --- Buttons to Open Games ---
    const openGuessGameBtn = document.getElementById('openGuessGameBtn');
    const openRPSGameBtn = document.getElementById('openRPSGameBtn');
    const openWhacAMoleBtn = document.getElementById('openWhacAMoleBtn');

    // --- Guess The Number Game Elements ---
    let secretNumber;
    let attempts;
    const guessInput = document.getElementById('guessInput');
    const checkGuessBtn = document.getElementById('checkGuessBtn');
    const guessGameResult = document.getElementById('guessGameResult');
    const resetGuessGameBtn = document.getElementById('resetGuessGameBtn');

    // --- Rock, Paper, Scissors Game Elements ---
    const rpsButtons = document.querySelectorAll('.rps-btn');
    const rpsResult = document.getElementById('rpsResult');
    const playerScoreSpan = document.getElementById('playerScore');
    const computerScoreSpan = document.getElementById('computerScore');
    const resetRPSGameBtn = document.getElementById('resetRPSGameBtn');
    let playerScore = 0;
    let computerScore = 0;
    const rpsChoices = ['batu', 'kertas', 'gunting'];

    // --- Whac-A-Mole Game Elements ---
    const wamGrid = document.getElementById('wamGrid');
    const wamMoles = document.querySelectorAll('.mole'); // Get all mole elements
    const wamTimerSpan = document.getElementById('wamTimer');
    const wamCurrentScoreSpan = document.getElementById('wamCurrentScore');
    const wamResult = document.getElementById('wamResult');
    const startWhacAMoleBtn = document.getElementById('startWhacAMoleBtn');
    const resetWhacAMoleBtn = document.getElementById('resetWhacAMoleBtn');

    let wamCurrentScore = 0;
    let wamTimeLeft = 0;
    let wamTimerId = null;
    let wamMolePopInterval = null;
    let lastMole = null; // To ensure different moles pop up
    const wamGameDuration = 30; // seconds

    // --- Helper Function to Play Sound ---
    function playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0; // Rewind to start
            audioElement.play().catch(e => console.error("Audio playback error:", e)); // Catch potential errors
        }
    }

    // --- Folder Toggle Logic ---
    function toggleProducts(event) {
        const titleElement = event.currentTarget;
        const parentFolder = titleElement.closest('.folder');
        const productsElementId = parentFolder.dataset.id;
        const productsElement = document.getElementById(productsElementId);
        const toggleArrow = titleElement.querySelector('.toggle-arrow');

        playSound(clickSound);

        if (productsElement) {
            if (productsElement.classList.contains('active')) {
                productsElement.classList.remove('active');
                toggleArrow.textContent = '▼';
            } else {
                folderTitles.forEach(otherTitle => {
                    if (otherTitle !== titleElement) {
                        const otherParentFolder = otherTitle.closest('.folder');
                        const otherProductsId = otherParentFolder.dataset.id;
                        const otherProductsElement = document.getElementById(otherProductsId);
                        if (otherProductsElement && otherProductsElement.classList.contains('active')) {
                            otherProductsElement.classList.remove('active');
                            otherTitle.querySelector('.toggle-arrow').textContent = '▼';
                        }
                    }
                });
                productsElement.classList.add('active');
                toggleArrow.textContent = '▲';
            }
        }
    }

    folderTitles.forEach(title => {
        title.addEventListener('click', toggleProducts);
    });

    // --- Hit Counter Logic ---
    if (hitCountElement) {
        let currentCount = parseInt(hitCountElement.textContent.replace(/,/g, ''));
        setInterval(() => {
            currentCount += Math.floor(Math.random() * 10) + 1;
            hitCountElement.textContent = currentCount.toLocaleString();
        }, 1000);
    }

    // --- Game Window Management (Unified) ---
    function openGameWindow(gameId) {
        // Hide all game windows first
        Object.values(gameWindows).forEach(window => {
            window.style.display = 'none';
        });

        // Show the specific game window
        const windowToOpen = gameWindows[gameId];
        if (windowToOpen) {
            windowToOpen.style.display = 'block';
            playSound(clickSound);
            // Re-center if it was dragged off screen
            windowToOpen.style.left = '50%';
            windowToOpen.style.top = '50%';
            windowToOpen.style.transform = 'translate(-50%, -50%)';

            // Initialize game specific logic
            if (gameId === 'guess') initGuessGame();
            else if (gameId === 'rps') initRPSGame();
            else if (gameId === 'whacAMole') initWhacAMoleGame();
        }
    }

    closeGameBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const gameId = event.currentTarget.dataset.gameId;
            if (gameWindows[gameId]) {
                gameWindows[gameId].style.display = 'none';
                playSound(clickSound);
                // Stop any running game intervals/timers
                if (gameId === 'whacAMole') stopWhacAMoleGame();
            }
        });
    });

    // --- Draggable Window Logic (Unified) ---
    gameWindows.forEach(windowEl => { // This will iterate through elements directly
        if (!windowEl) return;
        let isDragging = false;
        let offsetX, offsetY;
        const titleBar = windowEl.querySelector('.window-title-bar');

        if (titleBar) {
            titleBar.addEventListener('mousedown', (e) => {
                isDragging = true;
                offsetX = e.clientX - windowEl.getBoundingClientRect().left;
                offsetY = e.clientY - windowEl.getBoundingClientRect().top;
                windowEl.style.cursor = 'grabbing';
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            windowEl.style.left = `${e.clientX - offsetX}px`;
            windowEl.style.top = `${e.clientY - offsetY}px`;
            windowEl.style.transform = 'none'; // Disable transform to allow direct positioning
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (windowEl) windowEl.style.cursor = 'grab'; // Restore cursor for the specific window
        });
    });

    // Fix for forEach on object values:
    Object.values(gameWindows).forEach(windowEl => {
        if (!windowEl) return;
        let isDragging = false;
        let offsetX, offsetY;
        const titleBar = windowEl.querySelector('.window-title-bar');

        if (titleBar) {
            titleBar.addEventListener('mousedown', (e) => {
                isDragging = true;
                offsetX = e.clientX - windowEl.getBoundingClientRect().left;
                offsetY = e.clientY - windowEl.getBoundingClientRect().top;
                windowEl.style.cursor = 'grabbing';
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            // Prevent dragging if the event target is not the title bar or child of title bar
            // This is a basic check, for complex nested elements, might need more robust solution
            if (e.target.closest('.window-title-bar') !== titleBar && e.target !== titleBar) {
                // Do not drag if mouse is over content area
                return;
            }

            windowEl.style.left = `${e.clientX - offsetX}px`;
            windowEl.style.top = `${e.clientY - offsetY}px`;
            windowEl.style.transform = 'none'; // Disable transform to allow direct positioning
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (windowEl) windowEl.style.cursor = 'grab'; // Restore cursor for the specific window
        });
    });

    // --- Guess The Number Game Logic ---
    function initGuessGame() {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        guessGameResult.textContent = '';
        guessGameResult.style.color = '#FF1493'; // Reset color
        guessInput.value = '';
        guessInput.disabled = false;
        checkGuessBtn.disabled = false;
        resetGuessGameBtn.style.display = 'none';
        guessInput.focus();
        console.log("Secret number (Guess the Number):", secretNumber);
    }

    function checkGuess() {
        const guess = parseInt(guessInput.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            guessGameResult.textContent = '⛔ Masukkan angka valid antara 1-100!';
            playSound(loseSound);
            return;
        }

        attempts++;

        if (guess === secretNumber) {
            guessGameResult.textContent = `🎉 YAY! Betul! Angkanya ${secretNumber}. Kamu cuma butuh ${attempts} percobaan!`;
            guessGameResult.style.color = '#008000'; // Green for win
            guessInput.disabled = true;
            checkGuessBtn.disabled = true;
            resetGuessGameBtn.style.display = 'block';
            playSound(winSound);
        } else if (guess < secretNumber) {
            guessGameResult.textContent = `⬆️ Lebih besar dari ${guess}. Coba lagi!`;
            playSound(loseSound);
        } else {
            guessGameResult.textContent = `⬇️ Lebih kecil dari ${guess}. Coba lagi!`;
            playSound(loseSound);
        }
        guessInput.value = '';
        guessInput.focus();
    }

    openGuessGameBtn.addEventListener('click', () => openGameWindow('guess'));
    checkGuessBtn.addEventListener('click', checkGuess);
    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkGuess();
        }
    });
    resetGuessGameBtn.addEventListener('click', () => {
        initGuessGame();
        playSound(clickSound);
    });

    // --- Rock, Paper, Scissors Game Logic ---
    function initRPSGame() {
        playerScore = 0;
        computerScore = 0;
        updateRPSScore();
        rpsResult.textContent = 'Ayo main! Pilih gerakanmu.';
        rpsResult.style.color = '#FF1493';
        resetRPSGameBtn.style.display = 'none';
        rpsButtons.forEach(btn => btn.disabled = false);
    }

    function playRPS(playerChoice) {
        playSound(clickSound);
        const computerChoice = rpsChoices[Math.floor(Math.random() * rpsChoices.length)];
        let resultMessage = '';

        if (playerChoice === computerChoice) {
            resultMessage = `Seri! Kamu ${playerChoice}, Komputer ${computerChoice}.`;
        } else if (
            (playerChoice === 'batu' && computerChoice === 'gunting') ||
            (playerChoice === 'kertas' && computerChoice === 'batu') ||
            (playerChoice === 'gunting' && computerChoice === 'kertas')
        ) {
            resultMessage = `Kamu menang! Kamu ${playerChoice}, Komputer ${computerChoice}.`;
            playerScore++;
            playSound(winSound);
        } else {
            resultMessage = `Kamu kalah! Kamu ${playerChoice}, Komputer ${computerChoice}.`;
            computerScore++;
            playSound(loseSound);
        }

        rpsResult.textContent = resultMessage;
        updateRPSScore();

        if (playerScore === 3) {
            rpsResult.textContent = '🥳 SELAMAT! Kamu jadi juara! 🥳';
            rpsResult.style.color = '#008000';
            endRPSGame();
            playSound(winSound);
        } else if (computerScore === 3) {
            rpsResult.textContent = '😭 GAME OVER! Komputer menang! 😭';
            rpsResult.style.color = '#FF4500'; // OrangeRed for loss
            endRPSGame();
            playSound(loseSound);
        }
    }

    function updateRPSScore() {
        playerScoreSpan.textContent = playerScore;
        computerScoreSpan.textContent = computerScore;
    }

    function endRPSGame() {
        rpsButtons.forEach(btn => btn.disabled = true);
        resetRPSGameBtn.style.display = 'block';
    }

    openRPSGameBtn.addEventListener('click', () => openGameWindow('rps'));
    rpsButtons.forEach(button => {
        button.addEventListener('click', (e) => playRPS(e.currentTarget.dataset.choice));
    });
    resetRPSGameBtn.addEventListener('click', () => {
        initRPSGame();
        playSound(clickSound);
    });

    // --- Whac-A-Mole Game Logic ---
    function initWhacAMoleGame() {
        wamCurrentScore = 0;
        wamTimeLeft = wamGameDuration;
        wamCurrentScoreSpan.textContent = wamCurrentScore;
        wamTimerSpan.textContent = wamTimeLeft;
        wamResult.textContent = 'Siap-siap pukul byte!';
        wamResult.style.color = '#FF1493';
        resetWhacAMoleBtn.style.display = 'none';
        startWhacAMoleBtn.style.display = 'block';
        wamMoles.forEach(mole => {
            mole.classList.remove('active', 'hit');
            mole.style.bottom = '-100%'; // Ensure all moles are hidden
        });
        stopWhacAMoleGame(); // Clear any running intervals from previous game
    }

    function randomMole() {
        const randomIndex = Math.floor(Math.random() * wamMoles.length);
        const selectedMole = wamMoles[randomIndex];

        // Ensure different mole pops up consecutively
        if (selectedMole === lastMole) {
            return randomMole();
        }
        lastMole = selectedMole;
        return selectedMole;
    }

    function popUpMole() {
        const mole = randomMole();
        mole.classList.add('active');
        // Add random emoji to mole
        const emojis = ['🐛', '👾', '🦠', '🤖', '⚡'];
        mole.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        playSound(popSound);

        setTimeout(() => {
            mole.classList.remove('active');
            mole.style.bottom = '-100%'; // Hide mole after some time if not hit
            // Clear content if mole not hit, to avoid showing emoji on subsequent pop up
            if (!mole.classList.contains('hit')) {
                 mole.textContent = '';
            }
        }, 800); // Mole stays up for 0.8 seconds
    }

    function startGameWAM() {
        wamCurrentScore = 0;
        wamTimeLeft = wamGameDuration;
        wamCurrentScoreSpan.textContent = wamCurrentScore;
        wamTimerSpan.textContent = wamTimeLeft;
        wamResult.textContent = 'GO!';
        startWhacAMoleBtn.style.display = 'none';
        resetWhacAMoleBtn.style.display = 'none';

        wamTimerId = setInterval(() => {
            wamTimeLeft--;
            wamTimerSpan.textContent = wamTimeLeft;

            if (wamTimeLeft <= 0) {
                stopWhacAMoleGame();
                wamResult.textContent = `🎮 Waktu habis! Skor akhirmu: ${wamCurrentScore}`;
                wamResult.style.color = (wamCurrentScore >= 5) ? '#008000' : '#FF4500'; // Green if good score, red if not
                resetWhacAMoleBtn.style.display = 'block';
                playSound((wamCurrentScore >= 5) ? winSound : loseSound);
            }
        }, 1000);

        wamMolePopInterval = setInterval(popUpMole, 1000); // Mole pops up every 1 second
    }

    function stopWhacAMoleGame() {
        clearInterval(wamTimerId);
        clearInterval(wamMolePopInterval);
        wamTimerId = null;
        wamMolePopInterval = null;
        wamMoles.forEach(mole => {
            mole.classList.remove('active');
            mole.style.bottom = '-100%'; // Ensure all moles are hidden
        });
    }

    wamMoles.forEach(mole => {
        mole.addEventListener('click', () => {
            if (mole.classList.contains('active') && wamTimerId !== null) { // Only hit if active and game is running
                wamCurrentScore++;
                wamCurrentScoreSpan.textContent = wamCurrentScore;
                mole.classList.remove('active'); // Hide immediately
                mole.classList.add('hit'); // Add hit class for visual feedback
                mole.textContent = '💥'; // Show hit effect

                playSound(whackSound);

                // Remove hit class after a short delay to reset for next pop-up
                setTimeout(() => {
                    mole.classList.remove('hit');
                    mole.textContent = ''; // Clear emoji after hit
                    mole.style.bottom = '-100%'; // Ensure it's fully hidden
                }, 200);
            }
        });
    });

    openWhacAMoleBtn.addEventListener('click', () => openGameWindow('whacAMole'));
    startWhacAMoleBtn.addEventListener('click', () => startGameWAM());
    resetWhacAMoleBtn.addEventListener('click', () => {
        initWhacAMoleGame();
        playSound(clickSound);
    });

    // --- Initializations ---
    initGuessGame(); // Initialize Guess Game on load
    initRPSGame();   // Initialize RPS Game on load
    initWhacAMoleGame(); // Initialize Whac-A-Mole Game on load
});
