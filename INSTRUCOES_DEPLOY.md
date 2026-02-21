# Guia Completo de Publicação (Deploy)

Siga este passo a passo para colocar seu sistema de autenticação online gratuitamente.

## Fase 1: Colocar o código no GitHub

O GitHub é onde seu código ficará guardado. O Render (hospedagem) vai "ler" seu código de lá.

1.  **Baixe o seu código**:
    *   No editor onde você está, procure a opção de **Download** ou **Export** para baixar todos os arquivos do projeto para o seu computador.

2.  **Crie uma conta no GitHub** (se não tiver):
    *   Acesse [github.com](https://github.com) e crie sua conta gratuita.

3.  **Crie um Repositório**:
    *   No GitHub, clique no ícone **+** (canto superior direito) e selecione **"New repository"**.
    *   Nome do repositório: `sistema-autenticacao` (ou o que preferir).
    *   Deixe como **Public** (Público) ou **Private** (Privado) - ambos funcionam.
    *   Clique em **"Create repository"**.

4.  **Envie os arquivos**:
    *   Na tela do repositório criado, procure o link **"uploading an existing file"** (geralmente aparece se o repositório estiver vazio).
    *   Arraste todos os arquivos do seu projeto (que você baixou) para lá.
    *   **Importante:** Não envie a pasta `node_modules` (ela é muito pesada e será criada automaticamente pelo servidor).
    *   Escreva "Primeira versão" no campo "Commit changes" e clique no botão verde **"Commit changes"**.

## Fase 2: Configurar a Hospedagem no Render

O Render é um serviço de nuvem moderno e gratuito para hospedar aplicações web.

1.  **Crie uma conta no Render**:
    *   Acesse [render.com](https://render.com).
    *   Clique em **"Get Started for Free"**.
    *   Recomendo clicar em **"Sign up with GitHub"** (facilita a conexão).

2.  **Crie um Novo Serviço Web**:
    *   No painel (Dashboard), clique no botão **"New +"** e escolha **"Web Service"**.

3.  **Conecte seu Repositório**:
    *   Na lista "Connect a repository", encontre o `sistema-autenticacao` que você criou no GitHub.
    *   Clique em **"Connect"**.

4.  **Configure o Serviço** (Preencha exatamente assim):
    *   **Name:** `sistema-login-escolar` (ou outro nome único).
    *   **Region:** Escolha a mais próxima (ex: `Ohio (US East)` ou `Frankfurt (EU Central)`).
    *   **Branch:** `main` (ou `master`, o padrão do seu repo).
    *   **Root Directory:** (Deixe em branco).
    *   **Runtime:** Selecione **Node**.
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`
    *   **Instance Type:** Selecione **Free** (Gratuito).

5.  **Finalize**:
    *   Clique no botão **"Create Web Service"** no final da página.

## Fase 3: Aguardar e Testar

1.  O Render vai abrir uma tela preta (logs) mostrando o processo de instalação.
2.  Isso pode levar de 3 a 5 minutos.
3.  Quando terminar, você verá uma mensagem como "Your service is live".
4.  No topo da página, haverá um link (ex: `https://sistema-login-escolar.onrender.com`).
5.  Clique e teste!

---

### Dicas Importantes

*   **Demora no primeiro acesso:** No plano gratuito, se ninguém acessar o site por 15 minutos, ele "dorme". O próximo acesso pode levar uns 30 segundos para "acordar". Depois fica rápido.
*   **Atualizações:** Sempre que você mudar algo no código e enviar para o GitHub, o Render vai detectar e atualizar o site automaticamente!
