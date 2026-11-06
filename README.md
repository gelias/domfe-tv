# Domfe TV

Canal institucional local da Associação Espírita Dom Feliciano, desenvolvido
em HTML, CSS e JavaScript moderno. A programação funciona em loop, com cenas
independentes, fundo contínuo, música ambiente e vídeos locais reproduzidos até o fim.

## Como iniciar

Não abra `index.html` diretamente.

### Aplicativo Windows — versão portátil

Baixe `Domfe-TV-2.3.3-windows-x64.exe`, coloque-o em uma pasta própria
(por exemplo, `Documentos/Domfe TV`) e dê dois cliques. Não é necessário
instalar Python, Node.js ou configurar um navegador.

Na primeira abertura, o aplicativo confere e baixa automaticamente a música e
o vídeo, com cerca de 266 MB no total. Mantenha a conexão até concluir e clique
em **Iniciar programação**. Nas próximas aberturas, as mídias válidas são
reutilizadas e a programação funciona offline. Downloads interrompidos ou
inválidos podem ser repetidos pelo botão **Tentar novamente**; arquivos
incompletos nunca são usados na reprodução.

As mídias ficam em `assets/audio/` e `assets/video/`, ao lado do `.exe`.
Se essa pasta não permitir escrita, o aplicativo usa
`%APPDATA%/Domfe TV/assets/`. Para mover a versão portátil sem baixar novamente,
copie o executável junto com a pasta `assets`. Atualizar apenas o executável
preserva as mídias que continuam correspondendo ao manifesto.

