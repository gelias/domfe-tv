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
- cards mensais em `content/agenda/`, usando os nomes `mes.png`,
  `semana1.png`, `semana2.png` e assim por diante.

Para atualizar a programação mensal, substitua `mes.png` e os arquivos de semana
pelos novos PNGs. Apague arquivos de semanas que não existirem no novo mês. A
Domfe TV detecta os arquivos ao iniciar, exibe `mes.png` primeiro e depois somente
as semanas disponíveis, em ordem numérica. Não é necessário editar o JSON nem o
código da aplicação.

Esta cópia local inclui o instrumental e o vídeo autorizado. Se o vídeo estiver
ausente ou corrompido, a cena avança por evento de erro, sem usar temporizador.
A versão operacional não depende do YouTube nem de internet.

## Configuração

- `config/settings.json`: loop, transição, duração padrão e música;
- `config/playlist.json`: ordem, conteúdo e duração das cenas;
- `content/agenda/`: programação mensal descoberta automaticamente pelo inicializador.

Cenas comuns usam `duration` em segundos. Cenas `video` não aceitam duração:
o motor avança apenas quando o elemento emite `ended` ou `error`.

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
