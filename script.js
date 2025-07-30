document.addEventListener('DOMContentLoaded', () => {
    const folderTitles = document.querySelectorAll('.folder-title');
    const hitCountElement = document.getElementById('hitCount');
    const openGameBtn = document.getElementById('openGameBtn');
    const gameWindow = document.getElementById('gameWindow');
    const closeGameBtn = document.getElementById('closeGameBtn');
    const guessInput = document.getElementById('guessInput');
    const checkGuessBtn = document.getElementById('checkGuessBtn');
    const gameResult = document.getElementById('gameResult');
    const resetGameBtn = document.getElementById('resetGameBtn');
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');
    const loseSound = document.getElementById('loseSound');

    let secretNumber;
    let attempts;

    // --- Folder Toggle Logic ---
    function toggleProducts(event) {
        const titleElement = event.currentTarget;
        const parentFolder = titleElement.closest('.folder');
        const productsElementId = parentFolder.dataset.id;
        const productsElement = document.getElementById(productsElementId);
        const toggleArrow = titleElement.querySelector('.toggle-arrow');

        clickSound.currentTime = 0; // Rewind to start
        clickSound.play(); // Play sound

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
        let currentCount = parseInt(hitCountElement.textContent.replace(/,/g, '')); // Remove commas for parsing
        setInterval(() => {
            currentCount += Math.floor(Math.random() * 10) + 1;
            hitCountElement.textContent = currentCount.toLocaleString();
        }, 1000);
    }

    // --- Mini Game Logic ---
    function initGame() {
        secretNumber = Math.floor(Math.random() * 100) + 1; // Angka 1-100
        attempts = 0;
        gameResult.textContent = '';
        guessInput.value = '';
        guessInput.disabled = false;
        checkGuessBtn.disabled = false;
        resetGameBtn.style.display = 'none';
        guessInput.focus(); // Auto-focus input
        console.log("Secret number (for debugging):", secretNumber);
    }

    function checkGuess() {
        const guess = parseInt(guessInput.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            gameResult.textContent = '⛔ Masukkan angka valid antara 1-100!';
            loseSound.currentTime = 0;
            loseSound.play();
            return;
        }

        attempts++;

        if (guess === secretNumber) {
            gameResult.textContent = `🎉 YAY! Betul! Angkanya ${secretNumber}. Kamu cuma butuh ${attempts} percobaan!`;
            gameResult.style.color = '#008000'; // Hijau untuk menang
            guessInput.disabled = true;
            checkGuessBtn.disabled = true;
            resetGameBtn.style.display = 'block';
            winSound.currentTime = 0;
            winSound.play();
        } else if (guess < secretNumber) {
            gameResult.textContent = `⬆️ Lebih besar dari ${guess}. Coba lagi!`;
            gameResult.style.color = '#FF1493'; // Pink untuk hint
            loseSound.currentTime = 0;
            loseSound.play();
        } else {
            gameResult.textContent = `⬇️ Lebih kecil dari ${guess}. Coba lagi!`;
            gameResult.style.color = '#FF1493'; // Pink untuk hint
            loseSound.currentTime = 0;
            loseSound.play();
        }
        guessInput.value = ''; // Clear input
        guessInput.focus();
    }

    openGameBtn.addEventListener('click', () => {
        gameWindow.style.display = 'block';
        initGame(); // Inisialisasi game saat dibuka
        clickSound.currentTime = 0;
        clickSound.play();
    });

    closeGameBtn.addEventListener('click', () => {
        gameWindow.style.display = 'none';
        clickSound.currentTime = 0;
        clickSound.play();
    });

    checkGuessBtn.addEventListener('click', checkGuess);
    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkGuess();
        }
    });

    resetGameBtn.addEventListener('click', () => {
        initGame();
        clickSound.currentTime = 0;
        clickSound.play();
        gameResult.style.color = '#FF1493'; // Reset warna pesan
    });

    // --- Draggable Window Logic (Basic) ---
    let isDragging = false;
    let offsetX, offsetY;

    gameWindow.querySelector('.window-title-bar').addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - gameWindow.getBoundingClientRect().left;
        offsetY = e.clientY - gameWindow.getBoundingClientRect().top;
        gameWindow.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        gameWindow.style.left = `${e.clientX - offsetX}px`;
        gameWindow.style.top = `${e.clientY - offsetY}px`;
        gameWindow.style.transform = 'none'; // Disable transform to allow direct positioning
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        gameWindow.style.cursor = 'grab';
    });

    // Initialize game on page load (optional, but good for testing)
    // initGame(); // Remove this if you only want it to start when the button is clicked
});