O pacote inicial é para Windows x64. Esta primeira versão não tem assinatura
digital; o Windows pode exibir uma indicação de aplicativo não reconhecido.
O executável e seu checksum ficam disponíveis na página de
[Releases do projeto](https://github.com/gelias/domfe-tv/releases). Baixe o `.exe`
da versão desejada. Os arquivos **Source code** são destinados a desenvolvimento.

### Aplicativo macOS — Apple Silicon (M1 ou posterior)

Baixe `Domfe-TV-2.3.3-mac-arm64.zip` em [Releases](https://github.com/gelias/domfe-tv/releases),
extraia o ZIP e mova **Domfe TV.app** para uma pasta própria ou para Aplicativos.
Abra o aplicativo e mantenha a internet até concluir a preparação das mídias.
Não requer Python ou Node.js. As próximas aberturas funcionam offline.
As mídias ficam na pasta `assets` ao lado do aplicativo; se não houver permissão,
o aplicativo usa a pasta de dados do usuário.

Este pacote não é assinado nem notarizado pela Apple. Se o macOS bloquear a
abertura, após conferir a origem e o checksum, use **Ajustes do Sistema →
Privacidade e Segurança → Abrir Mesmo Assim**. Não desative o Gatekeeper.
O pacote é exclusivo para Apple Silicon; Macs Intel não são suportados por ele.

### macOS — inicializador Python (código-fonte)

Dê dois cliques em `INICIAR-DOMFE-TV-MACOS.command`.

Se o macOS bloquear a primeira abertura, clique com o botão direito no arquivo,
selecione **Abrir** e confirme. O inicializador requer Python 3.

### Windows

Dê dois cliques em `INICIAR-DOMFE-TV-WINDOWS.bat`. O inicializador procura por
`py -3` ou `python` e requer Python 3 instalado.

## Conteúdo local obrigatório

Antes do uso na associação, copie os arquivos autorizados:

- `assets/audio/instrumental.mp3` — música instrumental de fundo;
- `assets/video/evangelho-no-lar.mp4` — vídeo local integral;
- programação mensal em `config/playlist.json`, nas cenas `agenda` com `entries`.

Para atualizar a programação mensal atual, edite as cinco cenas semanais em
`config/playlist.json`, com datas, horários, temas e expositores. Os PNGs em
`content/agenda/` permanecem como material de referência. A descoberta automática
de PNGs pelo inicializador continua disponível para cenas com
`"dynamicSource": "content/agenda"`.

Esta cópia local inclui o instrumental e o vídeo autorizado. Se o vídeo estiver
ausente ou corrompido, a cena avança por evento de erro, sem usar temporizador.
A versão operacional não depende do YouTube nem de internet.

Em um novo clone, as mídias pesadas não são incluídas pelo Git. Se estiverem
ausentes, abra os links em `assets/audio/download.txt` e
`assets/video/download.txt` e salve os arquivos nos caminhos indicados acima.
O Google Drive pode solicitar **Fazer download mesmo assim** para o instrumental.
Os links permitem recuperação manual nos inicializadores Python; o aplicativo
desktop faz a recuperação automaticamente. Após o download, a reprodução
funciona offline.

## Configuração

- `config/settings.json`: loop, transição, duração padrão e música;
- `config/playlist.json`: ordem, conteúdo e duração das cenas;
- `config/media-manifest.json`: origem, tamanho e SHA-256 das mídias do aplicativo desktop;
- `content/agenda/`: PNGs de referência e fonte opcional para cenas com `dynamicSource`.

Cenas comuns usam `duration` em segundos. Cenas `video` não aceitam duração:
o motor avança apenas quando o elemento emite `ended` ou `error`.

Os volumes são ajustados em `config/settings.json`, de 0 a 1: `music.volume`
controla a trilha e `video.volume` controla os vídeos. Para os arquivos locais
atuais, a trilha usa 0,8 e o vídeo 0,33 para aproximar o volume percebido.
Ao substituir as mídias, confira novamente esse equilíbrio. Os fades da trilha
continuam ativos antes e depois dos vídeos.

## Controles

- seta direita: próxima cena;
- seta esquerda: cena anterior;
- espaço: pausar ou continuar;
- `M`: silenciar ou ativar som;
- `F`: entrar ou sair da tela cheia.

## Arquitetura

- `src/core/playlist-engine.js`: estado, loop e temporizadores;
- `src/core/audio-manager.js`: fades canceláveis e estado do áudio;
- `src/core/config-loader.js`: carregamento e validação do JSON;
- `src/scenes/`: componentes independentes;
- `src/app.js`: integração entre interface, motor, cenas e áudio.

Cada cena devolve um controlador com operações de pausa, retomada, mute e
descarte. Ao sair, timers, listeners e elementos de mídia são limpos.

## Desenvolvimento e pacote desktop

Com Node.js 24 ou superior:

```bash
npm ci
npm run desktop
```

O aplicativo reutiliza a interface e as cenas existentes. Um protocolo local
serve os arquivos e as faixas de áudio/vídeo sem depender do servidor Python.
O acesso ao sistema de arquivos e os downloads ficam no processo principal;
a interface recebe somente o progresso e a operação de preparação das mídias.

Para gerar o executável portátil no Windows:

```bash
npm run check
npm run desktop:windows
```

O resultado fica em `dist/`. O áudio e o vídeo não são incluídos no pacote.
O workflow `.github/workflows/desktop.yml` executa os testes e gera esse pacote
em um runner Windows quando iniciado manualmente ou ao enviar uma tag `v*`.
Tags `v*` também publicam o executável e seu checksum no GitHub Releases;
execuções manuais geram somente artefatos de teste. O workflow também gera um ZIP macOS arm64 e verifica a abertura do aplicativo
empacotado em um runner Apple Silicon. A reprodução e a primeira abertura com
Gatekeeper ainda precisam ser conferidas no Mac de destino. Linux permanece
configurado para trabalhos futuros.

Ao trocar uma mídia, atualize o link de recuperação e o `fileId`, o número de
bytes e o SHA-256 no manifesto. O compartilhamento no Drive deve permitir
download sem login. O aplicativo verifica o conteúdo em cada inicialização e
só substitui a mídia depois de receber um arquivo completo com checksum válido.

## Testes

Com Node.js instalado:

```bash
npm test
```

Os testes percorrem dois ciclos da playlist, verificam o comportamento sem loop,
validam a configuração e confirmam que cenas de vídeo nunca recebem temporizador.
