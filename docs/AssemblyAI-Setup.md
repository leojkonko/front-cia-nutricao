# Configurando a Transcrição de Áudio com AssemblyAI

Este documento explica como configurar e usar a transcrição de áudio com a API da AssemblyAI em nosso aplicativo.

## O que é a AssemblyAI?

AssemblyAI é uma API avançada de reconhecimento de fala que oferece:

- Alta precisão de transcrição
- Suporte para múltiplos idiomas, incluindo Português
- Velocidade de processamento rápida
- Funcionalidades avançadas como diarização (reconhecimento de múltiplos falantes)
- Preços acessíveis com um nível gratuito

## Por que usar AssemblyAI?

Estamos usando a AssemblyAI porque:

1. A API Web Speech nativa do navegador apresentou problemas de precisão
2. AssemblyAI tem melhor suporte ao Português brasileiro
3. É mais confiável e menos dependente de condições específicas do navegador
4. Oferece recursos adicionais como resumo e análise de sentimento (opcional para uso futuro)

## Como obter uma chave de API da AssemblyAI

1. Visite o site da [AssemblyAI](https://www.assemblyai.com/)
2. Crie uma conta gratuita (pode usar Google, GitHub ou email/senha)
3. Após fazer login, vá para o Dashboard
4. Procure por "API Key" ou "API Token"
5. Copie a chave gerada

## Como configurar no nosso aplicativo

1. Abra o aplicativo
2. Clique no ícone de chave 🔑 no componente de transcrição de áudio
3. Cole sua chave de API no campo fornecido
4. Clique em "Salvar"

A chave será salva no localStorage do navegador, então você só precisa configurá-la uma vez por dispositivo.

## Limites da versão gratuita

- 5 horas de áudio por mês
- Taxa máxima de 44 requisições por minuto

Para a maioria dos usos de transcrição de produtos individuais, isso é mais que suficiente.

## Solução de problemas

Se a transcrição não funcionar como esperado:

1. **Verifique sua chave de API**: Certifique-se de que a chave foi salva corretamente
2. **Verifique o áudio**: Arquivos muito grandes podem demorar mais para processar
3. **Verifique sua conexão**: É necessária uma conexão à internet estável
4. **Limite excedido**: Se você ultrapassou o limite mensal, precisará de um plano pago

## Formatos de áudio suportados

- MP3
- WAV
- FLAC
- M4A
- AAC
- Outros formatos de áudio comuns

## Idiomas suportados

- Português (Brasil)
- Inglês (EUA, Reino Unido, Austrália)
- Espanhol
- Francês
- Alemão
- Italiano
- Entre outros (veja a documentação completa)

## Documentação oficial

Para mais informações, consulte a [documentação oficial da AssemblyAI](https://www.assemblyai.com/docs/).
