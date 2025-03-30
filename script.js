document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('startBtn');
    const statusText = document.getElementById('status');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const alarmSound = document.getElementById('alarmSound');
    const pauseSound = document.getElementById('pauseSound');

    // Tempos padrão (em minutos)
    let settings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };

    // Estado do timer
    let timer = null;
    let timeLeft = settings.pomodoro * 60;
    let isRunning = false;
    let currentMode = 'pomodoro';

    // Inicializa o timer
    updateDisplay();

    // Event Listeners
    startBtn.addEventListener('click', toggleTimer);
    settingsBtn.addEventListener('click', openSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Botões de modo
    document.querySelectorAll('.timer-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });

    // Funções
    function toggleTimer() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        if (timer) clearInterval(timer);
        
        isRunning = true;
        startBtn.textContent = 'Pausar';
        statusText.textContent = `${getModeName(currentMode)} em andamento...`;
        
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft <= 0) {
                finishTimer();
            }
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = 'Continuar';
        statusText.textContent = `${getModeName(currentMode)} pausado`;
        pauseSound.play();
    }

    function finishTimer() {
        clearInterval(timer);
        isRunning = false;
        alarmSound.play();
        
        // Alternar para o próximo modo
        if (currentMode === 'pomodoro') {
            // Verifica se é hora de uma pausa longa (a cada 4 pomodoros)
            const pomodoroCount = localStorage.getItem('pomodoroCount') || 0;
            if (pomodoroCount >= 3) {
                switchMode('long-break');
                localStorage.setItem('pomodoroCount', 0);
            } else {
                switchMode('short-break');
                localStorage.setItem('pomodoroCount', parseInt(pomodoroCount) + 1);
            }
        } else {
            switchMode('pomodoro');
        }
        
        startBtn.textContent = 'Começar';
    }

    function switchMode(mode) {
        currentMode = mode;
        
        // Atualiza botões ativos
        document.querySelectorAll('.timer-tabs button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) btn.classList.add('active');
        });
        
        // Atualiza tempo e display
        timeLeft = settings[mode === 'pomodoro' ? 'pomodoro' : mode === 'short-break' ? 'shortBreak' : 'longBreak'] * 60;
        
        // Atualiza cor do botão
        document.documentElement.style.setProperty('--pomodoro', 
            mode === 'pomodoro' ? '#e74c3c' : 
            mode === 'short-break' ? '#2ecc71' : '#3498db');
        
        updateDisplay();
        statusText.textContent = `Pronto para ${getModeName(mode)}`;
        
        // Se estiver rodando, reinicia
        if (isRunning) {
            startTimer();
        }
    }

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function openSettings() {
        if (isRunning) pauseTimer();
        document.getElementById('pomodoroTime').value = settings.pomodoro;
        document.getElementById('shortBreakTime').value = settings.shortBreak;
        document.getElementById('longBreakTime').value = settings.longBreak;
        settingsModal.style.display = 'flex';
    }

    function saveSettings() {
        settings.pomodoro = parseInt(document.getElementById('pomodoroTime').value);
        settings.shortBreak = parseInt(document.getElementById('shortBreakTime').value);
        settings.longBreak = parseInt(document.getElementById('longBreakTime').value);
        
        // Atualiza o tempo se não estiver rodando
        if (!isRunning) {
            timeLeft = settings[currentMode === 'pomodoro' ? 'pomodoro' : currentMode === 'short-break' ? 'shortBreak' : 'longBreak'] * 60;
            updateDisplay();
        }
        
        settingsModal.style.display = 'none';
    }

    function getModeName(mode) {
        return {
            'pomodoro': 'Pomodoro',
            'short-break': 'Pausa Curta',
            'long-break': 'Pausa Longa'
        }[mode];
    }

    // Fechar modal ao clicar fora
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
});


