const createStimulatorBtn = document.getElementById('create-stimulator');
const modal = document.getElementById('myModal');
const closeModal = document.getElementsByClassName('close')[0];
const saveStimulatorBtn = document.getElementById('save-stimulator');
const buttonList = document.getElementById('button-list');
const notificationList = document.getElementById('notification-list');
const addButton = document.getElementById('add-button');
const activateButton = document.getElementById('activate-button');
const activateTimer = document.getElementById('activate-timer');
const buttonSelection = document.getElementById('button-selection');
const timerInput = document.getElementById('timer-input');
const availableButtons = document.getElementById('available-buttons');
const timerValue = document.getElementById('timer-value');

let buttonCount = 0;
let stimulators = JSON.parse(localStorage.getItem('stimulators')) || [];
let buttons = JSON.parse(localStorage.getItem('buttons')) || [];
let currentStimulatorIndex = null;

createStimulatorBtn.onclick = function() {
    clearModal();
    modal.style.display = "block";
}

closeModal.onclick = function() {
    modal.style.display = "none";
    clearModal();
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
        clearModal();
    }
}

addButton.onclick = function() {
    if (buttonCount < 5) {
        const buttonId = buttons.length; // уникальный ID для кнопки
        const newButton = document.createElement('div');
        newButton.innerHTML = `
            <input type="text" placeholder="Название кнопки" data-id="${buttonId}" required>
            <button onclick="removeButton(this)">Удалить кнопку</button>
        `;
        buttonList.appendChild(newButton);
        
        // Сохраняем кнопку в массив buttons
        buttons.push({ id: buttonId, name: '' });
        
        buttonCount++;
    } else {
        alert('Можно добавить не более 5 кнопок.');
    }
}

activateButton.onchange = function() {
    buttonSelection.classList.toggle('hidden', !activateButton.checked);
    if (activateButton.checked) {
        displayAvailableButtons();
    } else {
        availableButtons.innerHTML = ''; // очищаем список кнопок
    }
}

activateTimer.onchange = function() {
    timerInput.classList.toggle('hidden', !activateTimer.checked);
}

saveStimulatorBtn.onclick = function() {
    const stimulatorName = document.getElementById('stimulator-name').value;
    const buttonsForStimulator = Array.from(buttonList.children).map(buttonDiv => {
        const input = buttonDiv.querySelector('input');
        const buttonId = input.dataset.id; // Получаем ID кнопки
        const buttonName = input.value; // Получаем имя кнопки

        // Обновляем имя кнопки в массиве buttons
        buttons[buttonId].name = buttonName; 

        return buttonId; // Возвращаем только ID кнопки
    });

    // Получаем массив активирующих кнопок
    const activationButtons = Array.from(availableButtons.querySelectorAll('input:checked')).map(input => {
        const buttonId = input.dataset.id; // Получаем ID кнопки
        return buttonId; // Возвращаем ID для сохранения
    });
    
    const activationTime = activateTimer.checked ? parseInt(timerValue.value) : null;

    const stimulator = {
        id: currentStimulatorIndex !== null ? stimulators[currentStimulatorIndex].id : stimulators.length, // Сохраняем ID
        name: stimulatorName,
        buttonIds: buttonsForStimulator, // Здесь сохраняем ID кнопок
        activationButtons: activationButtons, // Сохраняем ID активирующих кнопок
        activationTime: activationTime
    };

    if (currentStimulatorIndex !== null) {
        // Удаляем старый стимулятор
        stimulators.splice(currentStimulatorIndex, 1);
    }

    // Добавляем новый стимулятор с тем же ID
    stimulators.splice(currentStimulatorIndex !== null ? currentStimulatorIndex : stimulators.length, 0, stimulator); 

    localStorage.setItem('stimulators', JSON.stringify(stimulators));
    localStorage.setItem('buttons', JSON.stringify(buttons));
    displayStimulators();
    modal.style.display = "none";
    clearModal();
}


function removeButton(button) {
    button.parentElement.remove();
    buttonCount--;
}

