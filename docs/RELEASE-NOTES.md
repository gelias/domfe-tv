## Domfe TV 2.3.0 — Windows portátil

### Como usar

1. Baixe **Domfe-TV-2.3.0-windows-x64.exe** nos arquivos desta Release.
2. Coloque o executável em uma pasta própria, como `Documentos/Domfe TV`.
3. Dê dois cliques. Não é necessário instalar Python ou Node.js.
4. Na primeira abertura, mantenha a conexão com a internet enquanto o aplicativo prepara a música e o vídeo (aproximadamente 266 MB).
5. Clique em **Iniciar programação**. As próximas execuções funcionam offline.

### Novidades

- Aplicativo com janela própria e identidade visual da Domfe.
- Download automático de mídias ausentes ou inválidas, com progresso e opção de tentar novamente.
- Verificação SHA-256 antes da reprodução; downloads incompletos não são utilizados.
- Mídias salvas na pasta `assets` ao lado do executável. Se a pasta não permitir escrita, usa `%APPDATA%/Domfe TV/assets`.
- Programação em loop, vídeo integral e transições de áudio preservados.

### Compatibilidade e observações

- Primeiro pacote destinado a **Windows 10/11 x64**; requer teste de abertura e reprodução no computador de destino.
- Executável sem assinatura digital nesta versão; o Windows pode indicar que o aplicativo não é reconhecido.
- Para mover a instalação portátil sem repetir os downloads, copie o `.exe` e a pasta `assets` juntos.
- O arquivo `.sha256` permite conferir a integridade do executável. Os arquivos **Source code** gerados pelo GitHub são destinados a desenvolvimento; para executar, baixe o `.exe`.
