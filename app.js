let tasks = [];
let categories = ['急件', '工作', '生活', '學習', '健康'];
let selectedFilterCategory = 'ALL';

/* ================= 各大區塊獨立收折與單獨顯示狀態 ================= */
let sectionCollapsed = {
    pomo: false,
    wellness: false,
    creator: false,
    pending: false,
    completed: false
};
let soloSection = null;
let preSoloSnapshot = null;

let currentTheme = 'theme-muji';
let currentOpacity = 1.0;
let isDraggingOpacity = false;
let restoreHoverTimer = null;

let mediaBaseUrl = '';
const mediaDataCache = {};
let isDataInitialized = false;

let currentMediaPath = "";
let isCollapsed = false;
let typewriterTimer = null;

let addTimeMode = 'countdown';
let editTimeMode = 'none';
let editingTaskId = null;

let pomoMode = 'work';
let pomoRunning = false;
let pomoTotalSec = 25 * 60;
let pomoRemainSec = 25 * 60;
let pomoInterval = null;

/* ================= 三合一健康提醒狀態 ================= */
let wellnessState = {
    water: { enabled: false, intervalMin: 30, remainSec: 30 * 60, prefix: 'W', label: '💧 補充水分' },
    eyes:  { enabled: false, intervalMin: 30, remainSec: 30 * 60, prefix: 'E', label: '👀 眼睛休息' },
    move:  { enabled: false, intervalMin: 30, remainSec: 30 * 60, prefix: 'K', label: '🏃 起來活動' }
};

