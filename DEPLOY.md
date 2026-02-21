# Guia de Implantação (Deployment)

Este projeto está pronto para ser colocado online. A maneira mais fácil e gratuita para este tipo de aplicação (Node.js + React) é usar o **Render** ou **Railway**.

## Opção Recomendada: Render (Gratuito)

O Render possui um plano gratuito para serviços web que é perfeito para este projeto.

### Passo 1: Publicar no GitHub
1. Crie uma conta no [GitHub](https://github.com) se não tiver.
2. Crie um novo repositório (pode ser público ou privado).
3. Envie este código para o repositório.

### Passo 2: Configurar no Render
1. Crie uma conta no [Render](https://render.com).
2. No painel, clique em **"New +"** e selecione **"Web Service"**.
3. Conecte sua conta do GitHub e selecione o repositório que você criou.
4. Preencha os seguintes campos:
   - **Name:** (Escolha um nome para seu app)
   - **Region:** (Escolha a mais próxima, ex: Ohio ou Frankfurt)
   - **Branch:** `main` (ou a branch que você usou)
   - **Root Directory:** (Deixe em branco)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Role para baixo e selecione o plano **"Free"**.
6. Clique em **"Create Web Service"**.

O Render vai começar a construir seu projeto. Pode levar alguns minutos. Quando terminar, ele te dará uma URL (ex: `seu-app.onrender.com`) onde seu sistema estará funcionando!

### Observação sobre o Plano Gratuito
No plano gratuito do Render, o serviço "dorme" após 15 minutos de inatividade. O primeiro acesso depois disso pode demorar cerca de 30-60 segundos para carregar. Para testes e uso pessoal, isso geralmente não é um problema.

## Variáveis de Ambiente (Opcional)
Se você precisar definir variáveis de ambiente (como chaves de API), você pode fazer isso na aba "Environment" nas configurações do seu serviço no Render.

---

## Estrutura do Projeto
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express (no arquivo `server.ts`)
- **Autenticação:** Validação via planilha do Google Sheets (CSV)
