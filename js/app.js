import { state, setItems, resetGameExcluded, getActiveItems } from './core/state.js';
import { runSeries } from './core/series.js';
import { drawWheel, spinToItem } from './ui/wheel.js';
import { audio } from './services/audio.js';
import { getSelectionProbabilities } from './core/engine.js';
import { showExcludePrompt } from './ui/modal.js';

const rangeMin = document.getElementById('rangeMin');
const rangeMax = document.getElementById('rangeMax');
const excludeInput = document.getElementById('excludeInput');
const namesInput = document.getElementById('namesInput');
const resetExcludeBtn = document.getElementById('resetExclude');
const resetAllBtn = document.getElementById('resetAll');
const startBtn = document.getElementById('startSpin');
const spinsRange = document.getElementById('spinsRange');
const spinsValue = document.getElementById('spinsValue');
const biasEnabled = document.getElementById('biasEnabled');
const biasTargetID = document.getElementById('biasTargetID');
const soundToggle = document.getElementById('soundToggle');
const historyList = document.getElementById('historyList');
const probabilityBlock = document.getElementById('probabilityBlock');
const modeRadios = document.querySelectorAll('input[name="inputMode"]');
const rangeInputs = document.getElementById('rangeInputs');
const namesInputs = document.getElementById('namesInputs');
const openImportModal = document.getElementById('openImportModal');
const importModal = document.getElementById('importModal');
const listFileInput = document.getElementById('listFileInput');
const selectedFileName = document.getElementById('selectedFileName');
const applyImport = document.getElementById('applyImport');
const cancelImport = document.getElementById('cancelImport');
const importError = document.getElementById('importError');

let nameMap = {};
let debounce;

function buildItems() {
    const mode = document.querySelector('input[name="inputMode"]:checked').value;

    if (mode === 'range') {
        let min = parseInt(rangeMin.value) || 1;
        let max = parseInt(rangeMax.value) || 10;

        min = Math.max(1, Math.min(67, min));
        max = Math.max(1, Math.min(67, max));

        if (min > max) {
            [min, max] = [max, min];
        }

        rangeMin.value = min;
        rangeMax.value = max;

        const excludeSet = new Set(parseNumberList(excludeInput.value));
        const items = [];

        for (let i = min; i <= max; i++) {
            if (!excludeSet.has(i)) {
                items.push({ id: i });
            }
        }

        setItems(items);
        nameMap = {};
    } else {
        setNamedItems(parseInlineNames(namesInput.value));
    }

    resetGameExcluded();
    drawWheel();
    updateProbability();
}

function setNamedItems(names) {
    nameMap = {};

    const items = names.map((name, idx) => {
        const id = idx + 1;
        nameMap[id] = name;

        return {
            id,
            label: name
        };
    });

    setItems(items);
}

function parseNumberList(raw) {
    return [...new Set(raw
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n >= 1 && n <= 67))];
}

function parseInlineNames(raw) {
    return uniqueNames(raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean));
}

function updateProbability() {
    if (!probabilityBlock) return;
    const probabilities = getSelectionProbabilities();
    if (!probabilities.length) {
        probabilityBlock.textContent = 'Нет секторов для расчёта';
        return;
    }
    const target = state.settings.biasEnabled
        ? probabilities.find(item => item.id === state.settings.biasTarget)
        : null;
    if (target && probabilities.length > 1) {
        const other = probabilities.find(item => item.id !== target.id);
        probabilityBlock.textContent =
            `Режим неравных вероятностей: сектор ${target.id} — ${(target.probability * 100).toFixed(2)}%; каждый другой — ${(other.probability * 100).toFixed(2)}%.`;
    } else {
        probabilityBlock.textContent =
            `Вероятность выпадения любого сектора: ${(probabilities[0].probability * 100).toFixed(2)}%`;
    }
}

modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        rangeInputs.style.display =
            radio.value === 'range' ? 'block' : 'none';

        namesInputs.style.display =
            radio.value === 'names' ? 'block' : 'none';

        buildItems();
    });
});

[rangeMin, rangeMax, excludeInput, namesInput].forEach(el => {
    el.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(buildItems, 300);
    });
});

resetExcludeBtn.addEventListener('click', () => {
    excludeInput.value = '';
    buildItems();
});

resetAllBtn.addEventListener('click', () => {
    rangeMin.value = 1;
    rangeMax.value = 10;
    excludeInput.value = '';
    namesInput.value = '';

    document.querySelector(
        'input[name="inputMode"][value="range"]'
    ).checked = true;

    rangeInputs.style.display = 'block';
    namesInputs.style.display = 'none';

    buildItems();
});

spinsRange.addEventListener('input', () => {
    state.settings.spinsPerSeries = parseInt(spinsRange.value);
    spinsValue.textContent = spinsRange.value;
});

spinsValue.textContent = spinsRange.value;
state.settings.spinsPerSeries = parseInt(spinsRange.value);

biasEnabled.addEventListener('change', () => {
    state.settings.biasEnabled = biasEnabled.checked;
    biasTargetID.disabled = !biasEnabled.checked;

    if (!biasEnabled.checked) {
        biasTargetID.value = '';
        state.settings.biasTarget = null;
    }
    updateProbability();
});

