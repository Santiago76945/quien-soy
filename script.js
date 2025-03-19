// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Detectar el idioma del dispositivo (por defecto inglés si no es es, en o de)
  let currentLanguage = 'en';
  if (navigator.language) {
    let lang = navigator.language.substring(0, 2);
    if (['es', 'en', 'de'].includes(lang)) {
      currentLanguage = lang;
    } else {
      currentLanguage = 'en';
    }
  }
  // Actualizar el atributo lang del documento
  document.documentElement.lang = currentLanguage;
  
  // Actualizar el logo según el idioma
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.src = `logos/logo_${currentLanguage}.png`;
  }
  
  let indexTranslations = {};
  let indexTranslationsFull = {};

  let instructionsTranslations = {};
  let instructionsTranslationsFull = {};

  // Cargar el JSON de traducciones del index
  fetch('index_translations.json')
    .then(response => response.json())
    .then(json => {
      indexTranslationsFull = json;
      indexTranslations = json[currentLanguage];
      applyIndexTranslations(indexTranslations);
    })
    .catch(error => {
      console.error('Error loading index translations:', error);
    });

  // Cargar el JSON de traducciones de instrucciones
  fetch('instructions-translations.json')
    .then(response => response.json())
    .then(json => {
      instructionsTranslationsFull = json;
      instructionsTranslations = json[currentLanguage];
      // Si la pantalla de instrucciones está visible, actualizamos su contenido
      if (document.getElementById('instructionsScreen').style.display === 'block') {
        updateInstructionsContent();
      }
    })
    .catch(error => {
      console.error('Error loading instructions translations:', error);
    });

  // Reproducir el theme song en el menú principal
  const themeSongAudio = document.getElementById('themeSongAudio');
  if (themeSongAudio) {
    themeSongAudio.loop = true;
    themeSongAudio.play();
  }

  // Función para aplicar las traducciones en el index (elementos con data-i18n y data-i18n-alt)
  function applyIndexTranslations(trans) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (trans[key]) {
        el.textContent = trans[key];
      }
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (trans[key]) {
        el.setAttribute('alt', trans[key]);
      }
    });
    if (trans.title) {
      document.title = trans.title;
    }
  }

  // Función para actualizar el contenido de la pantalla de instrucciones usando el JSON de instrucciones
  function updateInstructionsContent() {
    const instructionsContainer = document.getElementById('instructionsContainer');
    if (instructionsTranslations && instructionsTranslations.instructions_html) {
      instructionsContainer.innerHTML = instructionsTranslations.instructions_html;
      // Reasignar el listener al botón de volver (ya que se inyectó nuevo HTML)
      document.getElementById('backToMenuBtn').addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainContainer.style.display = 'block';
        // Reanudar el theme song al volver al menú principal
        if (themeSongAudio) {
          themeSongAudio.play();
        }
      });
    }
  }

  // Configurar los botones del selector de idioma
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      if (selectedLang !== currentLanguage) {
        currentLanguage = selectedLang;
        document.documentElement.lang = currentLanguage;
        
        // Actualizar el logo al cambiar de idioma
        if (logo) {
          logo.src = `logos/logo_${currentLanguage}.png`;
        }
        
        if (indexTranslationsFull[currentLanguage]) {
          indexTranslations = indexTranslationsFull[currentLanguage];
          applyIndexTranslations(indexTranslations);
        }
        if (instructionsTranslationsFull[currentLanguage]) {
          instructionsTranslations = instructionsTranslationsFull[currentLanguage];
          // Si la pantalla de instrucciones está visible, actualizamos su contenido
          if (document.getElementById('instructionsScreen').style.display === 'block') {
            updateInstructionsContent();
          }
        }
      }
    });
  });

  // Botón para mostrar/ocultar el selector de idioma (dropdown)
  const chooseLanguageBtn = document.getElementById('chooseLanguageBtn');
  const languageSwitcher = document.getElementById('languageSwitcher');
  chooseLanguageBtn.addEventListener('click', () => {
    languageSwitcher.classList.toggle('active');
  });

  // Reproducir sonido al hacer clic en cada botón
  const buttonClickAudio = document.getElementById('buttonClickAudio');
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      if (buttonClickAudio) {
        buttonClickAudio.currentTime = 0;
        buttonClickAudio.play();
      }
    });
  });

  const mainContainer = document.getElementById('mainContainer');
  const newObjectBtn = document.getElementById('newObjectBtn');
  const difficultySelect = document.getElementById('difficulty');
  const messageDiv = document.getElementById('message');

  // Pantalla de la palabra
  const wordScreen = document.getElementById('wordScreen');
  const wordDisplay = document.getElementById('wordDisplay');
  const wordTimer = document.getElementById('wordTimer');
  const exitButton = document.getElementById('exitButton');

  // Pantalla de instrucciones
  const instructionsScreen = document.getElementById('instructionsScreen');
  const instructionsBtn = document.getElementById('instructionsBtn');

  let countdownInterval;    // Temporizador para el cronómetro de la palabra
  let preCountdownInterval; // Temporizador para la cuenta regresiva de 5 segundos

  // Botón para generar un nuevo objeto (comenzar a jugar)
  newObjectBtn.addEventListener('click', () => {
    // Detener el theme song al comenzar a jugar
    if (themeSongAudio) {
      themeSongAudio.pause();
      themeSongAudio.currentTime = 0;
    }
    
    const difficulty = difficultySelect.value;
    if (!difficulty) {
      alert(indexTranslations.select_option || 'Por favor, selecciona una dificultad.');
      return;
    }
    
    newObjectBtn.disabled = true;
    let countdown = 5;
    messageDiv.textContent = indexTranslations.word_announcement.replace('{seconds}', countdown);
    
    preCountdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        messageDiv.textContent = indexTranslations.word_announcement.replace('{seconds}', countdown);
      } else {
        clearInterval(preCountdownInterval);
        // Cargar el JSON correspondiente desde la carpeta "words"
        fetch(`words/${currentLanguage}_${difficulty}.json`)
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
    instructionsScreen.style.display = 'none';
    messageDiv.textContent = '';
    wordScreen.style.display = 'flex';
    wordDisplay.textContent = word;
    
    // Reproducir el audio del timer en bucle
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
        // Detener el audio del timer y reproducir el sonido de timeout
        const timerAudio = document.getElementById('timerAudio');
        timerAudio.pause();
        timerAudio.currentTime = 0;
        const timeoutAudio = document.getElementById('timeoutAudio');
        timeoutAudio.play();
        // Esperar 3 segundos y salir de la pantalla
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
  
  // Botón "Salir": cerrar la pantalla de la palabra y volver al menú principal
  exitButton.addEventListener('click', () => {
    exitWordScreen(false);
  });
  
  // Función para salir de la pantalla de la palabra
  function exitWordScreen(isTimeout) {
    const timerAudio = document.getElementById('timerAudio');
    timerAudio.pause();
    timerAudio.currentTime = 0;
    
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

    // Reanudar el theme song al volver al menú principal
    if (themeSongAudio) {
      themeSongAudio.play();
    }
  }
  
  // Mostrar instrucciones: oculta el menú principal, muestra la pantalla de instrucciones y detiene el theme song
  instructionsBtn.addEventListener('click', () => {
    mainContainer.style.display = 'none';
    wordScreen.style.display = 'none';
    instructionsScreen.style.display = 'block';
    updateInstructionsContent();
    if (themeSongAudio) {
      themeSongAudio.pause();
      themeSongAudio.currentTime = 0;
    }
  });
});
