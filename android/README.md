# App Android (APK) com Bubblewrap

Esta pasta gera um APK que abre o app publicado em
`https://lucaslimao0254.github.io/Calculadora-combustivel/` como um app Android em tela cheia
(Trusted Web Activity, ou TWA). O APK não leva uma cópia do código: ele abre o site, e as
atualizações publicadas no GitHub Pages chegam sozinhas. O app funciona sem internet depois do
primeiro acesso, pelo service worker.

- **Ferramenta:** [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) 1.27.0, do Google (via `npx`, sem instalar nada global).
- **Configuração:** `twa-manifest.json` (nome, cores, ícones, pacote `io.github.lucaslimao0254.calculadora`).
- **Dados:** o app Android usa o armazenamento do Chrome do aparelho, o mesmo do site. Se o celular já tem os reajustes no site, eles aparecem no app.

## Pré-requisitos (uma vez só)

| Item | Para quê | Tamanho aproximado |
|---|---|---|
| Java JDK 17 (Eclipse Temurin) | Compilar o projeto Android | ~190 MB |
| Android SDK (command-line tools + build-tools 36.1.0 + platform) | Gerar e assinar o APK | ~600 MB a 1 GB |

O Bubblewrap oferece baixar os dois na primeira execução e guarda o caminho em
`%USERPROFILE%\.bubblewrap\config.json`. Na instalação do SDK ele pede para você **aceitar a licença do
Android SDK**: essa resposta é sua.

## Passo a passo

Rode os comandos na raiz do repositório (`C:\dev\calculadora-combustivel`).

1. **Conferir e instalar as ferramentas.** Responda "Yes" para baixar o JDK e o SDK, e aceite a licença:
   ```bash
   npm run android:doctor
   ```

2. **Criar a chave de assinatura** (uma vez só). Escolha e anote as senhas: sem essa chave não dá para
   publicar atualizações do mesmo app.
   ```bash
   keytool -genkeypair -v -keystore android/android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
   ```
   O `keytool` vem com o JDK, em `%USERPROFILE%\.bubblewrap\jdk\...\bin`. O arquivo `android.keystore`
   fica fora do Git (`.gitignore`). **Guarde uma cópia dele e das senhas em lugar seguro.**

3. **Gerar o projeto Android** a partir de `twa-manifest.json`:
   ```bash
   npm run android:update
   ```

4. **Compilar o APK.** O Bubblewrap pede as senhas da chave:
   ```bash
   npm run android:build
   ```
   Saídas em `android/`:
   - `app-release-signed.apk`: para instalar direto no celular;
   - `app-release-bundle.aab`: para a Google Play, se um dia for publicar.

5. **Instalar no celular:** mande o `app-release-signed.apk` para o aparelho, abra e permita "instalar apps
   desconhecidos" quando o Android pedir. Com o cabo USB e a depuração ativada, também dá para usar
   `npx @bubblewrap/cli install`.

## Tirar a barra de endereço (opcional)

Sem a verificação de domínio, o app funciona, mas mostra uma barra fina com o endereço no topo. Para
removê-la, o Android precisa encontrar `https://lucaslimao0254.github.io/.well-known/assetlinks.json`
na **raiz** do domínio. Como o app está em `/Calculadora-combustivel/`, o arquivo precisa de outro
repositório:

1. Gere o arquivo com a impressão digital da sua chave:
   ```bash
   npm run android:assetlinks
   ```
2. Crie o repositório público `lucaslimao0254.github.io`, com o arquivo em `.well-known/assetlinks.json`
   e um arquivo `.nojekyll` na raiz (sem ele, o GitHub Pages ignora pastas que começam com ponto).
3. Ative o GitHub Pages nesse repositório. Depois que o arquivo estiver no ar, desinstale e reinstale o APK.

## Atualizar o app Android

- **Mudanças no app** (telas, cálculos): basta publicar no GitHub Pages. O APK abre a versão nova.
- **Mudanças no nome, ícone ou cores do APK:** edite `twa-manifest.json`, aumente `appVersionCode` e
  `appVersion`, rode `npm run android:update` e `npm run android:build` de novo, com a **mesma** chave.
