# rede — app instalável de chat e chamadas com tela compartilhada

Este pacote é o mesmo app que você viu no Claude, mas pronto para rodar fora
dele, hospedado num site de verdade e instalável como aplicativo (PWA).

## O que mudou em relação à versão do Claude

- O armazenamento (`window.storage`) foi trocado pelo **Firebase Realtime
  Database** — funciona com qualquer número de pessoas, em tempo real, e
  continua sem precisar de login.
- Foi adicionado `manifest.json` e `service-worker.js`, que são o que fazem o
  navegador oferecer "Instalar aplicativo".

## Passo 1 — Criar o backend (Firebase, grátis)

1. Acesse https://console.firebase.google.com e crie um projeto novo.
2. No menu lateral, vá em **Compilação > Realtime Database** e clique em
   **Criar banco de dados**. Escolha a região mais próxima de você.
3. Nas regras de segurança, comece com o modo de teste (dá pra travar depois):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   > Isso deixa o banco aberto para qualquer um ler/escrever — ótimo para
   > testar rápido. Antes de divulgar o app publicamente, vale restringir
   > (ex.: limitar tamanho de mensagens, taxa de escrita) nas regras do
   > Firebase.
4. Vá em **Configurações do projeto** (ícone de engrenagem) > aba **Geral** >
   role até "Seus apps" > clique no ícone **`</>`** (Web) > registre o app.
5. Copie o objeto `firebaseConfig` que aparece na tela.
6. Abra o arquivo `firebase-config.js` deste pacote e cole os valores no
   lugar dos `"SEU_..."`.

## Passo 2 — Hospedar o site

Qualquer hospedagem estática funciona. As mais simples e gratuitas:

**Opção A — Vercel / Netlify (arrastar e soltar)**
1. Crie uma conta em https://vercel.com ou https://netlify.com.
2. Arraste a pasta inteira (`index.html`, `manifest.json`,
   `service-worker.js`, `firebase-config.js`, pasta `icons/`) para a área de
   deploy.
3. Pronto — você recebe um link `https://algumacoisa.vercel.app`.

**Opção B — Firebase Hosting (já que você criou o projeto lá mesmo)**
```
npm install -g firebase-tools
firebase login
firebase init hosting   # aponte a pasta pública para esta pasta
firebase deploy
```

O importante é que o site fique em **HTTPS** — isso é obrigatório tanto para
o app ser instalável quanto para a câmera/tela/microfone funcionarem.

## Passo 3 — Instalar como aplicativo

Depois de publicado, abra o link no navegador:

- **Android (Chrome):** aparece um banner "Adicionar à tela inicial", ou vá
  no menu ⋮ > "Instalar aplicativo".
- **iPhone (Safari):** toque em Compartilhar (ícone de seta para cima) >
  "Adicionar à Tela de Início".
- **Computador (Chrome/Edge):** um ícone de instalação aparece do lado
  direito da barra de endereço, ou o próprio botão **"Instalar app"** que
  aparece na tela de entrada do app quando o navegador permite.

## Arquivos deste pacote

| Arquivo | O que faz |
|---|---|
| `index.html` | O app inteiro (interface + lógica) |
| `firebase-config.js` | Onde você cola as chaves do seu projeto Firebase |
| `manifest.json` | Diz ao navegador como instalar o app (nome, ícone, cor) |
| `service-worker.js` | Cacheia os arquivos do app para abrir mais rápido |
| `icons/icon-192.png`, `icons/icon-512.png` | Ícones do app |

## Novidades desta versão

- **Editar/apagar mensagem:** passe o mouse sobre uma mensagem sua (em
  canal de texto, canal de voz ou DM) para ver os ícones ✏️ (editar) e
  🗑️ (apagar). Só aparecem nas suas próprias mensagens.
- **Mensagens diretas (DM):** clique no ícone 💬 no topo da barra
  lateral esquerda, ou clique no nome de alguém na lista "Online" à
  direita, para abrir uma conversa privada com essa pessoa — vale para
  qualquer servidor. A lista de conversas mostra todo mundo que já
  entrou no app pelo menos uma vez.
