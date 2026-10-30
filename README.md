# Domfe TV

Canal institucional local da Associação Espírita Dom Feliciano, desenvolvido
em HTML, CSS e JavaScript moderno. A programação funciona em loop, com cenas
independentes, fundo contínuo, música ambiente e vídeos locais reproduzidos até o fim.

## Como iniciar

Não abra `index.html` diretamente.

### macOS

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
Os links permitem recuperação manual; o inicializador não baixa arquivos
automaticamente. Após o download, a reprodução funciona offline.

## Configuração

- `config/settings.json`: loop, transição, duração padrão e música;
- `config/playlist.json`: ordem, conteúdo e duração das cenas;
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

## Testes

Com Node.js instalado:

```bash
npm test
```

Os testes percorrem dois ciclos da playlist, verificam o comportamento sem loop,
validam a configuração e confirmam que cenas de vídeo nunca recebem temporizador.