function getCategoryStyle(catName) {
    const theme = document.body.className || currentTheme;
    const palette = themeCategoryPalettes[theme] || themeCategoryPalettes['theme-muji'];
    let idx = categories.indexOf(catName);
    if (idx < 0) {
        let hash = 0;
        for (let i = 0; i < (catName || '').length; i++) {
            hash = catName.charCodeAt(i) + ((hash << 5) - hash);
        }
        idx = Math.abs(hash);
    }
    return palette[idx % palette.length];
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function resolveMediaUrl(mediaPath) {
    if (!mediaPath) return '';
    if (mediaPath.startsWith('media/') || mediaPath.startsWith('presets/')) {
        return mediaBaseUrl ? (mediaBaseUrl + mediaPath) : mediaPath;
    }
    if (/^[a-zA-Z]:\//.test(mediaPath)) {
        return 'file:///' + encodeURI(mediaPath);
    }
    if (mediaPath.startsWith('/')) {
        return 'file://' + encodeURI(mediaPath);
    }
    return mediaPath;
}

async function loadMediaSrc(mediaPath) {
    if (!mediaPath) return '';
    if (mediaDataCache[mediaPath]) return mediaDataCache[mediaPath];

    if (window.pywebview && window.pywebview.api && window.pywebview.api.get_media_data) {
        try {
            const dataUrl = await pywebview.api.get_media_data(mediaPath);
            if (dataUrl) {
                mediaDataCache[mediaPath] = dataUrl;
                return dataUrl;
            }
        } catch (err) {
            console.error('loadMediaSrc error:', err);
        }
    }
    return '';
}

function isVideoMedia(mediaPath) {
    if (!mediaPath) return false;
    const lower = mediaPath.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm');
}

function toDatetimeLocalStr(timestamp) {
    const d = new Date(timestamp);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDeadlineBadge(timestamp) {
    const d = new Date(timestamp);
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRemainTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
}

/* ================= 區塊收折與單獨顯示 UI 同步 ================= */
function syncSectionFoldUI() {
    // 1. 番茄鐘
    const pomoCard = document.getElementById('section-pomo');
    if (pomoCard) {
        pomoCard.classList.toggle('is-collapsed-card', sectionCollapsed.pomo);
        document.getElementById('fold-arrow-pomo').innerText = sectionCollapsed.pomo ? '▸' : '▾';
        document.getElementById('mini-pomo-badge').classList.toggle('hidden', !sectionCollapsed.pomo);
    }

    // 2. 健康三合一提醒
    const wellCard = document.getElementById('section-wellness');
    if (wellCard) {
        wellCard.classList.toggle('is-collapsed-card', sectionCollapsed.wellness);
        document.getElementById('fold-arrow-wellness').innerText = sectionCollapsed.wellness ? '▸' : '▾';
        document.getElementById('mini-wellness-badge').classList.toggle('hidden', !sectionCollapsed.wellness);
    }

    // 3. 新增與篩選列
    const creatorSec = document.getElementById('section-creator');
    if (creatorSec) {
        creatorSec.classList.toggle('is-collapsed-card', sectionCollapsed.creator);
        document.getElementById('fold-arrow-creator').innerText = sectionCollapsed.creator ? '▸' : '▾';
        document.getElementById('creator-collapsed-hint').classList.toggle('hidden', !sectionCollapsed.creator);
    }

    // 4. 未完成事項
    const pendingList = document.getElementById('pending-list');
    if (pendingList) {
        pendingList.classList.toggle('hidden', sectionCollapsed.pending);
        document.getElementById('fold-arrow-pending').innerText = sectionCollapsed.pending ? '▸' : '▾';
    }

    // 5. 已完成事項
    const completedList = document.getElementById('completed-list');
    if (completedList) {
        completedList.classList.toggle('hidden', sectionCollapsed.completed);
        document.getElementById('fold-arrow-completed').innerText = sectionCollapsed.completed ? '▸' : '▾';
    }

    // 6. 單獨顯示模式：直接隱藏其他非目標區塊
    const sectionDomMap = {
        pomo: document.getElementById('section-pomo'),
        wellness: document.getElementById('section-wellness'),
        creator: document.getElementById('section-creator'),
        pending: document.getElementById('section-pending'),
        completed: document.getElementById('section-completed')
    };

    document.body.classList.toggle('has-solo-mode', Boolean(soloSection));

    Object.keys(sectionDomMap).forEach(key => {
        const el = sectionDomMap[key];
        if (!el) return;
        if (soloSection) {
            const keepCreatorForEmptyPending =
                (soloSection === 'pending' && key === 'creator' && tasks.filter(t => !t.completed).length === 0);
            const shouldHide = (key !== soloSection) && !keepCreatorForEmptyPending;
            el.classList.toggle('solo-hidden-section', shouldHide);
        } else {
            el.classList.remove('solo-hidden-section');
        }
    });

    // 7. 更新各區塊「單獨 / 全部」按鈕文字與高亮狀態
    ['pomo', 'wellness', 'pending', 'completed'].forEach(key => {
        const btn = document.getElementById(`solo-btn-${key}`);
        if (!btn) return;
        const isActive = soloSection === key;
        btn.classList.toggle('is-solo-active', isActive);
        if (key === 'pending' || key === 'completed') {
            btn.innerText = isActive ? '👁 顯示全部' : '👁 單獨顯示';
        } else {
            btn.innerText = isActive ? '👁 全部' : '👁 單獨';
        }
    });
}

function toggleSectionFold(key) {
    if (!(key in sectionCollapsed)) return;
    sectionCollapsed[key] = !sectionCollapsed[key];
    syncSectionFoldUI();
    persistAppState();
}

function toggleSoloSection(targetKey) {
    if (soloSection === targetKey) {
        if (preSoloSnapshot) {
            Object.assign(sectionCollapsed, preSoloSnapshot);
        }
        soloSection = null;
        preSoloSnapshot = null;
    } else {
        preSoloSnapshot = Object.assign({}, sectionCollapsed);
        sectionCollapsed[targetKey] = false;
        if (targetKey === 'pending' && tasks.filter(t => !t.completed).length === 0) {
            sectionCollapsed.creator = false;
        }
        soloSection = targetKey;
    }
    syncSectionFoldUI();
    persistAppState();
}

document.addEventListener('click', (e) => {
    const soloBtn = e.target.closest('.solo-view-btn');
    if (soloBtn && !soloBtn.getAttribute('onclick')) {
        e.stopPropagation();
        const key = soloBtn.id.replace('solo-btn-', '');
        toggleSoloSection(key);
    }
});

/* ================= 視窗實際透明度同步邏輯（穩定防閃爍版） ================= */
function syncEffectiveOpacity() {
    if (!window.pywebview || !window.pywebview.api) return;
    const alarmOpen = !document.getElementById('alarm-modal').classList.contains('hidden');
    const previewOpen = !document.getElementById('media-preview-modal').classList.contains('hidden');

    if (alarmOpen || previewOpen) {
        pywebview.api.set_opacity(1.0);
    } else {
        pywebview.api.set_opacity(currentOpacity);
    }
}

function persistAppState() {
    if (!isDataInitialized || !window.pywebview || !window.pywebview.api) return;
    const payload = {
        version: 5,
        theme: currentTheme,
        opacity: currentOpacity,
        categories: categories,
        sectionCollapsed: sectionCollapsed,
        pomo: {
            workMin: parseInt(document.getElementById('pomo-work-min').value) || 0,
            workSec: parseInt(document.getElementById('pomo-work-sec').value) || 0,
            breakMin: parseInt(document.getElementById('pomo-break-min').value) || 0,
            breakSec: parseInt(document.getElementById('pomo-break-sec').value) || 0
        },
        wellness: {
            water: { enabled: wellnessState.water.enabled, intervalMin: wellnessState.water.intervalMin },
            eyes:  { enabled: wellnessState.eyes.enabled,  intervalMin: wellnessState.eyes.intervalMin },
            move:  { enabled: wellnessState.move.enabled,  intervalMin: wellnessState.move.intervalMin }
        },
        tasks: tasks
    };
    pywebview.api.save_tasks(payload);
}

async function refreshWellnessLibraryStatus() {
    if (!window.pywebview || !window.pywebview.api || !window.pywebview.api.get_wellness_library_status) return;
    try {
        const st = await pywebview.api.get_wellness_library_status();
        const countEl = document.getElementById('wellness-lib-count');
        const pathEl = document.getElementById('wellness-lib-path');
        if (countEl) {
            countEl.innerText = `圖庫：💧喝水 ${st.W}張 ｜ 👀護眼 ${st.E}張 ｜ 🏃活動 ${st.K}張`;
        }
        if (pathEl) {
            pathEl.innerText = `存放位置：${st.presetsDir}`;
        }
    } catch (e) {
        console.error('refreshWellnessLibraryStatus error:', e);
    }
}

async function initApp() {
    if (isDataInitialized) return;
    try {
        mediaBaseUrl = await pywebview.api.get_media_base_url();
        const savedState = await pywebview.api.load_tasks();

        if (Array.isArray(savedState)) {
            tasks = savedState;
        } else if (savedState && typeof savedState === 'object') {
            tasks = Array.isArray(savedState.tasks) ? savedState.tasks : [];
            if (Array.isArray(savedState.categories) && savedState.categories.length > 0) {
                categories = savedState.categories;
            }
            if (savedState.sectionCollapsed && typeof savedState.sectionCollapsed === 'object') {
                Object.keys(sectionCollapsed).forEach(k => {
                    if (typeof savedState.sectionCollapsed[k] === 'boolean') {
                        sectionCollapsed[k] = savedState.sectionCollapsed[k];
                    }
                });
            }
            if (savedState.theme && themeConfigs[savedState.theme]) {
                currentTheme = savedState.theme;
            }
            if (typeof savedState.opacity === 'number') {
                currentOpacity = Math.max(0.3, Math.min(1.0, savedState.opacity));
            }
            if (savedState.pomo) {
                document.getElementById('pomo-work-min').value = savedState.pomo.workMin ?? 25;
                document.getElementById('pomo-work-sec').value = savedState.pomo.workSec ?? 0;
                document.getElementById('pomo-break-min').value = savedState.pomo.breakMin ?? 5;
                document.getElementById('pomo-break-sec').value = savedState.pomo.breakSec ?? 0;
            }
            if (savedState.wellness) {
                ['water', 'eyes', 'move'].forEach(key => {
                    if (savedState.wellness[key]) {
                        const mins = Math.max(1, parseInt(savedState.wellness[key].intervalMin) || 30);
                        wellnessState[key].intervalMin = mins;
                        wellnessState[key].enabled = Boolean(savedState.wellness[key].enabled);
                        wellnessState[key].remainSec = mins * 60;
                        document.getElementById(`well-min-${key}`).value = mins;
                    }
                });
            }
        }

        tasks.forEach(t => {
            if (!t.category) t.category = categories[0] || '生活';
        });

        opacitySlider.value = currentOpacity;
        document.getElementById('opacity-val').innerText = Math.round(currentOpacity * 100) + '%';
        syncEffectiveOpacity();

        currentThemeLabel.innerText = themeNames[currentTheme] || '無印極簡';
        document.getElementById('deadline-input').value = toDatetimeLocalStr(Date.now() + 3600 * 1000);

        pomoTotalSec = getConfiguredPomoSeconds();
        pomoRemainSec = pomoTotalSec;

        await refreshWellnessLibraryStatus();

        isDataInitialized = true;
        syncSectionFoldUI();
        applyTheme(currentTheme, false);
    } catch (err) {
        console.error('Init error:', err);
    }
}

if (window.pywebview && window.pywebview.api) {
    initApp();
} else {
    window.addEventListener('pywebviewready', initApp);
}

function applyTheme(theme, shouldSave = true) {
    currentTheme = theme;
    document.body.className = theme;
    if (soloSection) {
        document.body.classList.add('has-solo-mode');
    }
    const cfg = themeConfigs[theme] || themeConfigs['theme-muji'];
    document.getElementById('header-title').innerText = cfg.title;
    document.getElementById('theme-badge-icon').innerHTML = cfg.svg;
    document.getElementById('task-input').placeholder = cfg.placeholder;
    document.getElementById('add-btn').innerText = cfg.addText;
    document.getElementById('media-btn').innerText = cfg.mediaText;
    renderCategoryUI();
    updatePomoDisplay();
    updateWellnessUI();
    updateDockProgress();
    renderTasks();
    if (shouldSave) persistAppState();
}

/* ================= 💧👀🏃 三合一健康提醒控制與計時邏輯 ================= */
function updateWellnessUI() {
    const theme = currentTheme || 'theme-muji';
    const wTheme = wellnessThemeCopy[theme] || wellnessThemeCopy['theme-muji'];
    document.getElementById('wellness-header-label').innerText = wTheme.headerLabel;

    const iconMap = { water: '💧', eyes: '👀', move: '🏃' };
    let activeBadges = [];

    ['water', 'eyes', 'move'].forEach(key => {
        const item = wellnessState[key];
        const pill = document.getElementById(`well-pill-${key}`);
        const timerEl = document.getElementById(`well-timer-${key}`);
        pill.classList.toggle('active', item.enabled);
        if (item.enabled) {
            const tStr = formatRemainTime(item.remainSec);
            timerEl.innerText = tStr;
            activeBadges.push(`${iconMap[key]}${tStr}`);
        } else {
            timerEl.innerText = `OFF (${item.intervalMin}m)`;
        }
    });

    const miniBadge = document.getElementById('mini-wellness-badge');
    if (miniBadge) {
        miniBadge.innerText = activeBadges.length > 0 ? activeBadges.join(' ') : 'OFF';
    }
}

function toggleWellnessItem(key) {
    const item = wellnessState[key];
    if (!item) return;
    const inputMins = Math.max(1, parseInt(document.getElementById(`well-min-${key}`).value) || 30);
    item.intervalMin = inputMins;
    item.enabled = !item.enabled;
    item.remainSec = item.intervalMin * 60;
    updateWellnessUI();
    updateDockProgress();
    persistAppState();
}

document.getElementById('wellness-setting-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    if (sectionCollapsed.wellness) {
        sectionCollapsed.wellness = false;
        syncSectionFoldUI();
        persistAppState();
    }
    const panel = document.getElementById('wellness-settings');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        refreshWellnessLibraryStatus();
    }
});