- **Servidor com senha:** ao criar um servidor, o campo de senha é
  opcional. Se preencher, quem quiser entrar nesse servidor precisa
  digitar a mesma senha (um cadeado 🔒 aparece no ícone do servidor).
  Isso é um filtro simples do lado do app — combine com uma senha que
  só o seu grupo conhece, como um convite.
  **Importante:** como o banco continua em modo de teste (leitura e
  escrita liberadas para qualquer um, veja abaixo), a senha impede que
  curiosos casuais entrem pela tela do app, mas não é segurança de
  verdade — alguém que souber mexer direto no Firebase ainda
  conseguiria ver os dados. Para algo à prova de gente com mais
  conhecimento técnico, seria necessário Firebase Authentication e
  regras de banco restritas, o que é bem mais trabalho.

## Novidades desta atualização

- **Foto de perfil:** passe o mouse sobre seu avatar (canto inferior esquerdo)
  e clique para escolher uma foto — ela é redimensionada no próprio navegador
  antes de ser salva, então fica leve. Um ✕ aparece para remover a foto e
  voltar às iniciais.
- **Status manual:** abaixo do seu nome, um menu deixa escolher entre 🟢
  Online, 🌙 Ausente e ⛔ Não perturbe. O status aparece como uma bolinha
  colorida no seu avatar em todo lugar (mensagens, lista "Online", lista de
  canais de voz, mensagens diretas).
- **Notificações:** ao chegar uma mensagem em outro canal, numa DM, ou com a
  janela minimizada/em segundo plano, o navegador (ou o app desktop) mostra
  uma notificação do sistema — clicar nela abre a conversa direto. No app
  desktop, a janela também pisca na barra de tarefas.
  **Importante:** isso funciona enquanto o app está aberto (mesmo minimizado
  ou numa aba em segundo plano). Com o app **totalmente fechado**, não tem
  como notificar — isso exigiria um servidor de push (Firebase Cloud
  Messaging + Cloud Functions), que é uma etapa de infraestrutura à parte.

## Novidades desta atualização (chat/mensagens)

- **Fixar mensagem:** passe o mouse sobre qualquer mensagem (sua ou de
  outra pessoa) e clique no ícone de pin 📌 nas ações. A mensagem ganha
  uma etiqueta "fixada" e passa a aparecer no painel de fixadas, aberto
  pelo botão de pin no topo do canal (mostra quantas estão fixadas).
  Clicar num item do painel pula direto pra mensagem, se ela ainda
  estiver carregada na tela.
- **Menções (@pessoa / @todos):** ao digitar `@` no campo de mensagem,
  aparece um autocomplete com as pessoas do servidor (setas ↑↓ pra
  navegar, Enter/Tab pra escolher, Esc pra fechar). Use `@todos` pra
  mencionar o canal inteiro. Menções aparecem destacadas dentro da
  mensagem, e quando alguém te menciona a mensagem inteira fica com uma
  barra amarela de destaque na lateral — igual às notificações que já
  existiam antes.
- **Anexar arquivo/imagem:** o clipe 📎 ao lado do campo de mensagem
  deixa escolher um ou mais arquivos. Imagens aparecem como miniatura
  clicável (abre em tela cheia); qualquer outro tipo de arquivo vira um
  cartão baixável. Limite de 5MB por arquivo — como não há um servidor
  de arquivos separado, tudo é enviado direto pelo mesmo banco em tempo
  real (Realtime Database) já usado pro resto do chat, então arquivos
  grandes ficam lentos ou podem falhar; pra uso mais pesado valeria a
  pena migrar pro Firebase Storage no futuro.
- **Threads:** o ícone de balão 🧵 nas ações de uma mensagem abre uma
  conversa lateral só sobre aquela mensagem, sem lotar o canal
  principal. Mensagens com respostas mostram um link "N respostas" que
  também abre a thread.
- **Busca:** o ícone de lupa 🔍 no topo do canal abre uma busca por
  texto ou nome de quem enviou, dentro do histórico daquele canal ou
  DM. Clicar num resultado fecha a busca e pula pra mensagem (se ela já
  tiver sido carregada na rolagem da tela).

## Limites que continuam existindo

- As chamadas de tela/voz continuam sendo conexão direta entre os
  participantes (WebRTC), sem servidor de mídia central — funciona bem até
  uns 6–8 participantes numa mesma chamada.
- O banco em modo de teste é público: qualquer um com o link do site pode
  ler e escrever. Para algo mais sério, ajuste as regras do Realtime
  Database ou migre para o Firestore com autenticação.
