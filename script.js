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
    
    let countdownInterval; // Para guardar el intervalo del temporizador
    
    // Botón para generar un nuevo objeto
    newObjectBtn.addEventListener('click', () => {
      const difficulty = difficultySelect.value;
      if (!difficulty) {
        alert('Por favor, selecciona una dificultad.');
        return;
      }
      
      // Limpiar mensajes previos
      messageDiv.textContent = 'Por el teléfono en tu cabeza la palabra aparecerá en 5 segundos!';
      newObjectBtn.disabled = true;
      
      // Esperar 5 segundos antes de mostrar el objeto
      setTimeout(() => {
        fetch(`${difficulty}.json`)
          .then(response => response.json())
          .then(data => {
            // Elegir aleatoriamente una palabra del JSON
            const randomIndex = Math.floor(Math.random() * data.length);
            const selectedWord = data[randomIndex];
            
            // Mostrar la pantalla completa con la palabra
            showWordScreen(selectedWord);
          })
          .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
            messageDiv.textContent = 'Error al cargar las palabras.';
            newObjectBtn.disabled = false;
          });
      }, 5000);
    });
    
    // Muestra la pantalla con la palabra y el timer
    function showWordScreen(word) {
      // Ocultamos la vista principal y limpiamos el mensaje
      mainContainer.style.display = 'none';
      messageDiv.textContent = '';
      
      // Mostramos la pantalla de la palabra
      wordScreen.style.display = 'flex';
      
      // Asignamos la palabra
      wordDisplay.textContent = word;
      
      // Iniciamos el temporizador de 2 minutos (120 seg)
      startTimer(120);
    }
    
    // Iniciar temporizador
    function startTimer(duration) {
      let time = duration;
      updateTimerDisplay(time);
      
      countdownInterval = setInterval(() => {
        time--;
        updateTimerDisplay(time);
        
        if (time <= 0) {
          clearInterval(countdownInterval);
          // Al terminar el tiempo, salir automáticamente
          exitWordScreen();
        }
      }, 1000);
    }
    
    // Actualizar la vista del temporizador
    function updateTimerDisplay(time) {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      wordTimer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // Botón "Salir": Cerrar la pantalla de la palabra y volver a la principal
    exitButton.addEventListener('click', () => {
      exitWordScreen();
    });
    
    function exitWordScreen() {
      // Detener el temporizador
      clearInterval(countdownInterval);
      
      // Regresar a la pantalla principal
      wordScreen.style.display = 'none';
      mainContainer.style.display = 'block';
      
      // Resetear
      wordDisplay.textContent = '';
      wordTimer.textContent = '';
      newObjectBtn.disabled = false;
    }
  });
  