# AGENTS.md — Domfe TV

## Objetivo

A Domfe TV é uma aplicação web local, em HTML, CSS e JavaScript,
usada antes das exposições públicas da Associação Espírita Dom Feliciano.

A aplicação deve acolher, informar e apresentar conteúdos doutrinários
em uma programação contínua.

## Princípios visuais

- Aparência institucional, moderna, serena e acolhedora.
- Nada deve parecer uma apresentação de PowerPoint.
- Usar bastante espaço em branco.
- Usar azul institucional, branco e cinza claro.
- Manter fontes grandes e de alto contraste.
- Projetar pensando em idosos e pessoas com dificuldades visuais.
- Evitar animações rápidas, giros, bounce, flip ou efeitos chamativos.
- Usar somente fade, dissolve, blur leve e zoom discreto.
- A fachada da Domfe pode aparecer como marca-d'água discreta.

## Identidade

Nome: Domfe TV

Slogan:
Acolhimento • Estudo • Vivência

Na vinheta:
- O logotipo institucional da Domfe deve ficar centralizado.
- O logotipo menor da Domfe TV deve ficar no canto superior direito.
- O logo da Domfe TV deve usar um ícone moderno de tela com play,
  sem antenas.

## Regras de funcionamento

- A programação deve funcionar em loop.
- Vídeos nunca devem ser interrompidos por temporizadores.
- Uma cena de vídeo deve avançar somente quando o vídeo terminar
  ou quando houver erro irrecuperável.
- A música deve diminuir e pausar antes de vídeos com áudio.
- Após o vídeo, a música deve retornar com fade.
- Todo o conteúdo institucional deve funcionar offline.
- Não depender do YouTube para a versão usada na associação.
- Compatibilidade obrigatória com macOS e Windows.
- Não exigir que o usuário abra diretamente o index.html.

## Arquitetura

- HTML5, CSS3 e JavaScript moderno.
- Evitar frameworks na versão inicial.
- Configuração e playlist em JSON.
- Cada cena deve ser um componente independente.
- O fundo deve permanecer contínuo entre as cenas.
- Não duplicar temporizadores ou listeners.
- Limpar timers, eventos e mídia ao sair de uma cena.

## Tamanhos mínimos

- Títulos principais: 72px ou maiores em Full HD.
- Textos: 38px ou maiores.
- Informações secundárias: 28px ou maiores.
- Evitar blocos longos de texto.

## Antes de concluir qualquer tarefa

- Executar a aplicação localmente.
- Testar o ciclo completo da playlist.
- Confirmar que vídeos não são cortados.
- Verificar erros no console.
- Testar em viewport 1920×1080.
- Atualizar o histórico de versões quando houver alteração relevante.
