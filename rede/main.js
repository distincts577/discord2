const { app, BrowserWindow, session, desktopCapturer, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let pickerWindow = null;
let pendingPickerResolve = null;
let currentVoiceChannelLabel = null; // nome do canal de voz atual, atualizado pelo app via preload.js

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 860,
    minHeight: 600,
    backgroundColor: '#313338',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// o app avisa aqui qual é o canal de voz atual, só pra gente mostrar
// o nome certo na tela de "Compartilhar tela"
ipcMain.on('voice-channel-update', (_event, name) => {
  currentVoiceChannelLabel = name || null;
});

// ---------- seletor de tela/janela para compartilhamento (estilo Discord, em 2 etapas) ----------
// Electron não deixa o Chromium mostrar o picker nativo do navegador,
// então criamos o nosso: 1) escolher janela/tela, 2) ajustar qualidade/áudio.
function openPickerWindow(sources) {
  return new Promise((resolve) => {
    pendingPickerResolve = resolve;

    pickerWindow = new BrowserWindow({
      width: 620,
      height: 640,
      resizable: false,
      minimizable: false,
      maximizable: false,
      parent: mainWindow,
      modal: true,
      autoHideMenuBar: true,
      backgroundColor: '#1e1f22',
      webPreferences: {
        preload: path.join(__dirname, 'picker-preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    pickerWindow.loadFile(path.join(__dirname, 'picker.html'));

    pickerWindow.webContents.once('did-finish-load', () => {
      pickerWindow.webContents.send('picker-data', {
        sources: sources.map(s => ({
          id: s.id,
          name: s.name,
          thumbnail: s.thumbnail.toDataURL(),
          kind: s.id.startsWith('screen:') ? 'screen' : 'window',
        })),
        voiceChannel: currentVoiceChannelLabel,
      });
    });

    pickerWindow.on('closed', () => {
      pickerWindow = null;
      if (pendingPickerResolve) {
        pendingPickerResolve(null);
        pendingPickerResolve = null;
      }
    });
  });
}

ipcMain.on('picker-choose', (_event, settings) => {
  if (pendingPickerResolve) {
    pendingPickerResolve(settings);
    pendingPickerResolve = null;
  }
  if (pickerWindow) pickerWindow.close();
});

ipcMain.on('picker-cancel', () => {
  if (pendingPickerResolve) {
    pendingPickerResolve(null);
    pendingPickerResolve = null;
  }
  if (pickerWindow) pickerWindow.close();
});

app.whenReady().then(() => {
  // permite câmera/microfone sem perguntar (o próprio app já pede
  // confirmação do usuário antes de entrar numa chamada)
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ['media', 'audioCapture', 'videoCapture', 'display-capture'];
    callback(allowed.includes(permission));
  });

  // intercepta getDisplayMedia() e mostra nosso seletor de tela/janela
  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 300, height: 200 },
      });
      const settings = await openPickerWindow(sources);
      const chosen = settings && sources.find(s => s.id === settings.sourceId);
      if (chosen) {
        // avisa o app das opções de qualidade/áudio/aviso escolhidas na 2ª etapa,
        // pra ele aplicar assim que pegar o stream de vídeo
        if (mainWindow) {
          mainWindow.webContents.send('display-media-settings', {
            resolution: settings.resolution,
            frameRate: settings.frameRate,
            audio: !!settings.audio,
            notify: !!settings.notify,
          });
        }
        callback({ video: chosen, audio: settings.audio ? 'loopback' : undefined });
      } else {
        callback({});
      }
    } catch (err) {
      console.error('erro ao capturar tela:', err);
      callback({});
    }
  });

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
