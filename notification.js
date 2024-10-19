function startNotification(stimulatorIndex) {
    const stimulator = stimulators[stimulatorIndex];

    // Обрабатываем запуск, независимо от наличия таймера
    console.log(`Запуск стимулятора: ${stimulator.name}`);

    // Если у стимулятора есть таймер, запускаем его
    if (stimulator.activationTime) {
        let timeRemaining = stimulator.activationTime;
        console.log(`Запуск таймера на ${timeRemaining} секунд для стимулятора: ${stimulator.name}`);

        // Запуск таймера
        const countdown = setInterval(() => {
            timeRemaining--;
            console.log(`Осталось времени: ${timeRemaining} секунд`);

            if (timeRemaining <= 0) {
                clearInterval(countdown);
                // Таймер завершен, воспроизводим звук и открываем новое окно
                playNotificationSound();
                push_user()
                openNotificationWindow(stimulator);
            }
        }, 1000);

        // Сохраняем ссылку на таймер, чтобы можно было сбросить его позже
        stimulator.countdown = countdown;
    } else {
        // Если таймера нет, сразу воспроизводим звук и открываем окно
        playNotificationSound();
        openNotificationWindow(stimulator);
    }
}

function push_user() {
            window.electronAPI.pushUser(); // Отправка сообщения в главный процесс
        }

function playNotificationSound() {
    // Генерируем случайное число для выбора звука
    const randomSound = Math.random() < 0.5 ? '01.wav' : '02.mp3';
    
    // Создаем элемент audio и воспроизводим звук
    const audio = new Audio(randomSound);
    audio.play().catch(error => {
        console.error('Ошибка при воспроизведении звука:', error);
    });
}

function openNotificationWindow(stimulator) {
    const notificationWindow = window.open('', '_blank', 'width=400,height=400');
    notificationWindow.focus(); // Попробуйте сделать окно активным

    console.log('Активирующие кнопки:', stimulator.buttonIds); // Лог для проверки кнопок

    const stimulatorButtons = stimulator.buttonIds.map(buttonId => {
        const buttonIdNumber = Number(buttonId);
        const button = buttons.find(b => b.id === buttonIdNumber);
        return button ? button.name : `Кнопка с ID ${buttonId} не найдена`;
    });

    notificationWindow.document.write(`
        <html>
        <head>
            <title>Уведомление: ${stimulator.name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #1e1e1e;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                }
                .button {
                    background-color: #d4af37;
                    color: #1e1e1e;
                    border: none;
                    padding: 10px 20px;
                    font-size: 1rem;
                    cursor: pointer;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>${stimulator.name}</h1>
            <div id="buttons-section">
                ${stimulatorButtons.map((buttonName, index) => 
                    `<button class="button" onclick="handleButtonClick(${stimulator.buttonIds[index]})">${buttonName}</button>`
                ).join('<br>')}
            </div>
            <script>
                function handleButtonClick(buttonId) {
                    console.log('Нажата кнопка с ID:', buttonId);

                    if (window.opener) {
                        window.opener.handleButtonPress(buttonId);
                    }

                    window.close(); 
                }
            </script>
        </body>
        </html>
    `);
}



function handleButtonPress(buttonId) {
    console.log('Получен ID кнопки от дочернего окна:', buttonId); // Для отладки

    // Преобразуем ID в строку для сравнения
    const buttonIdString = String(buttonId);

    // Ищем стимуляторы, которые активируются данной кнопкой
    const matchingStimulators = stimulators.filter(stimulator =>
        stimulator.activationButtons.includes(buttonIdString) // Преобразуем ID в строку для сравнения
    );

    if (matchingStimulators.length > 0) {
        matchingStimulators.forEach(stimulatorToStart => {
            console.log('Стимулятор найден, запускаем новое окно:', stimulatorToStart); // Для отладки
            startNotification(stimulatorToStart.id); // Запускаем стимулятор
        });
    } else {
        console.error(`Стимулятор для кнопки с ID ${buttonId} не найден. Доступные стимуляторы:`, stimulators);
    }
}

