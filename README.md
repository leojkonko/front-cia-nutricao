# Cia da Nutrição - Frontend

Sistema de gerenciamento de produtos nutricionais com reconhecimento de voz avançado usando AssemblyAI.

## Recursos Principais

- Cadastro e gerenciamento de produtos
- Busca por voz com AssemblyAI
- Consulta de informações via IA
- Interface responsiva e intuitiva

## Tecnologias Utilizadas

- React com TypeScript
- Vite
- Tailwind CSS
- AssemblyAI para reconhecimento de fala

## Reconhecimento de Voz com AssemblyAI

O sistema utiliza a API da AssemblyAI para reconhecimento de fala, proporcionando:

- Maior precisão no português brasileiro
- Melhor reconhecimento de termos técnicos
- Funcionamento consistente em todos os navegadores
- Capacidade de processamento de arquivos de áudio

### Configuração da API

Para utilizar a funcionalidade de reconhecimento de voz, é necessário configurar uma chave da API da AssemblyAI:

1. Crie uma conta em [AssemblyAI](https://www.assemblyai.com/)
2. Obtenha sua chave de API no painel de controle
3. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
VITE_ASSEMBLY_API_KEY=sua_chave_da_api_aqui
```

> **Importante**: No Vite, todas as variáveis de ambiente que devem ser expostas no cliente precisam ter o prefixo `VITE_`. 
> A aplicação buscará pela variável `VITE_ASSEMBLY_API_KEY` no ambiente.

### Scripts de Diagnóstico

O projeto inclui scripts para ajudar a diagnosticar problemas com variáveis de ambiente:

- `check-env-vars.ps1`: Verifica se as variáveis de ambiente estão configuradas corretamente
- `test-production-env.ps1`: Testa se as variáveis de ambiente estão sendo incluídas na build de produção

1. Obtenha uma chave gratuita em [assemblyai.com](https://www.assemblyai.com/)
2. Configure a chave no arquivo `.env`:
   ```
   ASSEMBLY_API_KEY=sua-chave-api-aqui
   ```

Para mais informações sobre a implementação, consulte a documentação em:
- `/docs/AssemblyAI-Setup.md`
- `/docs/AssemblyAI-Migration.md`
- `/docs/AssemblyAI-Integration-Report.md`

## Iniciando o Projeto

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure a chave da API da AssemblyAI (opcional, mas necessário para o reconhecimento de voz)
4. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Estrutura do Projeto

- `/src/components` - Componentes reutilizáveis
- `/src/pages` - Páginas da aplicação
- `/src/services` - Serviços para APIs externas
- `/src/layouts` - Layouts compartilhados
- `/src/utils` - Funções utilitárias
- `/docs` - Documentação adicional
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
