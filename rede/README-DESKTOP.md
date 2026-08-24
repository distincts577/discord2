# rede — versão desktop (instalável igual Discord)

Este pacote transforma o app web que você já tinha em um programa de
verdade: um `.exe` no Windows, `.dmg` no Mac e `.AppImage` no Linux, com
ícone próprio, abrindo em janela independente (sem barra do navegador).

A tecnologia usada é o **Electron** (a mesma base do Discord, VS Code,
Slack e Spotify desktop).

## O que já está pronto aqui dentro

- `app/` — o site original (index.html, firebase-config.js etc.), sem
  nenhuma mudança de lógica.
- `main.js` — abre a janela do app e implementa o compartilhamento de
  tela (o Electron não deixa o navegador mostrar o seletor nativo, então
  criei um seletor próprio em `picker.html`).
- `package.json` — configurado para gerar os três instaladores com
  `electron-builder`.
- `.github/workflows/build.yml` — workflow pronto para gerar os três
  instaladores automaticamente no GitHub, sem você precisar ter um Mac
  e um PC com Windows.

## Passo 1 — Testar localmente

Você precisa ter o [Node.js](https://nodejs.org) instalado (versão 18+).

```bash
cd rede-desktop
npm install
npm start
```

Isso abre o app numa janela própria. Teste o chat e uma chamada com
compartilhamento de tela antes de gerar o instalador.

## Passo 2 — Gerar o instalador

**Mais simples: pelo GitHub (gera Windows + Mac + Linux de uma vez)**

1. Suba esta pasta para um repositório no GitHub.
2. Na aba **Actions** do repositório, rode o workflow `build-desktop-app`
   manualmente (botão "Run workflow"), ou crie uma tag `v1.0.0` e dê push
   (`git tag v1.0.0 && git push --tags`) — isso dispara o build sozinho.
3. Quando terminar, os instaladores ficam disponíveis para download na
   própria página do workflow, em "Artifacts" (um `.zip` por sistema
   operacional).

**Alternativa: gerar só para o seu próprio sistema, localmente**

```bash
npm run dist
```

O instalador aparece na pasta `release/`. Assim você só gera o do seu
sistema operacional atual (ex.: rodando no Windows, gera só o `.exe`).

## Passo 3 — Distribuir para as pessoas

Suba o arquivo gerado (`.exe`, `.dmg` ou `.AppImage`) em algum lugar que
as pessoas possam baixar — um Release do GitHub é o mais comum e
gratuito (aba "Releases" > "Create a new release" > anexar os arquivos).
Depois é só mandar o link; a pessoa baixa e instala como qualquer outro
programa.

## Avisos importantes

- **O instalador não é assinado digitalmente.** Isso é normal para apps
  pequenos/independentes, mas o Windows (SmartScreen) e o Mac
  (Gatekeeper) vão mostrar um aviso de "editor desconhecido" na primeira
  abertura. A pessoa vai precisar clicar em "Mais informações > Executar
  assim mesmo" (Windows) ou liberar em Preferências > Segurança (Mac).
  Para remover esse aviso é preciso comprar um certificado de assinatura
  de código (pago, geralmente uns 70-400 USD/ano) — não é obrigatório
  para uso entre amigos.
- **O `firebase-config.js` já está preenchido com as chaves reais do seu
  projeto.** Isso é necessário para o app funcionar, mas significa que
  qualquer pessoa que instalar o app (ou olhar dentro do instalador)
  terá acesso a essas chaves. Como o README original avisa, o banco está
  em modo de teste (**leitura e escrita liberadas para qualquer um**) —
  isso é aceitável para testar com um grupo pequeno de confiança, mas
  antes de distribuir para muita gente vale a pena restringir as regras
  do Realtime Database (limitar tamanho/taxa de escrita, por exemplo).
- Chamadas de tela/voz continuam sendo conexão direta entre os
  participantes (WebRTC), então funcionam bem até uns 6–8 pessoas numa
  mesma chamada, igual na versão web.

## Arquivos deste pacote

| Arquivo | Papel |
|---|---|
| `main.js` | Processo principal do Electron (abre a janela, trata compartilhamento de tela) |
| `preload.js` | Isolamento de segurança da janela principal (vazio de propósito) |
| `picker.html` / `picker-preload.js` | Janela de escolha de tela/janela ao compartilhar |
| `package.json` | Config de build (nome do app, ícone, formato do instalador) |
| `app/` | O app original, sem alterações |
| `.github/workflows/build.yml` | Gera os 3 instaladores automaticamente no GitHub |