document.getElementById('wellness-import-btn').addEventListener('click', async () => {
    if (!window.pywebview || !window.pywebview.api || !window.pywebview.api.import_wellness_images) return;
    const st = await pywebview.api.import_wellness_images();
    const countEl = document.getElementById('wellness-lib-count');
    if (countEl) {
        countEl.innerText = `已匯入 ${st.imported} 張！目前：💧${st.W}張 ｜ 👀${st.E}張 ｜ 🏃${st.K}張`;
    }
});

document.getElementById('wellness-apply-btn').addEventListener('click', () => {
    ['water', 'eyes', 'move'].forEach(key => {
        const mins = Math.max(1, parseInt(document.getElementById(`well-min-${key}`).value) || 30);
        document.getElementById(`well-min-${key}`).value = mins;
        wellnessState[key].intervalMin = mins;
        wellnessState[key].remainSec = mins * 60;
    });
    updateWellnessUI();
    updateDockProgress();
    persistAppState();
    document.getElementById('wellness-settings').classList.add('hidden');
});

document.getElementById('wellness-enable-all-btn').addEventListener('click', () => {
    ['water', 'eyes', 'move'].forEach(key => {
        const mins = Math.max(1, parseInt(document.getElementById(`well-min-${key}`).value) || 30);
        document.getElementById(`well-min-${key}`).value = mins;
        wellnessState[key].intervalMin = mins;
        wellnessState[key].enabled = true;
        wellnessState[key].remainSec = mins * 60;
    });
    updateWellnessUI();
    updateDockProgress();
    persistAppState();
});

async function pickRandomWellnessMedia(type) {
    const item = wellnessState[type];
    if (!item) return '';
    if (window.pywebview && window.pywebview.api && window.pywebview.api.get_random_wellness_media) {
        try {
            const picked = await pywebview.api.get_random_wellness_media(item.prefix);
            if (picked) return picked;
        } catch (e) {
            console.error('pickRandomWellnessMedia error:', e);
        }
    }
    return '';
}

async function triggerWellnessAlarm(type) {
    const mediaPath = await pickRandomWellnessMedia(type);
    const labels = { water: '喝水提醒', eyes: '護眼提醒', move: '活動提醒' };
    triggerAlarm({
        text: wellnessState[type] ? wellnessState[type].label : '健康提醒',
        category: labels[type] || '健康',
        media: mediaPath,
        wellnessType: type
    });
}

setInterval(() => {
    if (!isDataInitialized) return;
    let anyEnabled = false;
    ['water', 'eyes', 'move'].forEach(key => {
        const item = wellnessState[key];
        if (item.enabled) {
            anyEnabled = true;
            if (item.remainSec > 1) {
                item.remainSec--;
            } else {
                item.remainSec = item.intervalMin * 60;
                triggerWellnessAlarm(key);
            }
        }
    });
    if (anyEnabled) {
        updateWellnessUI();
        updateDockProgress();
    }
}, 1000);

/* ================= 分類選擇器、篩選列與自訂分類管理 ================= */
function renderCategoryUI() {
    const addSelect = document.getElementById('task-category-select');
    const editSelect = document.getElementById('edit-task-category');
    const filterBar = document.getElementById('category-filter-bar');

    const prevAddVal = addSelect.value;
    addSelect.innerHTML = '';
    editSelect.innerHTML = '';

    categories.forEach(cat => {
        const opt1 = document.createElement('option');
        opt1.value = cat;
        opt1.innerText = `# ${cat}`;
        addSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = cat;
        opt2.innerText = `# ${cat}`;
        editSelect.appendChild(opt2);
    });

    if (prevAddVal && categories.includes(prevAddVal)) {
        addSelect.value = prevAddVal;
    }

    filterBar.innerHTML = '';

    const allChip = document.createElement('span');
    allChip.className = 'cat-chip' + (selectedFilterCategory === 'ALL' ? ' active' : '');
    allChip.innerText = `全部 (${tasks.length})`;
    allChip.onclick = () => {
        selectedFilterCategory = 'ALL';
        renderCategoryUI();
        renderTasks();
    };
    filterBar.appendChild(allChip);

    categories.forEach(cat => {
        const style = getCategoryStyle(cat);
        const count = tasks.filter(t => t.category === cat).length;
        const chip = document.createElement('span');
        chip.className = 'cat-chip' + (selectedFilterCategory === cat ? ' active' : '');
        chip.innerHTML = `<span class="cat-dot" style="background:${style.bg};"></span>${escapeHtml(cat)} (${count})`;
        chip.onclick = () => {
            selectedFilterCategory = (selectedFilterCategory === cat) ? 'ALL' : cat;
            renderCategoryUI();
            renderTasks();
        };
        filterBar.appendChild(chip);
    });

    const addCatBtn = document.createElement('span');
    addCatBtn.className = 'cat-chip add-cat-chip';
    addCatBtn.innerText = '＋分類';
    addCatBtn.title = '建立或管理分類';
    addCatBtn.onclick = openCategoryModal;
    filterBar.appendChild(addCatBtn);
}

