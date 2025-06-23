# 🚀 Deploy em Produção - Cia da Nutrição

## 📋 Pré-requisitos
- Node.js 18+ instalado
- Conta no GitHub (recomendado)
- Projeto commitado no Git

## 🎯 Opção 1: Vercel (Recomendado)

### Passo a passo:
1. **Prepare o projeto**
   ```bash
   npm run build:prod
   npm run preview  # teste local
   ```

2. **Acesse vercel.com**
   - Faça login com GitHub
   - Clique em "New Project"
   - Selecione este repositório

3. **Configurações automáticas**
   - Framework: Vite (detectado automaticamente)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Variáveis de ambiente**
   - Adicione no painel da Vercel:
   ```
   VITE_AI_SEARCH_URL=https://uolibot.app.n8n.cloud/webhook/chatbot
   VITE_ASSEMBLY_API_KEY=ca9ec190a5c742c1b0b12fa9bf53a411
   ```

5. **Deploy**
   - Clique em "Deploy"
   - URL: `https://seu-projeto.vercel.app`

## 🎯 Opção 2: Netlify

### Passo a passo:
1. **Build local**
   ```bash
   npm run build:prod
   ```

2. **Deploy via drag & drop**
   - Acesse netlify.com
   - Arraste a pasta `dist` para o deploy
   - OU conecte via GitHub

3. **Configurar variáveis**
   - Site Settings → Environment Variables
   - Adicione as mesmas variáveis

## 🎯 Opção 3: GitHub Pages

### Passo a passo:
1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Atualizar package.json**
   ```json
   {
     "homepage": "https://seu-usuario.github.io/cia-nutricao",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Build de Produção Local

Para testar localmente antes do deploy:

```bash
# Build de produção
npm run build:prod

# Testar build localmente
npm run start

# Abrir: http://localhost:4173
```

## ⚠️ Checklist Antes do Deploy

- [ ] Teste todas as funcionalidades localmente
- [ ] Verifique se o webhook n8n está funcionando
- [ ] Teste a busca por voz
- [ ] Confirme as variáveis de ambiente
- [ ] Teste em diferentes navegadores

## 🌐 URLs de Produção Sugeridas

- **Vercel**: `https://cia-nutricao-ai.vercel.app`
- **Netlify**: `https://cia-nutricao-ai.netlify.app`
- **GitHub Pages**: `https://seu-usuario.github.io/cia-nutricao`

## 🎯 Recomendação Final

**Use a Vercel** - é a opção mais simples e robusta para projetos React/Vite!