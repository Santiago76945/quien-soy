// script.js

document.addEventListener('DOMContentLoaded', () => {
  const mainContainer = document.getElementById('mainContainer');
  const newObjectBtn = document.getElementById('newObjectBtn');
  const difficultySelect = document.getElementById('difficulty');
  const messageDiv = document.getElementById('message');
  
  // Pantalla de la palabra
  const wordScreen = document.getElementById('wordScreen');
  const wordDisplay = document.getElementById('wordDisplay');
  const wordTimer = document.getElementById('wordTimer');
  const exitButton = document.getElementById('exitButton');
  
  let countdownInterval;    // Temporizador para el cronómetro de la palabra
  let preCountdownInterval; // Temporizador para la cuenta regresiva de 5 segundos
  
  // Botón para generar un nuevo objeto
  newObjectBtn.addEventListener('click', () => {
    const difficulty = difficultySelect.value;
    if (!difficulty) {
      alert('Por favor, selecciona una dificultad.');
      return;
    }
    
    newObjectBtn.disabled = true;
    let countdown = 5;
    messageDiv.textContent = `Por el teléfono en tu cabeza la palabra aparecerá en ${countdown} segundos!`;
    
    preCountdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        messageDiv.textContent = `Por el teléfono en tu cabeza la palabra aparecerá en ${countdown} segundos!`;
      } else {
        clearInterval(preCountdownInterval);
        fetch(`${difficulty}.json`)
          .then(response => response.json())
          .then(data => {
            const randomIndex = Math.floor(Math.random() * data.length);
            const selectedWord = data[randomIndex];
            showWordScreen(selectedWord);
          })
          .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
            messageDiv.textContent = 'Error al cargar las palabras.';
            newObjectBtn.disabled = false;
          });
      }
    }, 1000);
  });
  
  // Muestra la pantalla con la palabra, el timer y reproduce el sonido del timer
  function showWordScreen(word) {
    mainContainer.style.display = 'none';
    messageDiv.textContent = '';
    wordScreen.style.display = 'flex';
    wordDisplay.textContent = word;
    
    // Reproduce el audio del timer en bucle
    const timerAudio = document.getElementById('timerAudio');
    timerAudio.play();
    
    // Inicia el temporizador de 2 minutos (120 segundos)
    startTimer(120);
  }
  
  // Inicia el temporizador de 2 minutos
  function startTimer(duration) {
    let time = duration;
    updateTimerDisplay(time);
    
    countdownInterval = setInterval(() => {
      time--;
      updateTimerDisplay(time);
      
      if (time <= 0) {
        clearInterval(countdownInterval);
        // Al llegar a cero, detener el audio del timer...
        const timerAudio = document.getElementById('timerAudio');
        timerAudio.pause();
        timerAudio.currentTime = 0;
        // ...y reproducir el sonido de timeout.
        const timeoutAudio = document.getElementById('timeoutAudio');
        timeoutAudio.play();
        // Espera 3 segundos para que se escuche el sonido de timeout, luego salir
        setTimeout(() => {
          exitWordScreen(true);
        }, 3000);
      }
    }, 1000);
  }
  
  // Actualiza la visualización del cronómetro
  function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    wordTimer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  // Botón "Salir": cierra la pantalla de la palabra y vuelve a la principal
  exitButton.addEventListener('click', () => {
    exitWordScreen(false);
  });
  
  // Función para salir de la pantalla de la palabra
  // Si isTimeout es true, significa que se invocó por el tiempo agotado.
  function exitWordScreen(isTimeout) {
    const timerAudio = document.getElementById('timerAudio');
    timerAudio.pause();
    timerAudio.currentTime = 0;
    
    // Si se sale manualmente (no por timeout), detenemos también el audio de timeout.
    if (!isTimeout) {
      const timeoutAudio = document.getElementById('timeoutAudio');
      timeoutAudio.pause();
      timeoutAudio.currentTime = 0;
    }
    
    clearInterval(countdownInterval);
    clearInterval(preCountdownInterval);
    
    wordScreen.style.display = 'none';
    mainContainer.style.display = 'block';
    
    wordDisplay.textContent = '';
    wordTimer.textContent = '';
    newObjectBtn.disabled = false;
  }
});