function openCategoryModal() {
    renderCategoryManageList();
    document.getElementById('new-cat-name').value = '';
    document.getElementById('cat-modal').classList.remove('hidden');
}

function renderCategoryManageList() {
    const listEl = document.getElementById('cat-manage-list');
    listEl.innerHTML = '';
    categories.forEach((cat, idx) => {
        const style = getCategoryStyle(cat);
        const tag = document.createElement('span');
        tag.className = 'cat-manage-item';
        tag.innerHTML = `<span class="cat-dot" style="background:${style.bg};"></span>${escapeHtml(cat)}`;
        if (categories.length > 1) {
            const delSpan = document.createElement('span');
            delSpan.className = 'cat-del-x';
            delSpan.innerText = '✕';
            delSpan.title = '刪除此分類';
            delSpan.onclick = () => {
                categories.splice(idx, 1);
                if (selectedFilterCategory === cat) selectedFilterCategory = 'ALL';
                persistAppState();
                renderCategoryManageList();
                renderCategoryUI();
                renderTasks();
            };
            tag.appendChild(delSpan);
        }
        listEl.appendChild(tag);
    });
}

document.getElementById('save-cat-btn').addEventListener('click', () => {
    const input = document.getElementById('new-cat-name');
    const name = input.value.trim();
    if (!name) return;
    if (!categories.includes(name)) {
        categories.push(name);
        persistAppState();
    }
    document.getElementById('task-category-select').value = name;
    input.value = '';
    renderCategoryManageList();
    renderCategoryUI();
    renderTasks();
});

document.getElementById('close-cat-modal-btn').addEventListener('click', () => {
    document.getElementById('cat-modal').classList.add('hidden');
});

// 自訂風格選單
const themeTrigger = document.getElementById('theme-trigger');
const themeMenu = document.getElementById('theme-menu');
const currentThemeLabel = document.getElementById('current-theme-label');

themeTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('hidden');
});

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedTheme = item.getAttribute('data-value');
        currentThemeLabel.innerText = item.innerText;
        themeMenu.classList.add('hidden');
        applyTheme(selectedTheme, true);
    });
});

document.addEventListener('click', () => {
    themeMenu.classList.add('hidden');
});

/* ================= 透明度滑桿事件 ================= */
const opacitySlider = document.getElementById('opacity-slider');

opacitySlider.addEventListener('pointerdown', () => {
    isDraggingOpacity = true;
    clearTimeout(restoreHoverTimer);
    pywebview.api.set_opacity(currentOpacity);
});

opacitySlider.addEventListener('input', (e) => {
    isDraggingOpacity = true;
    clearTimeout(restoreHoverTimer);
    currentOpacity = parseFloat(e.target.value);
    document.getElementById('opacity-val').innerText = Math.round(currentOpacity * 100) + '%';
    pywebview.api.set_opacity(currentOpacity);
});

function finishOpacityDrag() {
    if (!isDraggingOpacity) return;
    isDraggingOpacity = false;
    persistAppState();
    clearTimeout(restoreHoverTimer);
    restoreHoverTimer = setTimeout(() => {
        syncEffectiveOpacity();
    }, 150);
}

window.addEventListener('pointerup', finishOpacityDrag);
opacitySlider.addEventListener('change', finishOpacityDrag);

document.getElementById('dock-btn').addEventListener('click', () => {
    const content = document.getElementById('main-content');
    const dockPanel = document.getElementById('dock-progress-wrapper');
    isCollapsed = !isCollapsed;

    if (isCollapsed) {
        content.classList.add('hidden');
        dockPanel.classList.remove('hidden');
        document.getElementById('dock-btn').innerText = '▴';
        updateDockProgress();
    } else {
        content.classList.remove('hidden');
        dockPanel.classList.add('hidden');
        document.getElementById('dock-btn').innerText = '▾';
    }
    pywebview.api.set_collapsed(isCollapsed);
});
document.getElementById('min-btn').addEventListener('click', () => pywebview.api.minimize_window());
document.getElementById('close-btn').addEventListener('click', () => {
    persistAppState();
    pywebview.api.close_window();
});

// 切換新增時間模式
function switchAddTimeMode(mode) {
    addTimeMode = mode;
    document.getElementById('add-mode-countdown').classList.toggle('active', mode === 'countdown');
    document.getElementById('add-mode-deadline').classList.toggle('active', mode === 'deadline');

    if (mode === 'countdown') {
        document.getElementById('add-countdown-box').classList.remove('hidden');
        document.getElementById('deadline-input').classList.add('hidden');
    } else {
        document.getElementById('add-countdown-box').classList.add('hidden');
        document.getElementById('deadline-input').classList.remove('hidden');
        if (!document.getElementById('deadline-input').value) {
            document.getElementById('deadline-input').value = toDatetimeLocalStr(Date.now() + 3600 * 1000);
        }
    }
}