function clearModal() {
    document.getElementById('stimulator-name').value = '';
    buttonList.innerHTML = '';
    buttonCount = 0;
    currentStimulatorIndex = null;
    document.getElementById('modal-title').textContent = "Создание стимулятора";
    activateButton.checked = false;
    activateTimer.checked = false;
    buttonSelection.classList.add('hidden');
    timerInput.classList.add('hidden');
    timerValue.value = '';
    availableButtons.innerHTML = ''; // очищаем список кнопок
}

function editStimulator(index) {
    const stimulator = stimulators[index];
    document.getElementById('stimulator-name').value = stimulator.name;
    buttonList.innerHTML = '';
    buttonCount = 0;

    stimulator.buttonIds.forEach(buttonId => {
        const button = buttons[buttonId];
        const newButton = document.createElement('div');
        newButton.innerHTML = `
            <input type="text" placeholder="Название кнопки" value="${button.name}" data-id="${buttonId}" required>
            <button onclick="removeButton(this)">Удалить кнопку</button>
        `;
        buttonList.appendChild(newButton);
        buttonCount++;
    });

    activateButton.checked = stimulator.activationButtons.length > 0;
    activateTimer.checked = stimulator.activationTime !== null;

    if (activateButton.checked) {
        buttonSelection.classList.remove('hidden');
        displayAvailableButtons(true, stimulator.activationButtons);
    } else {
        buttonSelection.classList.add('hidden');
    }

    if (activateTimer.checked) {
        timerInput.classList.remove('hidden');
        timerValue.value = stimulator.activationTime || '';
    } else {
        timerInput.classList.add('hidden');
    }

    currentStimulatorIndex = index;
    document.getElementById('modal-title').textContent = "Редактирование стимулятора";
    modal.style.display = "block"; 
}

function deleteStimulator(index) {
    stimulators.splice(index, 1);
    localStorage.setItem('stimulators', JSON.stringify(stimulators));
    displayStimulators();
}

function displayAvailableButtons(includeChecked = false, checkedButtonIds = []) {
    availableButtons.innerHTML = '';
    buttons.forEach(button => {
        const isButtonInCurrentStimulator = currentStimulatorIndex !== null && stimulators[currentStimulatorIndex].activationButtons.includes(button.id);
        if (!isButtonInCurrentStimulator) {
            const buttonDiv = document.createElement('div');
            buttonDiv.innerHTML = `
                <label>
                    <input type="checkbox" data-id="${button.id}" ${includeChecked && checkedButtonIds.includes(button.id) ? 'checked' : ''}>
                    ${button.name}
                </label>
            `;
            availableButtons.appendChild(buttonDiv);
        }
    });
}

displayStimulators();

function displayStimulators() {
    const stimulatorList = document.getElementById('notification-list');
    stimulatorList.innerHTML = '';

    if (stimulators.length === 0) {
        stimulatorList.innerHTML = '<p>Нет доступных стимуляторов.</p>';
        return; 
    }

    stimulators.forEach((stimulator, index) => {
        const stimulatorDiv = document.createElement('div');
        stimulatorDiv.classList.add('stimulator');

        let activationInfo = '<strong>Способы активации:</strong><br>';
        let canStart = false;

        if (stimulator.activationTime) {
            activationInfo += `Таймер: ${stimulator.activationTime} сек.<br>`;
            canStart = stimulator.activationButtons.length === 0; 
        }

        if (stimulator.activationButtons && stimulator.activationButtons.length > 0) {
            const buttonIds = stimulator.activationButtons.join(', ');
            activationInfo += `Кнопки: ${buttonIds}<br>`;
        } else {
            activationInfo += 'Кнопки не указаны.<br>';
        }

        if (!stimulator.activationTime && (!stimulator.activationButtons || stimulator.activationButtons.length === 0)) {
            activationInfo += 'Не указаны способы активации.';
        }

        stimulatorDiv.innerHTML = `
            <span class="stimulator-title">ID: ${stimulator.id} — ${stimulator.name}</span>
            <span class="stimulator-activation">${activationInfo}</span>
            <div>
                <button onclick="editStimulator(${index})">Редактировать</button>
                <button onclick="deleteStimulator(${index})">Удалить</button>
                ${canStart ? `<button onclick="startNotification(${index})">Запустить</button>` : ''}
            </div>
        `;

        stimulatorList.appendChild(stimulatorDiv);
    });
}
