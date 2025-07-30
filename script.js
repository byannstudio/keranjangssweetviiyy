document.addEventListener('DOMContentLoaded', () => {
    // --- General UI Elements ---
    const folderHeaders = document.querySelectorAll('.folder-header');
    const hitCountElement = document.getElementById('hitCount');
    const closeGameBtns = document.querySelectorAll('.game-window .close-btn');

    // --- Audio Elements ---
    // Pastikan path ini benar atau komentari baris playSound di bawah jika belum ada file audio
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');
    const loseSound = document.getElementById('loseSound');
    const whackSound = document.getElementById('whackSound');
    const popSound = document.getElementById('popSound');

    // --- Game Window Elements (Pastikan ID di HTML sama persis) ---
    const gameWindows = {
        guess: document.getElementById('guessGameWindow'),
        rps: document.getElementById('rpsGameWindow'),
        whacAMole: document.getElementById('whacAMoleGameWindow')
    };

    // --- Buttons to Open Games (Pastikan ID di HTML sama persis) ---
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
    const wamMoles = document.querySelectorAll('.mole');
    const wamTimerSpan = document.getElementById('wamTimer');
    const wamCurrentScoreSpan = document.getElementById('wamCurrentScore');
    const wamResult = document.getElementById('wamResult');
    const startWhacAMoleBtn = document.getElementById('startWhacAMoleBtn');
    const resetWhacAMoleBtn = document.getElementById('resetWhacAMoleBtn');

    let wamCurrentScore = 0;
    let wamTimeLeft = 0;
    let wamTimerId = null;
    let wamMolePopInterval = null;
    let lastMole = null; // To ensure different mole pops up consecutively
    const wamGameDuration = 30; // Game duration in seconds

    // --- Helper Function to Play Sound ---
    function playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0; // Rewind to start
            audioElement.play().catch(e => {
                // console.warn("Audio playback prevented:", e.message);
                // This is common if audio is played without prior user interaction.
                // We'll let it fail silently, as it doesn't break functionality.
            });
        }
    }

    // --- Folder Toggle Logic ---
    function toggleFolderContent(event) {
        const headerElement = event.currentTarget;
        const parentFolder = headerElement.closest('.folder');
        const contentElementId = parentFolder.dataset.id;
        const contentElement = document.getElementById(contentElementId);
        const toggleArrow = headerElement.querySelector('.toggle-arrow');

        playSound(clickSound);

        if (contentElement) {
            // Close other active folders first
            folderHeaders.forEach(otherHeader => {
                if (otherHeader !== headerElement) {
                    const otherParentFolder = otherHeader.closest('.folder');
                    const otherContentId = otherParentFolder.dataset.id;
                    const otherContentElement = document.getElementById(otherContentId);
                    if (otherContentElement && otherContentElement.classList.contains('active')) {
                        otherContentElement.classList.remove('active');
                        otherHeader.querySelector('.toggle-arrow').textContent = '▼';
                    }
                }
            });

            // Toggle current folder
            if (contentElement.classList.contains('active')) {
                contentElement.classList.remove('active');
                toggleArrow.textContent = '▼';
            } else {
                contentElement.classList.add('active');
                toggleArrow.textContent = '▲';
            }
        }
    }

    folderHeaders.forEach(header => {
        header.addEventListener('click', toggleFolderContent);
    });

    // --- Hit Counter Logic ---
    if (hitCountElement) {
        let currentCount = parseInt(hitCountElement.textContent); // Get initial value
        setInterval(() => {
            currentCount += Math.floor(Math.random() * 5) + 1; // Add 1-5 hits randomly
            hitCountElement.textContent = String(currentCount).padStart(6, '0'); // Format to 6 digits with leading zeros
        }, 1500); // Update every 1.5 seconds
    }

    // --- Main Title Glitch Effect ---
    const glitchTextElement = document.querySelector('.glitch-text');
    if (glitchTextElement) {
        setInterval(() => {
            glitchTextElement.style.setProperty('--random-x', (Math.random() * 4 - 2).toFixed(2)); // Random -2 to +2
        }, 100); // Change random value frequently
    }


    // --- Game Window Management ---
    function openGameWindow(gameId) {
        // Hide all game windows first
        Object.values(gameWindows).forEach(window => {
            if (window) window.style.display = 'none';
        });

        const windowToOpen = gameWindows[gameId];
        if (windowToOpen) {
            windowToOpen.style.display = 'block';
            playSound(clickSound);

            // Reset position to center for better user experience
            windowToOpen.style.left = '50%';
            windowToOpen.style.top = '50%';
            windowToOpen.style.transform = 'translate(-50%, -50%)';
            windowToOpen.style.zIndex = '2001'; // Bring to front

            // Initialize specific game logic
            if (gameId === 'guess') initGuessGame();
            else if (gameId === 'rps') initRPSGame();
            else if (gameId === 'whacAMole') initWhacAMoleGame();
        }
    }

    // Event listeners for game launch buttons
    if (openGuessGameBtn) openGuessGameBtn.addEventListener('click', () => openGameWindow('guess'));
    if (openRPSGameBtn) openRPSGameBtn.addEventListener('click', () => openGameWindow('rps'));
    if (openWhacAMoleBtn) openWhacAMoleBtn.addEventListener('click', () => openGameWindow('whacAMole'));

    // Event listener for close buttons
    closeGameBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const gameId = event.currentTarget.dataset.gameId;
            if (gameWindows[gameId]) {
                gameWindows[gameId].style.display = 'none';
                playSound(clickSound);
                // Stop ongoing game intervals when window is closed
                if (gameId === 'whacAMole') stopWhacAMoleGame();
            }
        });
    });

    // --- Draggable Window Logic ---
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
                windowEl.style.zIndex = '2002'; // Bring to highest Z-index when dragging
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            windowEl.style.left = `${e.clientX - offsetX}px`;
            windowEl.style.top = `${e.clientY - offsetY}px`;
            windowEl.style.transform = 'none'; // Disable translate for explicit positioning
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (windowEl) {
                    windowEl.style.cursor = 'grab';
                    windowEl.style.zIndex = '2001'; // Revert to default game window Z-index
                }
            }
        });
    });


    // --- Guess The Number Game Logic ---
    function initGuessGame() {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        guessGameResult.textContent = '';
        guessGameResult.style.color = '#FF69B4'; // Reset message color
        guessInput.value = '';
        guessInput.disabled = false;
        checkGuessBtn.disabled = false;
        resetGuessGameBtn.style.display = 'none';
        guessInput.focus();
        // console.log("Secret number (Guess the Number):", secretNumber); // For debugging
    }

    function checkGuess() {
        const guess = parseInt(guessInput.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            guessGameResult.textContent = '⛔ Please enter a valid number between 1-100!';
            playSound(loseSound);
            return;
        }

        attempts++;

        if (guess === secretNumber) {
            guessGameResult.textContent = `🎉 CONGRATS! The number was ${secretNumber}! You guessed it in ${attempts} attempts!`;
            guessGameResult.style.color = '#00FF00'; // Green for win
            guessInput.disabled = true;
            checkGuessBtn.disabled = true;
            resetGuessGameBtn.style.display = 'block';
            playSound(winSound);
        } else if (guess < secretNumber) {
            guessGameResult.textContent = `⬆️ Higher than ${guess}. Try again!`;
            playSound(loseSound);
        } else {
            guessGameResult.textContent = `⬇️ Lower than ${guess}. Try again!`;
            playSound(loseSound);
        }
        guessInput.value = '';
        guessInput.focus();
    }

    if (checkGuessBtn) checkGuessBtn.addEventListener('click', checkGuess);
    if (guessInput) guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkGuess();
        }
    });
    if (resetGuessGameBtn) resetGuessGameBtn.addEventListener('click', () => {
        initGuessGame();
        playSound(clickSound);
    });

    // --- Rock, Paper, Scissors Game Logic ---
    function initRPSGame() {
        playerScore = 0;
        computerScore = 0;
        updateRPSScore();
        rpsResult.textContent = 'Choose your move!';
        rpsResult.style.color = '#FF69B4'; // Reset message color
        resetRPSGameBtn.style.display = 'none';
        rpsButtons.forEach(btn => btn.disabled = false);
    }

    function playRPS(playerChoice) {
        playSound(clickSound);
        const computerChoice = rpsChoices[Math.floor(Math.random() * rpsChoices.length)];
        let resultMessage = '';

        if (playerChoice === computerChoice) {
            resultMessage = `It's a tie! You picked ${playerChoice}, Computer picked ${computerChoice}.`;
        } else if (
            (playerChoice === 'batu' && computerChoice === 'gunting') ||
            (playerChoice === 'kertas' && computerChoice === 'batu') ||
            (playerChoice === 'gunting' && computerChoice === 'kertas')
        ) {
            resultMessage = `You WIN! You picked ${playerChoice}, Computer picked ${computerChoice}.`;
            playerScore++;
            playSound(winSound);
        } else {
            resultMessage = `You LOSE! You picked ${playerChoice}, Computer picked ${computerChoice}.`;
            computerScore++;
            playSound(loseSound);
        }

        rpsResult.textContent = resultMessage;
        updateRPSScore();

        if (playerScore === 3) {
            rpsResult.textContent = '🥳 YOU ARE THE RPS CHAMPION! 🥳';
            rpsResult.style.color = '#00FF00'; // Green for win
            endRPSGame();
            playSound(winSound);
        } else if (computerScore === 3) {
            rpsResult.textContent = '😭 GAME OVER! COMPUTER WINS! 😭';
            rpsResult.style.color = '#FF0000'; // Red for lose
            endRPSGame();
            playSound(loseSound);
        }
    }

    function updateRPSScore() {
        if (playerScoreSpan) playerScoreSpan.textContent = playerScore;
        if (computerScoreSpan) computerScoreSpan.textContent = computerScore;
    }

    function endRPSGame() {
        rpsButtons.forEach(btn => btn.disabled = true);
        if (resetRPSGameBtn) resetRPSGameBtn.style.display = 'block';
    }

    rpsButtons.forEach(button => {
        button.addEventListener('click', (e) => playRPS(e.currentTarget.dataset.choice));
    });
    if (resetRPSGameBtn) resetRPSGameBtn.addEventListener('click', () => {
        initRPSGame();
        playSound(clickSound);
    });

    // --- Whac-A-Mole Game Logic ---
    function initWhacAMoleGame() {
        wamCurrentScore = 0;
        wamTimeLeft = wamGameDuration;
        if (wamCurrentScoreSpan) wamCurrentScoreSpan.textContent = wamCurrentScore;
        if (wamTimerSpan) wamTimerSpan.textContent = wamTimeLeft;
        if (wamResult) wamResult.textContent = 'Get ready to whack some bytes!';
        if (wamResult) wamResult.style.color = '#FF69B4'; // Reset message color
        if (resetWhacAMoleBtn) resetWhacAMoleBtn.style.display = 'none';
        if (startWhacAMoleBtn) startWhacAMoleBtn.style.display = 'block';

        // Ensure all moles are hidden and reset
        wamMoles.forEach(mole => {
            mole.classList.remove('active', 'hit');
            mole.style.bottom = '-100%';
            mole.textContent = ''; // Clear emoji
        });
        stopWhacAMoleGame(); // Clear any running intervals
    }

    function randomMole() {
        // Filter out moles that are currently active or hit to avoid re-selecting
        const availableMoles = Array.from(wamMoles).filter(mole =>
            !mole.classList.contains('active') && !mole.classList.contains('hit')
        );

        if (availableMoles.length === 0) {
            return null; // No available moles to pop up
        }

        const randomIndex = Math.floor(Math.random() * availableMoles.length);
        const selectedMole = availableMoles[randomIndex];

        // Ensure a different mole pops up consecutively if possible
        if (selectedMole === lastMole && availableMoles.length > 1) {
            return randomMole(); // Recursively call until a different mole is found
        }
        lastMole = selectedMole;
        return selectedMole;
    }

    function popUpMole() {
        if (wamTimeLeft <= 0) {
            stopWhacAMoleGame();
            return;
        }

        const mole = randomMole();
        if (!mole) return;

        mole.classList.add('active');
        const emojis = ['🐛', '👾', '🦠', '🤖', '⚡', '💻']; // More byte/virus emojis
        mole.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        playSound(popSound);

        // Mole will disappear automatically if not hit
        setTimeout(() => {
            if (mole.classList.contains('active')) { // Only hide if still active (not hit)
                mole.classList.remove('active');
                mole.style.bottom = '-100%';
                mole.textContent = ''; // Clear emoji after hiding
            }
        }, 800); // Mole stays up for 0.8 seconds
    }

    function startGameWAM() {
        wamCurrentScore = 0;
        wamTimeLeft = wamGameDuration;
        if (wamCurrentScoreSpan) wamCurrentScoreSpan.textContent = wamCurrentScore;
        if (wamTimerSpan) wamTimerSpan.textContent = wamTimeLeft;
        if (wamResult) wamResult.textContent = 'GO! GO! GO!';
        if (startWhacAMoleBtn) startWhacAMoleBtn.style.display = 'none';
        if (resetWhacAMoleBtn) resetWhacAMoleBtn.style.display = 'none';

        stopWhacAMoleGame(); // Clear existing intervals before starting new ones

        wamTimerId = setInterval(() => {
            wamTimeLeft--;
            if (wamTimerSpan) wamTimerSpan.textContent = wamTimeLeft;

            if (wamTimeLeft <= 0) {
                stopWhacAMoleGame();
                if (wamResult) wamResult.textContent = `🎮 TIME'S UP! Your final score: ${wamCurrentScore}`;
                if (wamResult) wamResult.style.color = (wamCurrentScore >= 5) ? '#00FF00' : '#FF0000'; // Green/Red
                if (resetWhacAMoleBtn) resetWhacAMoleBtn.style.display = 'block';
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
            mole.classList.remove('active', 'hit');
            mole.style.bottom = '-100%';
            mole.textContent = '';
        });
    }

    wamMoles.forEach(mole => {
        mole.addEventListener('click', () => {
            if (mole.classList.contains('active') && wamTimerId !== null) {
                wamCurrentScore++;
                if (wamCurrentScoreSpan) wamCurrentScoreSpan.textContent = wamCurrentScore;
                mole.classList.remove('active');
                mole.classList.add('hit');
                mole.textContent = '💥'; // Hit effect emoji

                playSound(whackSound);

                setTimeout(() => {
                    mole.classList.remove('hit');
                    mole.textContent = ''; // Clear hit emoji
                    mole.style.bottom = '-100%'; // Hide completely
                }, 200);
            }
        });
    });

    if (startWhacAMoleBtn) startWhacAMoleBtn.addEventListener('click', () => {
        startGameWAM();
        playSound(clickSound);
    });
    if (resetWhacAMoleBtn) resetWhacAMoleBtn.addEventListener('click', () => {
        initWhacAMoleGame();
        playSound(clickSound);
    });

    // --- Initializations (Call init for each game when DOM is ready) ---
    initGuessGame();
    initRPSGame();
    initWhacAMoleGame();
});
