// Este app funciona sozinho com HTML/JS puro (roda até direto no navegador,
// como PWA) — por isso o preload fica enxuto e só expõe o mínimo necessário
// pra tela de "Screen Share" do Electron (main.js/picker.html) conseguir
// mostrar o canal de voz certo e devolver as configurações escolhidas
// (qualidade, framerate, áudio) pro app aplicar depois de capturar a tela.
// Em um navegador comum, window.redeDesktop simplesmente não existe, e o
// app já trata isso (checa `if(window.redeDesktop)` antes de usar).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('redeDesktop', {
  setVoiceChannel: (name) => ipcRenderer.send('voice-channel-update', name),
  onShareSettings: (callback) => ipcRenderer.on('display-media-settings', (_event, settings) => callback(settings)),
  // usados pelas notificações de mensagem: traz a janela pra frente ao clicar,
  // e pisca o ícone na barra de tarefas quando chega mensagem com a janela em segundo plano.
  focusWindow: () => ipcRenderer.send('focus-window'),
  flashWindow: () => ipcRenderer.send('flash-window'),
});