// 切換編輯時間模式
function switchEditTimeMode(mode) {
    editTimeMode = mode;
    document.getElementById('edit-mode-none').classList.toggle('active', mode === 'none');
    document.getElementById('edit-mode-countdown').classList.toggle('active', mode === 'countdown');
    document.getElementById('edit-mode-deadline').classList.toggle('active', mode === 'deadline');

    document.getElementById('edit-countdown-box').classList.toggle('hidden', mode !== 'countdown');
    document.getElementById('edit-deadline-input').classList.toggle('hidden', mode !== 'deadline');
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    document.getElementById('edit-task-text').value = task.text;

    const editCatSel = document.getElementById('edit-task-category');
    if (task.category && !categories.includes(task.category)) {
        const tempOpt = document.createElement('option');
        tempOpt.value = task.category;
        tempOpt.innerText = `# ${task.category}`;
        editCatSel.appendChild(tempOpt);
    }
    editCatSel.value = task.category || categories[0];

    if (task.timeType === 'deadline' && task.endTime) {
        switchEditTimeMode('deadline');
        document.getElementById('edit-deadline-input').value = toDatetimeLocalStr(task.endTime);
    } else if (task.endTime && !task.completed) {
        switchEditTimeMode('countdown');
        const remainSec = Math.max(0, Math.ceil((task.endTime - Date.now()) / 1000));
        document.getElementById('edit-min-input').value = Math.floor(remainSec / 60);
        document.getElementById('edit-sec-input').value = remainSec % 60;
    } else {
        switchEditTimeMode('none');
        document.getElementById('edit-min-input').value = '';
        document.getElementById('edit-sec-input').value = '';
        document.getElementById('edit-deadline-input').value = toDatetimeLocalStr(Date.now() + 3600 * 1000);
    }

    document.getElementById('edit-modal').classList.remove('hidden');
}

document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('edit-modal').classList.add('hidden');
    editingTaskId = null;
});

document.getElementById('save-edit-btn').addEventListener('click', () => {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const newText = document.getElementById('edit-task-text').value.trim();
    if (!newText) return;
    task.text = newText;
    task.category = document.getElementById('edit-task-category').value || categories[0];

    if (editTimeMode === 'none') {
        task.timeType = 'none';
        task.endTime = null;
        task.durationSec = 0;
        task.alerted = false;
    } else if (editTimeMode === 'countdown') {
        const mins = parseInt(document.getElementById('edit-min-input').value) || 0;
        const secs = parseInt(document.getElementById('edit-sec-input').value) || 0;
        const totalSec = mins * 60 + secs;
        if (totalSec > 0) {
            task.timeType = 'countdown';
            task.durationSec = totalSec;
            task.endTime = Date.now() + totalSec * 1000;
            task.alerted = false;
        } else {
            task.timeType = 'none';
            task.endTime = null;
            task.durationSec = 0;
        }
    } else if (editTimeMode === 'deadline') {
        const dlVal = document.getElementById('edit-deadline-input').value;
        if (dlVal) {
            const targetMs = new Date(dlVal).getTime();
            const totalSec = Math.max(1, Math.ceil((targetMs - Date.now()) / 1000));
            task.timeType = 'deadline';
            task.endTime = targetMs;
            task.durationSec = totalSec;
            task.alerted = Date.now() >= targetMs;
        }
    }

    document.getElementById('edit-modal').classList.add('hidden');
    editingTaskId = null;
    saveAndRender();
});

/* ================= 附件圖片 / 影片預覽彈窗 ================= */
async function openMediaPreview(id) {
    const task = tasks.find(t => t.id === id);
    if (!task || !task.media) return;

    const modal = document.getElementById('media-preview-modal');
    const captionEl = document.getElementById('preview-task-caption');
    const container = document.getElementById('preview-media-container');

    const catTag = task.category ? `[${task.category}] ` : '';
    captionEl.innerText = `${catTag}${task.text}`;
    container.innerHTML = `<div style="font-size:12px; opacity:0.75;">載入附件中...</div>`;

    modal.classList.remove('hidden');
    syncEffectiveOpacity();

    const resolvedSrc = await loadMediaSrc(task.media);
    if (!resolvedSrc) {
        container.innerHTML = `<div style="font-size:12px; color:#FF3B30;">找不到附件檔案（可能已被移動或刪除）</div>`;
        return;
    }

    if (isVideoMedia(task.media)) {
        container.innerHTML = `<video src="${resolvedSrc}" autoplay loop controls></video>`;
    } else {
        container.innerHTML = `<img src="${resolvedSrc}" alt="任務附件預覽">`;
    }
}

function closeMediaPreview() {
    document.getElementById('media-preview-modal').classList.add('hidden');
    document.getElementById('preview-media-container').innerHTML = '';
    syncEffectiveOpacity();
}

document.getElementById('close-preview-btn').addEventListener('click', closeMediaPreview);
document.getElementById('media-preview-modal').addEventListener('click', (e) => {
    if (e.target.id === 'media-preview-modal') {
        closeMediaPreview();
    }
});

// 智能讀取條
function updateDockProgress() {
    const fillEl = document.getElementById('dock-fill');
    const statusEl = document.getElementById('dock-status-text');
    const labelEl = document.getElementById('dock-task-name');
    const theme = currentTheme || 'theme-muji';
    const cfg = themeConfigs[theme] || themeConfigs['theme-muji'];

    let candidates = [];

    tasks.forEach(t => {
        if (t.endTime && !t.completed && !t.alerted) {
            const remainSec = Math.max(0, Math.ceil((t.endTime - Date.now()) / 1000));
            const totalSec = t.durationSec || Math.max(remainSec, 60);
            const catTag = t.category ? `[${t.category}] ` : '';
            const prefix = t.timeType === 'deadline' ? `📅 ${catTag}` : `⏰ ${catTag}`;
            candidates.push({
                type: 'task',
                label: `${prefix}${t.text}`,
                remainSec: remainSec,
                totalSec: totalSec
            });
        }
    });

    if (pomoRunning) {
        candidates.push({
            type: 'pomo',
            label: pomoMode === 'work' ? '🍅 番茄鐘專注中' : '☕ 番茄鐘休息中',
            remainSec: pomoRemainSec,
            totalSec: pomoTotalSec
        });
    }

    ['water', 'eyes', 'move'].forEach(key => {
        const w = wellnessState[key];
        if (w.enabled) {
            candidates.push({
                type: 'wellness',
                label: `${w.label}提醒`,
                remainSec: w.remainSec,
                totalSec: w.intervalMin * 60
            });
        }
    });

    if (candidates.length > 0) {
        candidates.sort((a, b) => a.remainSec - b.remainSec);
        const urgent = candidates[0];

        const pct = Math.max(3, Math.min(100, (urgent.remainSec / urgent.totalSec) * 100));
        fillEl.classList.remove('idle-anim');
        fillEl.style.width = pct + '%';

        if (urgent.remainSec <= 10) {
            fillEl.classList.add('urgent-warn');
            statusEl.classList.add('urgent-text');
        } else {
            fillEl.classList.remove('urgent-warn');
            statusEl.classList.remove('urgent-text');
        }

        labelEl.innerText = urgent.label;
        statusEl.innerText = `剩 ${formatRemainTime(urgent.remainSec)}`;
        return;
    }

    fillEl.classList.remove('urgent-warn');
    statusEl.classList.remove('urgent-text');
    const nextPending = getSortedPendingTasks(tasks)[0];
    if (nextPending) {
        fillEl.classList.add('idle-anim');
        fillEl.style.width = '100%';
        const catTag = nextPending.category ? `[${nextPending.category}] ` : '';
        labelEl.innerText = `📌 ${catTag}${nextPending.text}`;
        statusEl.innerText = '進行中';
        return;
    }

    fillEl.classList.add('idle-anim');
    fillEl.style.width = '100%';
    labelEl.innerText = cfg.idleLabel;
    statusEl.innerText = cfg.idleStatus;
}

