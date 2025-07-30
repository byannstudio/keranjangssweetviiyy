document.addEventListener('DOMContentLoaded', () => {
    // --- General UI Elements ---
    const folderTitles = document.querySelectorAll('.folder-title');
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
    let lastMole = null; // Untuk memastikan mole yang berbeda muncul berturut-turut
    const wamGameDuration = 30; // Durasi game dalam detik

    // --- Helper Function to Play Sound ---
    function playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0; // Kembalikan ke awal
            // Menangkap potensi error jika browser memblokir autoplay tanpa interaksi user
            audioElement.play().catch(e => {
                // console.warn("Audio playback prevented:", e.message);
                // Kamu bisa memilih untuk menampilkan pesan error di konsol
            });
        }
    }

    // --- Folder Toggle Logic ---
    function toggleProducts(event) {
        const titleElement = event.currentTarget;
        const parentFolder = titleElement.closest('.folder');
        const productsElementId = parentFolder.dataset.id;
        const productsElement = document.getElementById(productsElementId);
        const toggleArrow = titleElement.querySelector('.toggle-arrow');

        playSound(clickSound); // Mainkan suara saat klik folder

        if (productsElement) {
            if (productsElement.classList.contains('active')) {
                productsElement.classList.remove('active');
                toggleArrow.textContent = '▼';
            } else {
                // Sembunyikan folder lain yang aktif
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
            currentCount += Math.floor(Math.random() * 10) + 1; // Tambah 1-10 hits acak
            hitCountElement.textContent = currentCount.toLocaleString(); // Format angka dengan koma
        }, 1000); // Update setiap 1 detik
    }

    // --- Game Window Management (Unified) ---
    function openGameWindow(gameId) {
        // Sembunyikan semua jendela game terlebih dahulu
        Object.values(gameWindows).forEach(window => {
            if (window) window.style.display = 'none';
        });

        // Tampilkan jendela game yang diminta
        const windowToOpen = gameWindows[gameId];
        if (windowToOpen) {
            windowToOpen.style.display = 'block';
            playSound(clickSound); // Suara saat membuka jendela
            // Set posisi awal di tengah layar (atau reset jika sudah digeser)
            windowToOpen.style.left = '50%';
            windowToOpen.style.top = '50%';
            windowToOpen.style.transform = 'translate(-50%, -50%)';
            windowToOpen.style.zIndex = '1001'; // Pastikan yang dibuka berada di atas

            // Inisialisasi game spesifik
            if (gameId === 'guess') initGuessGame();
            else if (gameId === 'rps') initRPSGame();
            else if (gameId === 'whacAMole') initWhacAMoleGame();
        }
    }

    // Event listener untuk tombol buka game
    openGuessGameBtn.addEventListener('click', () => openGameWindow('guess'));
    openRPSGameBtn.addEventListener('click', () => openGameWindow('rps'));
    openWhacAMoleBtn.addEventListener('click', () => openGameWindow('whacAMole'));

    // Event listener untuk tombol tutup game
    closeGameBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const gameId = event.currentTarget.dataset.gameId;
            if (gameWindows[gameId]) {
                gameWindows[gameId].style.display = 'none';
                playSound(clickSound); // Suara saat menutup jendela
                // Hentikan interval/timer game yang sedang berjalan jika game ditutup
                if (gameId === 'whacAMole') stopWhacAMoleGame();
            }
        });
    });

    // --- Draggable Window Logic (Unified & Corrected) ---
    // Iterasi melalui setiap objek jendela game
    Object.values(gameWindows).forEach(windowEl => {
        if (!windowEl) return; // Lewati jika elemen tidak ditemukan

        let isDragging = false;
        let offsetX, offsetY;
        const titleBar = windowEl.querySelector('.window-title-bar');

        if (titleBar) {
            // Saat mouse diklik pada title bar
            titleBar.addEventListener('mousedown', (e) => {
                isDragging = true;
                // Hitung offset dari pointer mouse ke sudut kiri atas jendela
                offsetX = e.clientX - windowEl.getBoundingClientRect().left;
                offsetY = e.clientY - windowEl.getBoundingClientRect().top;
                windowEl.style.cursor = 'grabbing'; // Ubah kursor
                windowEl.style.zIndex = '1002'; // Pastikan jendela yang sedang di-drag berada di paling atas
            });
        }

        // Saat mouse bergerak (pastikan dragging aktif)
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            // Set posisi jendela sesuai posisi mouse dikurangi offset
            windowEl.style.left = `${e.clientX - offsetX}px`;
            windowEl.style.top = `${e.clientY - offsetY}px`;
            windowEl.style.transform = 'none'; // Matikan transform bawaan (translate) agar posisi left/top bisa bekerja
        });

        // Saat mouse dilepas
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (windowEl) {
                    windowEl.style.cursor = 'grab'; // Kembalikan kursor
                    windowEl.style.zIndex = '1001'; // Kembalikan z-index default untuk game windows
                }
            }
        });
    });


    // --- Guess The Number Game Logic ---
    function initGuessGame() {
        secretNumber = Math.floor(Math.random() * 100) + 1; // Angka rahasia 1-100
        attempts = 0;
        guessGameResult.textContent = ''; // Bersihkan hasil sebelumnya
        guessGameResult.style.color = '#FF1493'; // Warna default pesan
        guessInput.value = ''; // Kosongkan input
        guessInput.disabled = false; // Aktifkan input
        checkGuessBtn.disabled = false; // Aktifkan tombol cek
        resetGuessGameBtn.style.display = 'none'; // Sembunyikan tombol reset
        guessInput.focus(); // Fokus ke input
        console.log("Secret number (Guess the Number):", secretNumber); // Untuk debugging, bisa dihapus nanti
    }

    function checkGuess() {
        const guess = parseInt(guessInput.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            guessGameResult.textContent = '⛔ Masukkan angka valid antara 1-100!';
            playSound(loseSound); // Suara error/kalah
            return;
        }

        attempts++;

        if (guess === secretNumber) {
            guessGameResult.textContent = `🎉 YAY! Betul! Angkanya ${secretNumber}. Kamu cuma butuh ${attempts} percobaan!`;
            guessGameResult.style.color = '#008000'; // Warna hijau untuk menang
            guessInput.disabled = true; // Nonaktifkan input dan tombol
            checkGuessBtn.disabled = true;
            resetGuessGameBtn.style.display = 'block'; // Tampilkan tombol reset
            playSound(winSound); // Suara menang
        } else if (guess < secretNumber) {
            guessGameResult.textContent = `⬆️ Lebih besar dari ${guess}. Coba lagi!`;
            playSound(loseSound); // Suara kalah
        } else {
            guessGameResult.textContent = `⬇️ Lebih kecil dari ${guess}. Coba lagi!`;
            playSound(loseSound); // Suara kalah
        }
        guessInput.value = ''; // Kosongkan input setelah tebakan
        guessInput.focus(); // Fokus kembali ke input
    }

    checkGuessBtn.addEventListener('click', checkGuess);
    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkGuess(); // Memungkinkan tebak dengan Enter
        }
    });
    resetGuessGameBtn.addEventListener('click', () => {
        initGuessGame();
        playSound(clickSound); // Suara klik saat reset
    });

    // --- Rock, Paper, Scissors Game Logic ---
    function initRPSGame() {
        playerScore = 0;
        computerScore = 0;
        updateRPSScore(); // Reset skor di UI
        rpsResult.textContent = 'Ayo main! Pilih gerakanmu.'; // Pesan awal
        rpsResult.style.color = '#FF1493'; // Warna default pesan
        resetRPSGameBtn.style.display = 'none'; // Sembunyikan tombol reset
        rpsButtons.forEach(btn => btn.disabled = false); // Aktifkan tombol pilihan
    }

    function playRPS(playerChoice) {
        playSound(clickSound); // Suara saat memilih
        const computerChoice = rpsChoices[Math.floor(Math.random() * rpsChoices.length)]; // Pilihan komputer acak
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
            playSound(winSound); // Suara menang
        } else {
            resultMessage = `Kamu kalah! Kamu ${playerChoice}, Komputer ${computerChoice}.`;
            computerScore++;
            playSound(loseSound); // Suara kalah
        }

        rpsResult.textContent = resultMessage;
        updateRPSScore(); // Perbarui skor di UI

        // Cek jika ada yang mencapai 3 poin
        if (playerScore === 3) {
            rpsResult.textContent = '🥳 SELAMAT! Kamu jadi juara! 🥳';
            rpsResult.style.color = '#008000'; // Warna hijau untuk menang
            endRPSGame();
            playSound(winSound);
        } else if (computerScore === 3) {
            rpsResult.textContent = '😭 GAME OVER! Komputer menang! 😭';
            rpsResult.style.color = '#FF4500'; // Warna merah untuk kalah
            endRPSGame();
            playSound(loseSound);
        }
    }

    function updateRPSScore() {
        playerScoreSpan.textContent = playerScore;
        computerScoreSpan.textContent = computerScore;
    }

    function endRPSGame() {
        rpsButtons.forEach(btn => btn.disabled = true); // Nonaktifkan tombol pilihan
        resetRPSGameBtn.style.display = 'block'; // Tampilkan tombol reset
    }

    rpsButtons.forEach(button => {
        button.addEventListener('click', (e) => playRPS(e.currentTarget.dataset.choice));
    });
    resetRPSGameBtn.addEventListener('click', () => {
        initRPSGame();
        playSound(clickSound); // Suara klik saat reset
    });

    // --- Whac-A-Mole Game Logic ---
    function initWhacAMoleGame() {
        wamCurrentScore = 0;
        wamTimeLeft = wamGameDuration;
        wamCurrentScoreSpan.textContent = wamCurrentScore; // Reset skor UI
        wamTimerSpan.textContent = wamTimeLeft; // Reset timer UI
        wamResult.textContent = 'Siap-siap pukul byte!'; // Pesan awal
        wamResult.style.color = '#FF1493'; // Warna default pesan
        resetWhacAMoleBtn.style.display = 'none'; // Sembunyikan tombol reset
        startWhacAMoleBtn.style.display = 'block'; // Tampilkan tombol mulai
        wamMoles.forEach(mole => {
            mole.classList.remove('active', 'hit'); // Hapus kelas aktif/hit
            mole.style.bottom = '-100%'; // Pastikan semua mole tersembunyi
            mole.textContent = ''; // Hapus emoji
        });
        stopWhacAMoleGame(); // Pastikan tidak ada interval yang berjalan dari sesi sebelumnya
    }

    function randomMole() {
        // Filter mole yang saat ini tidak aktif atau tidak sedang dalam animasi 'hit'
        const availableMoles = Array.from(wamMoles).filter(mole =>
            !mole.classList.contains('active') && !mole.classList.contains('hit')
        );

        if (availableMoles.length === 0) {
            return null; // Tidak ada mole yang tersedia untuk muncul
        }

        const randomIndex = Math.floor(Math.random() * availableMoles.length);
        const selectedMole = availableMoles[randomIndex];

        // Usahakan mole yang berbeda muncul berturut-turut jika memungkinkan
        if (selectedMole === lastMole && availableMoles.length > 1) {
            return randomMole(); // Panggil rekursif hingga dapat mole berbeda
        }
        lastMole = selectedMole;
        return selectedMole;
    }

    function popUpMole() {
        if (wamTimeLeft <= 0) { // Hentikan munculnya mole jika waktu habis
            stopWhacAMoleGame();
            return;
        }

        const mole = randomMole();
        if (!mole) return; // Jika tidak ada mole tersedia, berhenti

        mole.classList.add('active'); // Jadikan mole aktif (muncul)
        const emojis = ['🐛', '👾', '🦠', '🤖', '⚡']; // Emoji byte/virus
        mole.textContent = emojis[Math.floor(Math.random() * emojis.length)]; // Beri emoji acak
        playSound(popSound); // Suara pop

        // Mole akan menghilang otomatis jika tidak dipukul
        setTimeout(() => {
            if (mole.classList.contains('active')) { // Hanya sembunyikan jika masih aktif (belum dipukul)
                mole.classList.remove('active');
                mole.style.bottom = '-100%'; // Sembunyikan kembali
                mole.textContent = ''; // Hapus emoji
            }
        }, 800); // Mole muncul selama 0.8 detik
    }

    function startGameWAM() {
        wamCurrentScore = 0;
        wamTimeLeft = wamGameDuration;
        wamCurrentScoreSpan.textContent = wamCurrentScore;
        wamTimerSpan.textContent = wamTimeLeft;
        wamResult.textContent = 'GO!';
        startWhacAMoleBtn.style.display = 'none'; // Sembunyikan tombol mulai
        resetWhacAMoleBtn.style.display = 'none'; // Sembunyikan tombol reset

        stopWhacAMoleGame(); // Pastikan tidak ada interval lama

        // Mulai timer utama
        wamTimerId = setInterval(() => {
            wamTimeLeft--;
            wamTimerSpan.textContent = wamTimeLeft;

            if (wamTimeLeft <= 0) {
                stopWhacAMoleGame(); // Hentikan game
                wamResult.textContent = `🎮 Waktu habis! Skor akhirmu: ${wamCurrentScore}`;
                wamResult.style.color = (wamCurrentScore >= 5) ? '#008000' : '#FF4500'; // Warna pesan hasil
                resetWhacAMoleBtn.style.display = 'block'; // Tampilkan tombol reset
                playSound((wamCurrentScore >= 5) ? winSound : loseSound); // Suara hasil akhir
            }
        }, 1000); // Update setiap 1 detik

        // Mulai mole bermunculan
        wamMolePopInterval = setInterval(popUpMole, 1000); // Mole muncul setiap 1 detik
    }

    function stopWhacAMoleGame() {
        clearInterval(wamTimerId); // Hentikan timer
        clearInterval(wamMolePopInterval); // Hentikan munculnya mole
        wamTimerId = null;
        wamMolePopInterval = null;
        // Pastikan semua mole disembunyikan dan direset
        wamMoles.forEach(mole => {
            mole.classList.remove('active', 'hit');
            mole.style.bottom = '-100%';
            mole.textContent = '';
        });
    }

    wamMoles.forEach(mole => {
        mole.addEventListener('click', () => {
            // Hanya bisa dipukul jika aktif (muncul) dan game sedang berjalan
            if (mole.classList.contains('active') && wamTimerId !== null) {
                wamCurrentScore++;
                wamCurrentScoreSpan.textContent = wamCurrentScore;
                mole.classList.remove('active'); // Sembunyikan segera
                mole.classList.add('hit'); // Tambahkan kelas 'hit' untuk efek visual
                mole.textContent = '💥'; // Tampilkan efek 'hit'

                playSound(whackSound); // Suara pukul

                // Hapus kelas 'hit' dan sembunyikan mole setelah sedikit jeda
                setTimeout(() => {
                    mole.classList.remove('hit');
                    mole.textContent = ''; // Hapus emoji hit
                    mole.style.bottom = '-100%'; // Pastikan tersembunyi sepenuhnya
                }, 200);
            }
        });
    });

    startWhacAMoleBtn.addEventListener('click', () => {
        startGameWAM();
        playSound(clickSound); // Suara saat mulai game
    });
    resetWhacAMoleBtn.addEventListener('click', () => {
        initWhacAMoleGame();
        playSound(clickSound); // Suara klik saat reset
    });

    // --- Initializations (Panggil fungsi init untuk setiap game saat DOM selesai dimuat) ---
    initGuessGame();
    initRPSGame();
    initWhacAMoleGame();
});
