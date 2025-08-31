const { app, BrowserWindow, ipcMain, dialog, Notification, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');

if (process.platform === 'win32') {
  app.setAppUserModelId('Restaller');
}

let mainWindow;
let splashWindow;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 200, height: 200, transparent: true, frame: false, alwaysOnTop: true, center: true, icon: path.join(__dirname, 'icon.png')
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.once('ready-to-show', () => splashWindow.setTitle('Restaller'));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 650, 
    frame: false, 
    show: false, 
    backgroundColor: '#111111', 
    titleBarStyle: 'hidden', 
    title: 'Restaller', 
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      devTools: !app.isPackaged
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.setTitle('Restaller');
    setTimeout(() => {
        if (splashWindow) splashWindow.close();
        mainWindow.show();
    }, 2500);
  });
}

ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.on('close-app', () => mainWindow.close());
ipcMain.on('show-about-dialog', () => {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'О программе',
        message: 'Restaller v1.0.0',
        detail: 'Автор: Whityx\nВесь исходный код находится в открытом доступе.',
        buttons: ['OK']
    });
});

ipcMain.on('check-installed-packages', (event) => {
    exec('winget list', (error, stdout, stderr) => {
        if (error || stderr) {
            event.reply('check-installed-result', []);
            return;
        }
        const installedIds = stdout.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('Name') && !line.startsWith('Имя'))
            .map(line => {
                const parts = line.split(/\s\s+/);
                return parts.length > 1 ? parts[1] : null;
            })
            .filter(id => id);

        event.reply('check-installed-result', installedIds);
    });
});

ipcMain.on('install-app', (event, { appId, appName }) => {
  const friendlyName = appName || appId;
  const command = `winget install --id=${appId} -e --accept-package-agreements --accept-source-agreements --silent`;
  exec(command, (error, stdout, stderr) => {
    if (error || (stderr && !stdout.includes('Successfully installed'))) {
      new Notification({ title: 'Ошибка установки', body: `Не удалось установить ${friendlyName}.` }).show();
      event.reply('installation-status', { success: false, appId });
      return;
    }
    new Notification({ title: 'Установка завершена', body: `Приложение ${friendlyName} было успешно установлено.` }).show();
    event.reply('installation-status', { success: true, appId });
  });
});

ipcMain.on('uninstall-app', (event, { appId, appName }) => {
    const friendlyName = appName || appId;
    const command = `winget uninstall --id=${appId} -e --accept-source-agreements --silent`;
    exec(command, (error, stdout, stderr) => {
        if (error || (stderr && !stdout.includes('Successfully uninstalled'))) {
            new Notification({ title: 'Ошибка удаления', body: `Не удалось удалить ${friendlyName}.` }).show();
            event.reply('uninstallation-status', { success: false, appId });
            return;
        }
        new Notification({ title: 'Удаление завершено', body: `Приложение ${friendlyName} было успешно удалено.` }).show();
        event.reply('uninstallation-status', { success: true, appId });
    });
});

ipcMain.on('get-app-details', (event, appId) => {
  const command = `winget show --id=${appId} -e --accept-source-agreements`;
  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      event.reply('app-details-result', { error: `Не удалось загрузить информацию: ${stderr || error.message}` });
      return;
    }
    const details = {};
    const lines = stdout.split('\n');
    let descriptionStarted = false; let description = '';
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('Описание:') || line.startsWith('Description:')) {
            descriptionStarted = true; description = line.substring(line.indexOf(':') + 1).trim();
        } else if (descriptionStarted && !line.includes(':')) {
            description += ' ' + line;
        } else {
            descriptionStarted = false;
            const match = line.match(/^([^:]+):\s*(.*)$/);
            if (match && match[1] && match[2]) details[match[1].trim()] = match[2].trim();
        }
    });
    if (description) details['Описание'] = description;
    event.reply('app-details-result', details);
  });
});

app.whenReady().then(() => {
  createSplashWindow();
  createWindow();
});
app.on('window-all-closed', () => app.quit());