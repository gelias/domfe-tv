## Domfe TV 2.3.3 — Windows e Mac Apple Silicon

### Como usar

1. Baixe **Domfe-TV-2.3.3-windows-x64.exe** nos arquivos desta Release.
2. Coloque o executável em uma pasta própria, como `Documentos/Domfe TV`.
3. Dê dois cliques. Não é necessário instalar Python ou Node.js.
4. Na primeira abertura, mantenha a conexão com a internet enquanto o aplicativo prepara a música e o vídeo (aproximadamente 266 MB).
5. Clique em **Iniciar programação**. As próximas execuções funcionam offline.

### macOS — Apple Silicon

1. Baixe **Domfe-TV-2.3.3-mac-arm64.zip** (M1 ou posterior; não serve para Intel).
2. Extraia e mova **Domfe TV.app** para uma pasta própria ou Aplicativos.
3. Abra e aguarde a preparação das mídias; não requer Python ou Node.js.
4. Se o macOS bloquear, confira a origem e o checksum e use **Ajustes do Sistema → Privacidade e Segurança → Abrir Mesmo Assim**. O aplicativo não é assinado nem notarizado pela Apple. Não desative o Gatekeeper.
5. Clique em **Iniciar programação**. Depois da preparação, funciona offline.

### Novidades

- Programação de novembro de 2026 atualizada conforme a escala oficial: 17 datas e 22 palestras em cinco semanas.
- Inclui a Palestra Musical Espírita do Coral Semeadores da Luz em 13/11 e as duas palestras de cada segunda-feira.

- Aplicativo com janela própria e identidade visual da Domfe.
- Download automático de mídias ausentes ou inválidas, com progresso e opção de tentar novamente.
- Verificação SHA-256 antes da reprodução; downloads incompletos não são utilizados.
- Mídias salvas na pasta `assets` ao lado do executável. Se a pasta não permitir escrita, usa `%APPDATA%/Domfe TV/assets`.
- Programação em loop, vídeo integral e transições de áudio preservados.

### Compatibilidade e observações

- Pacotes para **Windows 10/11 x64** e **macOS Apple Silicon**; requerem conferência da reprodução no computador de destino.
- Executável sem assinatura digital nesta versão; o Windows pode indicar que o aplicativo não é reconhecido.
- Para mover a instalação portátil sem repetir os downloads, copie o `.exe` e a pasta `assets` juntos.
- O arquivo `.sha256` permite conferir a integridade do executável. Os arquivos **Source code** gerados pelo GitHub são destinados a desenvolvimento; para executar, baixe o `.exe` (Windows) ou o ZIP `mac-arm64` (Mac).