biasTargetID.addEventListener('input', () => {
    const val = parseInt(biasTargetID.value);
    state.settings.biasTarget = isNaN(val) ? null : val;
    updateProbability();
});

soundToggle.addEventListener('change', () => {
    audio.setEnabled(soundToggle.checked);
});

document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.settings.speed = btn.dataset.speed;

        document
            .querySelectorAll('.speed-btn')
            .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');
    });
});

function openListImport() {
    importError.classList.add('hidden');
    importError.textContent = '';
    listFileInput.value = '';
    selectedFileName.textContent = 'Файл не выбран';
    importModal.classList.remove('hidden');
}

function closeListImport() {
    importModal.classList.add('hidden');
}

openImportModal.addEventListener('click', openListImport);
cancelImport.addEventListener('click', closeListImport);

listFileInput.addEventListener('change', () => {
    const file = listFileInput.files[0];

    selectedFileName.textContent = file ? file.name : 'Файл не выбран';
    importError.classList.add('hidden');
    importError.textContent = '';
});

importModal.addEventListener('click', (e) => {
    if (e.target === importModal) {
        closeListImport();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !importModal.classList.contains('hidden')) {
        closeListImport();
    }
});

applyImport.addEventListener('click', async () => {
    const file = listFileInput.files[0];

    if (!file) {
        showImportError('Выберите файл со списком.');
        return;
    }

    try {
        const text = await file.text();
        const names = parseListFile(text, file.name);

        if (!names.length) {
            throw new Error('В файле не найдено ни одного имени.');
        }

        namesInput.value = names.join(', ');

        document.querySelector(
            'input[name="inputMode"][value="names"]'
        ).checked = true;

        rangeInputs.style.display = 'none';
        namesInputs.style.display = 'block';

        setNamedItems(names);
        resetGameExcluded();
        drawWheel();
        updateProbability();
        closeListImport();
    } catch (e) {
        showImportError(e.message);
    }
});

function parseListFile(text, fileName) {
    const cleanText = text.replace(/^\uFEFF/, '').trim();

    if (!cleanText) {
        throw new Error('Файл пустой. Добавьте имена по одному на строку.');
    }

    const lowerName = fileName.toLowerCase();
    const looksJson = cleanText.startsWith('[') || cleanText.startsWith('{');
    const isJson = lowerName.endsWith('.json') || looksJson;

    if (isJson) {
        return normalizeImportedList(JSON.parse(cleanText));
    }

    return uniqueNames(cleanText
        .split(/[\r\n,;]+/)
        .map(cleanName)
        .filter(Boolean));
}

function normalizeImportedList(data) {
    const list = Array.isArray(data) ? data : data.items;

    if (!Array.isArray(list)) {
        throw new Error('JSON должен быть массивом или объектом с полем items.');
    }

    return uniqueNames(list
        .map((item) => {
            if (typeof item === 'string') {
                return cleanName(item);
            }

            if (item && typeof item === 'object') {
                return cleanName(String(item.label || item.name || ''));
            }

            return '';
        })
        .filter(Boolean));
}

function cleanName(value) {
    return value
        .replace(/^\uFEFF/, '')
        .trim()
        .replace(/^["'«]+|["'»]+$/g, '')
        .trim();
}

function showImportError(message) {
    importError.textContent = message;
    importError.classList.remove('hidden');
}

async function handleStart() {
    const activeCount = getActiveItems().length;

    if (!activeCount) {
        alert('Нет доступных секторов');
        return;
    }

    const spinsCount = Math.min(state.settings.spinsPerSeries, activeCount);

    startBtn.disabled = true;

    try {
        const results = await runSeries(
            (item) => {
                audio.play('spin');
                return spinToItem(item);
            },
            spinsCount
        );

        drawWheel();
        audio.play('win');

        const ids = results.map(r => r.id);
        const confirmed = await new Promise(resolve =>
            showExcludePrompt(ids, resolve)
        );

        if (!confirmed) {
            ids.forEach(id => {
                state.gameExcluded.delete(id);
            });
        }

        drawWheel();
        addHistory(results);
        updateProbability();
    } catch (e) {
        alert(e.message);
    } finally {
        startBtn.disabled = false;
    }
}

startBtn.addEventListener('click', handleStart);

function addHistory(results) {
    historyList
        .querySelectorAll('.history-empty')
        .forEach((item) => item.remove());

    const li = document.createElement('li');
    li.className = 'history-entry';

    const itemsStr = results
        .map(r => {
            const label = nameMap[r.id] || '';
            return label ? `${r.id} - ${label}` : `${r.id}`;
        })
        .join(', ');

    li.textContent = itemsStr;
    historyList.prepend(li);

    if (historyList.children.length > 20) {
        historyList.removeChild(historyList.lastChild);
    }
}

function init() {
    audio.init();
    buildItems();
    updateHistoryEmptyState();
}

document.addEventListener('DOMContentLoaded', init);

function uniqueNames(names) {
    const seen = new Set();

    return names.filter((name) => {
        const key = name.toLowerCase();

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function updateHistoryEmptyState() {
    if (historyList.children.length) return;

    const li = document.createElement('li');
    li.className = 'history-empty';
    li.textContent = 'Пока нет результатов';
    historyList.appendChild(li);
}
