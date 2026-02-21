# Guia de Publicação no GitHub Pages (Gratuito)

Siga este passo a passo para colocar seu sistema online usando apenas o GitHub.

## Passo 1: Criar o Repositório no GitHub
1. Acesse [github.com](https://github.com) e faça login.
2. Crie um novo repositório (botão **New**).
3. Nomeie como `sistema-login` (ou o que preferir).
4. Deixe como **Public**.
5. Clique em **Create repository**.

## Passo 2: Enviar os Arquivos
1. Baixe os arquivos deste projeto para seu computador.
2. Na página do seu repositório no GitHub, clique em **uploading an existing file**.
3. Arraste todos os arquivos do projeto (exceto a pasta `node_modules`).
4. Clique em **Commit changes**.

## Passo 3: Configurar o GitHub Pages
1. No seu repositório, vá em **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Source**, selecione **Deploy from a branch**.
4. Em **Branch**, selecione `main` (ou `master`) e a pasta `/ (root)`.
5. Clique em **Save**.

## Passo 4: Aguardar a Publicação
1. O GitHub vai começar a construir seu site. Isso pode levar alguns minutos.
2. Atualize a página **Pages** após uns 2 minutos.
3. Você verá uma mensagem: "Your site is live at..." com o link do seu sistema!

---

### Importante sobre Segurança
Como estamos usando uma solução 100% Client-Side (sem servidor backend), a URL da sua planilha Google Sheets ficará visível no código-fonte da página (Inspecionar Elemento).
- **Risco:** Alguém com conhecimento técnico pode pegar essa URL e ver a lista completa de alunos.
- **Mitigação:** Como a planilha já é pública (link de compartilhamento), isso não aumenta o risco que já existia. Apenas tenha ciência disso.