// 番茄鐘
function updatePomoDisplay() {
    const m = Math.floor(pomoRemainSec / 60).toString().padStart(2, '0');
    const s = (pomoRemainSec % 60).toString().padStart(2, '0');
    const timeStr = `${m}:${s}`;
    document.getElementById('pomo-timer-display').innerText = timeStr;
    const miniPomo = document.getElementById('mini-pomo-badge');
    if (miniPomo) {
        miniPomo.innerText = pomoRunning ? `▶ ${timeStr}` : timeStr;
    }
    
    const theme = currentTheme || 'theme-muji';
    if (theme === 'theme-naruto') {
        document.getElementById('pomo-mode-label').innerText = 
            pomoMode === 'work' ? '🔥 查克拉修煉 (專注)' : '🍜 一樂拉麵補給 (休息)';
    } else if (theme === 'theme-gba') {
        document.getElementById('pomo-mode-label').innerText = 
            pomoMode === 'work' ? '⚔️ BATTLE TRAINING' : '💖 POKÉMON CENTER';
    } else if (theme === 'theme-digimon') {
        document.getElementById('pomo-mode-label').innerText = 
            pomoMode === 'work' ? '⚡ DIGI-CHARGE' : '🔋 SLEEP MODE';
    } else if (theme === 'theme-mermaid') {
        document.getElementById('pomo-mode-label').innerText = 
            pomoMode === 'work' ? '🎤 閃亮練唱時間 (專注)' : '🫧 海洋泡泡浴 (休息)';
    } else if (theme === 'theme-tamagotchi') {
        document.getElementById('pomo-mode-label').innerText = 
            pomoMode === 'work' ? '📖 STUDY GAME (專注)' : '🍰 SNACK TIME (休息)';
    } else {
        document.getElementById('pomo-mode-label').innerText = 
            pomoMode === 'work' ? '○ 專注時間 (FOCUS)' : '□ 休息時間 (BREAK)';
    }
    updateDockProgress();
}

document.getElementById('pomo-setting-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    if (sectionCollapsed.pomo) {
        sectionCollapsed.pomo = false;
        syncSectionFoldUI();
        persistAppState();
    }
    document.getElementById('pomo-settings').classList.toggle('hidden');
});

document.getElementById('pomo-apply-btn').addEventListener('click', () => {
    resetPomo();
    persistAppState();
    document.getElementById('pomo-settings').classList.add('hidden');
});

function getConfiguredPomoSeconds() {
    if (pomoMode === 'work') {
        const m = parseInt(document.getElementById('pomo-work-min').value) || 0;
        const s = parseInt(document.getElementById('pomo-work-sec').value) || 0;
        return Math.max(1, m * 60 + s);
    } else {
        const m = parseInt(document.getElementById('pomo-break-min').value) || 0;
        const s = parseInt(document.getElementById('pomo-break-sec').value) || 0;
        return Math.max(1, m * 60 + s);
    }
}

function resetPomo() {
    clearInterval(pomoInterval);
    pomoRunning = false;
    document.getElementById('pomo-start-btn').innerText = '▶ 開始';
    pomoTotalSec = getConfiguredPomoSeconds();
    pomoRemainSec = pomoTotalSec;
    updatePomoDisplay();
}

document.getElementById('pomo-start-btn').addEventListener('click', () => {
    if (pomoRunning) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        document.getElementById('pomo-start-btn').innerText = '▶ 繼續';
        updatePomoDisplay();
    } else {
        pomoRunning = true;
        document.getElementById('pomo-start-btn').innerText = '⏸ 暫停';
        updatePomoDisplay();
        pomoInterval = setInterval(() => {
            if (pomoRemainSec > 0) {
                pomoRemainSec--;
                updatePomoDisplay();
            } else {
                clearInterval(pomoInterval);
                pomoRunning = false;
                document.getElementById('pomo-start-btn').innerText = '▶ 開始';
                const msg = pomoMode === 'work' 
                    ? '專注時間完成！適度休息一下吧。' 
                    : '休息結束！準備開始下一輪專注。';
                pomoMode = pomoMode === 'work' ? 'break' : 'work';
                pomoTotalSec = getConfiguredPomoSeconds();
                pomoRemainSec = pomoTotalSec;
                updatePomoDisplay();
                triggerAlarm({ text: msg, media: '', category: '番茄鐘' });
            }
        }, 1000);
    }
});

document.getElementById('pomo-reset-btn').addEventListener('click', resetPomo);
document.getElementById('pomo-switch-btn').addEventListener('click', () => {
    pomoMode = pomoMode === 'work' ? 'break' : 'work';
    resetPomo();
});

document.getElementById('media-btn').addEventListener('click', async () => {
    const path = await pywebview.api.select_media();
    if (path) {
        currentMediaPath = path;
        const fileName = path.split('/').pop();
        document.getElementById('selected-media-name').innerText = `已選取附件: ${fileName}`;
    }
});

document.getElementById('add-btn').addEventListener('click', () => {
    const text = document.getElementById('task-input').value.trim();
    if (!text) return;

    const chosenCategory = document.getElementById('task-category-select').value || categories[0] || '生活';
    let timeType = 'none';
    let endTime = null;
    let durationSec = 0;

    if (addTimeMode === 'countdown') {
        const mins = parseInt(document.getElementById('min-input').value) || 0;
        const secs = parseInt(document.getElementById('sec-input').value) || 0;
        durationSec = mins * 60 + secs;
        if (durationSec > 0) {
            timeType = 'countdown';
            endTime = Date.now() + durationSec * 1000;
        }
    } else if (addTimeMode === 'deadline') {
        const dlVal = document.getElementById('deadline-input').value;
        if (dlVal) {
            const targetMs = new Date(dlVal).getTime();
            if (targetMs > Date.now()) {
                timeType = 'deadline';
                endTime = targetMs;
                durationSec = Math.ceil((targetMs - Date.now()) / 1000);
            }
        }
    }

    tasks.push({
        id: Date.now(),
        category: chosenCategory,
        text: text,
        completed: false,
        completedAt: null,
        timeType: timeType,
        durationSec: durationSec,
        endTime: endTime,
        media: currentMediaPath,
        alerted: false
    });

    if (sectionCollapsed.pending) {
        sectionCollapsed.pending = false;
        syncSectionFoldUI();
    }

    saveAndRender();
    document.getElementById('task-input').value = '';
    document.getElementById('min-input').value = '';
    document.getElementById('sec-input').value = '';
    currentMediaPath = '';
    document.getElementById('selected-media-name').innerText = '';
});

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : null;
    }
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

