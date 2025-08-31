document.addEventListener('DOMContentLoaded', () => {
    const aboutBtn = document.getElementById('about-btn');
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');

    if (aboutBtn) aboutBtn.addEventListener('click', () => window.electronAPI.showAboutDialog());
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => window.electronAPI.minimize());
    if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI.close());
    
    const icons = {
        initial: `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
        installing: `<div class="spinner"></div>`,
        installed: `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        failed: `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`,
        uninstall: `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
        uninstalling: `<div class="spinner"></div>`
    };

    const updateButtonState = (button, state) => {
        button.dataset.state = state;
        button.className = 'install-btn';
        button.innerHTML = icons[state] || icons['initial'];
        
        button.disabled = ['installing', 'uninstalling', 'failed'].includes(state);

        if (state === 'uninstall' || state === 'uninstalling') {
            button.classList.add('uninstallable');
        }
        if (state === 'installing' || state === 'uninstalling') {
            button.classList.add(state);
        }
    };

    document.querySelectorAll('.install-btn').forEach(button => {
        updateButtonState(button, 'initial');
        button.addEventListener('click', () => {
            const appId = button.dataset.appid;
            const appName = button.closest('.app-item').querySelector('.app-name').textContent;
            const currentState = button.dataset.state;

            if (currentState === 'initial') {
                updateButtonState(button, 'installing');
                window.electronAPI.installApp({ appId, appName });
            } else if (currentState === 'uninstall') {
                updateButtonState(button, 'uninstalling');
                window.electronAPI.uninstallApp({ appId, appName });
            }
        });
    });

    window.electronAPI.checkInstalledPackages();

    window.electronAPI.onCheckInstalledResult((installedIds) => {
        document.querySelectorAll('.install-btn').forEach(button => {
            if (installedIds.includes(button.dataset.appid)) {
                updateButtonState(button, 'uninstall');
            } else {
                updateButtonState(button, 'initial');
            }
        });
    });

    window.electronAPI.onInstallationStatus(({ success, appId }) => {
        const button = document.querySelector(`.install-btn[data-appid="${appId}"]`);
        if (!button) return;
        updateButtonState(button, success ? 'uninstall' : 'failed');
    });

    window.electronAPI.onUninstallationStatus(({ success, appId }) => {
        const button = document.querySelector(`.install-btn[data-appid="${appId}"]`);
        if (!button) return;
        updateButtonState(button, success ? 'initial' : 'failed');
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.app-item').forEach(item => {
            const appName = item.querySelector('.app-name').textContent.toLowerCase();
            const appId = item.querySelector('.app-id').textContent.toLowerCase();
            item.style.display = (appName.includes(searchTerm) || appId.includes(searchTerm)) ? 'flex' : 'none';
        });
    });

    const appList = document.getElementById('app-list');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const closeModal = () => modalBackdrop.classList.remove('visible');
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });

    appList.addEventListener('click', (e) => {
        const appItem = e.target.closest('.app-item');
        if (!appItem || e.target.closest('.install-btn')) return;
        const appId = appItem.querySelector('.install-btn').dataset.appid;
        modalContent.innerHTML = `<div class="spinner" style="margin: auto; border-top-color: var(--accent-action);"></div>`;
        modalBackdrop.classList.add('visible');
        window.electronAPI.getAppDetails(appId);
    });

    window.electronAPI.onAppDetailsResult((details) => {
        if (details.error) {
            modalContent.innerHTML = `<p><strong>Ошибка:</strong> ${details.error}</p>`; return;
        }
        const keyMap = {'Found': 'Название','Version': 'Версия','Издатель': 'Издатель','Publisher': 'Издатель','Homepage': 'Сайт','License': 'Лицензия','Описание': 'Описание'};
        let contentHtml = `<h2>${details['Found'] || 'Информация'}</h2>`;
        for (const key in keyMap) {
            if (details[key]) {
                const value = details[key];
                const displayValue = (key === 'Homepage' && value.startsWith('http')) ? `<a href="${value}" onclick="event.preventDefault(); window.open(this.href, '_blank');">${value}</a>` : value;
                contentHtml += `<p><strong>${keyMap[key]}:</strong> ${displayValue}</p>`;
            }
        }
        modalContent.innerHTML = contentHtml;
    });
});