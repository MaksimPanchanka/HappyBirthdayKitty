let gameData = {
    config: null,
    scenes: [],
    currentScene: null
};

// Элементы интерфейса
const elements = {
    container: document.getElementById('novel-container'),
    bg: document.getElementById('novel-bg'),
    charLayer: document.getElementById('char-image'),
    avatar: document.getElementById('char-avatar'),
    name: document.getElementById('char-name'),
    text: document.getElementById('dialog-text'),
    arrow: document.querySelector('.next-arrow'),
    dialogBox: document.querySelector('.dialog-box'),
    choices: document.getElementById('choices-container')
};

// 1. Загрузка данных
async function initGame() {
    try {
        const configRes = await fetch('data/config.json');
        gameData.config = await configRes.json();

        const scenesRes = await fetch('data/scenes.json');
        gameData.scenes = await scenesRes.json();

        // Начинаем со сцены, указанной в конфиге или с id 0
        renderScene(gameData.config.game_settings.start_node || 0);
    } catch (err) {
        console.error("Ошибка загрузки игры:", err);
    }
}

// 2. Отрисовка сцены
function renderScene(sceneId) {
    const scene = gameData.scenes.find(s => s.id === sceneId);
    if (!scene) return;
    
    gameData.currentScene = scene;

    // Смена фона
    const bgPath = gameData.config.assets.bg_path + scene.background;
    console.log(bgPath)
    elements.bg.style.backgroundImage = `url('${bgPath}')`;

    // Работа с персонажем
    if (scene.character) {
        elements.charLayer.style.display = "block";
        elements.charLayer.src = gameData.config.assets.char_path + scene.character.image;
        
        // Маленький аватар в колонке
        elements.avatar.src = gameData.config.assets.avatar_path + scene.character.avatar;
        elements.name.innerText = scene.character.name;
        
        // Позиционирование (left/right)
        elements.charLayer.className = scene.character.position === 'left' ? 'char-left' : 'char-right';
    } else {
        // Если персонажа нет (описание действий)
        elements.charLayer.style.display = "none";
        elements.avatar.src = ""; // Можно поставить пустую заглушку
        elements.name.innerText = "";
    }

    // Текст
    elements.text.innerHTML = scene.text;

    // Обработка выборов
    handleChoices(scene);
}

// 3. Логика выборов
function handleChoices(scene) {
    // Очищаем только содержимое контейнера для кнопок
    elements.choices.innerHTML = "";

    if (scene.choices && scene.choices.length > 0) {
        elements.arrow.style.display = "none"; 

        scene.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = choice.text;
            
            btn.onclick = (e) => {
                e.stopPropagation(); 
                renderScene(choice.next);
            };
            
            // ВАЖНО: Добавляем кнопку ВНУТРЬ контейнера choices, а не в dialogBox
            elements.choices.appendChild(btn);
        });
    } else {
        elements.arrow.style.display = "block";
    }
}

// Клик по окну для перехода (если нет выбора)
elements.dialogBox.addEventListener('click', () => {
    if (gameData.currentScene && gameData.currentScene.next !== null) {
        renderScene(gameData.currentScene.next);
    } else if (gameData.currentScene && gameData.currentScene.next === null && !gameData.currentScene.choices) {
        alert("Конец истории. Спасибо за игру!");
    }
});

initGame();