document.getElementById('clear-completed-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
});

function saveAndRender() {
    persistAppState();
    renderCategoryUI();
    renderTasks();
    syncSectionFoldUI();
    updateDockProgress();
}

/* ================= 核心排序演算法：剩餘時間最少者永遠置頂 ================= */
function getSortedPendingTasks(sourceTasks) {
    const now = Date.now();
    return sourceTasks
        .filter(t => !t.completed)
        .slice()
        .sort((a, b) => {
            const aHasTimer = Boolean(a.endTime);
            const bHasTimer = Boolean(b.endTime);

            if (aHasTimer && !bHasTimer) return -1;
            if (!aHasTimer && bHasTimer) return 1;

            if (aHasTimer && bHasTimer) {
                const aRemain = a.endTime - now;
                const bRemain = b.endTime - now;
                if (aRemain !== bRemain) return aRemain - bRemain;
            }

            return a.id - b.id;
        });
}

function buildTaskListItem(task, cfg) {
    const li = document.createElement('li');
    const catName = task.category || '一般';
    const catStyle = getCategoryStyle(catName);

    li.style.setProperty('--cat-color', catStyle.bg);
    li.style.setProperty('--cat-text-color', catStyle.text);

    let timerHtml = '';
    let subInfoHtml = '';

    if (task.endTime && !task.completed) {
        const remain = Math.max(0, Math.ceil((task.endTime - Date.now()) / 1000));
        const isUrgent = remain <= 10;
        timerHtml = `<span class="timer ${isUrgent ? 'urgent-timer-badge' : ''}">${formatRemainTime(remain)}</span>`;
        if (task.timeType === 'deadline') {
            subInfoHtml = `<span class="deadline-sub">📅 截止：${formatDeadlineBadge(task.endTime)}</span>`;
        }
    } else if (task.timeType === 'deadline' && task.endTime) {
        subInfoHtml = `<span class="deadline-sub">📅 截止：${formatDeadlineBadge(task.endTime)}</span>`;
    }

    const hasMedia = Boolean(task.media);
    const mediaIcon = isVideoMedia(task.media) ? '🎬' : '🖼';
    const mediaActionHtml = hasMedia
        ? `<button type="button" class="icon-action-btn media-preview-btn" title="點擊觀看附件" onclick="openMediaPreview(${task.id})">${mediaIcon}</button>`
        : '';

    const completeBtnHtml = task.completed
        ? `<button type="button" class="icon-action-btn complete-action-btn" title="還原為未完成" onclick="toggleTask(${task.id})">↩</button>`
        : `<button type="button" class="icon-action-btn complete-action-btn" title="標記為已完成" onclick="toggleTask(${task.id})">✓</button>`;

    li.innerHTML = `
        <div class="task-left ${hasMedia ? 'has-media' : ''}" ${hasMedia ? `onclick="openMediaPreview(${task.id})" title="點擊觀看附件"` : ''}>
            <span class="task-bullet">${task.completed ? '✓' : cfg.bullet}</span>
            <div class="task-text-wrap">
                <div class="task-meta-row">
                    <span class="task-cat-badge">${escapeHtml(catName)}</span>
                    <span class="task-main-text">${escapeHtml(task.text)}</span>
                </div>
                ${subInfoHtml}
            </div>
        </div>
        <div class="task-right">
            ${timerHtml}
            ${mediaActionHtml}
            ${completeBtnHtml}
            <button type="button" class="icon-action-btn" title="修改此任務" onclick="openEditModal(${task.id})">✎</button>
            <button type="button" class="icon-action-btn" title="刪除此任務" onclick="deleteTask(${task.id})">✕</button>
        </div>
    `;
    return li;
}

function renderTasks() {
    const pendingListEl = document.getElementById('pending-list');
    const completedListEl = document.getElementById('completed-list');
    pendingListEl.innerHTML = '';
    completedListEl.innerHTML = '';

    const theme = currentTheme || 'theme-muji';
    const cfg = themeConfigs[theme] || themeConfigs['theme-muji'];

    const filtered = selectedFilterCategory === 'ALL'
        ? tasks
        : tasks.filter(t => t.category === selectedFilterCategory);

    const pendingTasks = getSortedPendingTasks(filtered);
    const completedTasks = filtered
        .filter(t => t.completed)
        .slice()
        .sort((a, b) => (b.completedAt || b.id) - (a.completedAt || a.id));

    document.getElementById('pending-count').innerText = pendingTasks.length;
    document.getElementById('completed-count').innerText = completedTasks.length;

    if (pendingTasks.length === 0) {
        pendingListEl.innerHTML = `<div class="empty-section-hint">目前沒有待處理的任務 ✨</div>`;
    } else {
        pendingTasks.forEach(task => {
            pendingListEl.appendChild(buildTaskListItem(task, cfg));
        });
    }

    if (completedTasks.length === 0) {
        completedListEl.innerHTML = `<div class="empty-section-hint">尚無已完成紀錄</div>`;
    } else {
        completedTasks.forEach(task => {
            completedListEl.appendChild(buildTaskListItem(task, cfg));
        });
    }
}

setInterval(() => {
    if (!isDataInitialized) return;
    let needRender = false;
    tasks.forEach(task => {
        if (task.endTime && !task.completed && !task.alerted) {
            if (Date.now() >= task.endTime) {
                task.alerted = true;
                triggerAlarm(task);
                persistAppState();
            }
            needRender = true;
        }
    });
    if (needRender) {
        renderTasks();
        updateDockProgress();
    }
}, 500);

// ================= 六大主題提醒跳窗觸發器（支援一般任務 & 三合一健康提醒） =================
function triggerAlarm(task) {
    if (isCollapsed) document.getElementById('dock-btn').click();
    if (window.pywebview && window.pywebview.api && window.pywebview.api.bring_to_front) {
        pywebview.api.bring_to_front();
    }
    currentOpacity = 1;
    opacitySlider.value = 1;
    document.getElementById('opacity-val').innerText = '100%';
    if (window.pywebview && window.pywebview.api) {
        pywebview.api.set_opacity(1);
    }

    const activeTheme = currentTheme || 'theme-muji';
    const cfg = themeConfigs[activeTheme] || themeConfigs['theme-muji'];
    const modal = document.getElementById('alarm-modal');
    const titleEl = document.getElementById('alarm-title');
    const artEl = document.getElementById('alarm-theme-art');
    const quoteEl = document.getElementById('alarm-quote');
    const textEl = document.getElementById('alarm-task-text');
    const dismissBtn = document.getElementById('dismiss-alarm-btn');
    const container = document.getElementById('alarm-media-container');
    const gbaHud = document.getElementById('gba-boss-hud');
    const tamaHud = document.getElementById('tama-status-hud');
    
    container.innerHTML = '';
    gbaHud.classList.add('hidden');
    tamaHud.classList.add('hidden');
    clearInterval(typewriterTimer);

    artEl.innerHTML = cfg.alarmArt;

    const wType = task.wellnessType;
    const wPack = wType && wellnessThemeCopy[activeTheme] ? wellnessThemeCopy[activeTheme][wType] : null;

    const quotesPool = (wPack && wPack.quotes && wPack.quotes.length > 0) ? wPack.quotes : cfg.quotes;
    const randomQuote = quotesPool[Math.floor(Math.random() * quotesPool.length)];
    quoteEl.innerText = randomQuote;
    quoteEl.classList.remove('hidden');

    if (task.media) {
        loadMediaSrc(task.media).then(resolvedSrc => {
            if (!resolvedSrc) {
                if (wType) {
                    const prefixMap = { water: 'W', eyes: 'E', move: 'K' };
                    container.innerHTML = `<div style="font-size:11px; opacity:0.75; margin-top:6px;">（找不到 ${prefixMap[wType]} 開頭圖片，請點健康提醒「⚙ → 匯入 W/E/K 圖片」）</div>`;
                }
                return;
            }
            if (isVideoMedia(task.media)) {
                container.innerHTML = `<video src="${resolvedSrc}" autoplay loop controls></video>`;
            } else {
                container.innerHTML = `<img src="${resolvedSrc}" alt="提醒圖片">`;
            }
        });
    } else if (wType) {
        const prefixMap = { water: 'W', eyes: 'E', move: 'K' };
        container.innerHTML = `<div style="font-size:11px; opacity:0.75; margin-top:6px;">（尚未放入 ${prefixMap[wType]} 開頭圖片，請點健康提醒「⚙ → 匯入 W/E/K 圖片」）</div>`;
    }

    const catTag = task.category ? `[${task.category}] ` : '';
    const deadlinePrefix = task.timeType === 'deadline' ? '【DEADLINE 截止時刻已到】\n' : '';
    const displayTaskBody = wPack ? wPack.taskText : `${deadlinePrefix}${catTag}${task.text}`;

    if (activeTheme === 'theme-digimon') {
        const flash = document.getElementById('digi-flash-overlay');
        flash.classList.remove('hidden');
        titleEl.innerText = wPack ? wPack.title : '⚡ DIGIVOLUTION!!';
        textEl.innerText = wPack ? displayTaskBody : `${deadlinePrefix}【任務目標達成】\n${catTag}${task.text}`;
        dismissBtn.innerHTML = wPack ? wPack.btn : '⚡ 接收數位能量（關閉）';
        
        setTimeout(() => {
            flash.classList.add('hidden');
            modal.classList.remove('hidden');
            syncEffectiveOpacity();
        }, 850);
    } 
    else if (activeTheme === 'theme-gba') {
        gbaHud.classList.remove('hidden');
        document.getElementById('gba-boss-name').innerText = (wPack && wPack.bossName) ? wPack.bossName : 'BOSS：死線大魔王';
        titleEl.innerText = wPack ? wPack.title : '▶ WILD DEADLINE APPEARED!';
        textEl.innerText = '';
        dismissBtn.innerHTML = wPack ? wPack.btn : '▶ 迎戰任務 (關閉) <span class="gba-arrow">▼</span>';
        modal.classList.remove('hidden');
        syncEffectiveOpacity();
        
        let idx = 0;
        const fullText = wPack ? displayTaskBody : `${deadlinePrefix}【任務】${catTag}${task.text}`;
        typewriterTimer = setInterval(() => {
            if (idx < fullText.length) {
                textEl.innerText += fullText.charAt(idx);
                idx++;
            } else {
                clearInterval(typewriterTimer);
            }
        }, 40);
    } 
    else if (activeTheme === 'theme-naruto') {
        titleEl.innerText = wPack ? wPack.title : '💨 砰！通靈・S級緊急任務！';
        textEl.innerText = wPack ? displayTaskBody : `${deadlinePrefix}【卷軸指令】${catTag}${task.text}`;
        dismissBtn.innerHTML = wPack ? wPack.btn : '🙏 結印・解（解除通靈）';
        modal.classList.remove('hidden');
        syncEffectiveOpacity();
    }
    else if (activeTheme === 'theme-mermaid') {
        titleEl.innerText = wPack ? wPack.title : '🐚 粉色真珠聲調・安可時間！';
        textEl.innerText = wPack ? displayTaskBody : `${deadlinePrefix}♪ ${catTag}${task.text} ♪`;
        dismissBtn.innerHTML = wPack ? wPack.btn : '🎤 用閃亮的歌聲完成任務！';
        modal.classList.remove('hidden');
        syncEffectiveOpacity();
    }
    else if (activeTheme === 'theme-tamagotchi') {
        tamaHud.classList.remove('hidden');
        document.getElementById('tama-hud-left').innerText = (wPack && wPack.hudLeft) ? wPack.hudLeft : 'HUNGRY: ♥♡♡♡';
        document.getElementById('tama-hud-right').innerText = (wPack && wPack.hudRight) ? wPack.hudRight : 'HAPPY: ♥♡♡♡';
        titleEl.innerText = wPack ? wPack.title : '🥚 CALLING!! 寵物呼叫中';
        textEl.innerText = wPack ? displayTaskBody : `${deadlinePrefix}[任務] ${catTag}${task.text}`;
        dismissBtn.innerHTML = wPack ? wPack.btn : '🍼 照顧寵物（確認關閉）';
        modal.classList.remove('hidden');
        syncEffectiveOpacity();
    }
    else {
        titleEl.innerText = wPack ? wPack.title : (task.timeType === 'deadline' ? 'MUJI DEADLINE・截止提醒' : 'MUJI TIME・時間提醒');
        textEl.innerText = displayTaskBody;
        dismissBtn.innerHTML = wPack ? wPack.btn : '好，現在去處理';
        modal.classList.remove('hidden');
        syncEffectiveOpacity();
    }
}

document.getElementById('dismiss-alarm-btn').addEventListener('click', () => {
    clearInterval(typewriterTimer);
    document.getElementById('alarm-modal').classList.add('hidden');
    document.getElementById('alarm-media-container').innerHTML = '';
    updateDockProgress();
    syncEffectiveOpacity();
});