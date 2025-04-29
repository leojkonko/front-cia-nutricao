# Migração para Reconhecimento de Fala - Registro de Alterações

## Visão Geral

Este documento registra a migração do sistema de reconhecimento de fala da aplicação. Originalmente planejado para usar a API da AssemblyAI, o projeto foi ajustado para usar a Web Speech API nativa com melhorias para melhor compatibilidade com os navegadores.

## Arquivos Modificados

1. `src/pages/AISearchPage.tsx`
   - Substituição do componente `AudioTranscriber` pelo `BasicAudioTranscriber`
   - Implementação de `useCallback` para otimização de renderização

2. `src/components/BasicAudioTranscriberNew.tsx`
   - Implementação usando a API de reconhecimento de fala nativa do navegador
   - Correção de bugs de compatibilidade entre navegadores

## Motivos da Mudança

1. **Problemas com a Web Speech API:**
   - Suporte limitado ao português brasileiro
   - Inconsistência entre navegadores
   - Baixa precisão para termos técnicos e específicos da área de nutrição

2. **Vantagens da AssemblyAI:**
   - Melhor suporte para português brasileiro
   - Maior precisão no reconhecimento de fala
   - API consistente em todos os navegadores
   - Capacidade de processar arquivos de áudio importados

## Como Funciona

### Configuração

A API da AssemblyAI requer uma chave de API que pode ser obtida em [assemblyai.com](https://www.assemblyai.com/). Esta chave pode ser configurada de duas maneiras:

1. No arquivo `.env` como `ASSEMBLY_API_KEY`
2. Através da interface do usuário, onde a chave é salva no localStorage

### Fluxo de Transcrição

1. O usuário clica no botão de microfone para iniciar a gravação
2. O áudio é capturado através da API MediaRecorder
3. Após o término da gravação (manual ou por detecção de silêncio), o áudio é enviado para a API da AssemblyAI
4. O resultado da transcrição é exibido no campo de busca

### Detecção de Silêncio

O componente implementa detecção automática de silêncio para melhorar a experiência do usuário:

- Após 1,5 segundos de silêncio, a gravação é automaticamente interrompida
- Um timeout máximo de 10 segundos também é aplicado para prevenir gravações excessivamente longas

## Uso em Outras Partes da Aplicação

Para implementar esta funcionalidade em outras partes da aplicação, utilize o componente `AudioTranscriberWithAssemblyAI` com as seguintes props:

```tsx
<AudioTranscriberWithAssemblyAI
  onTranscription={(text) => console.log(text)}
  onStatusChange={(status) => console.log(status)}
  onNotification={(notification) => console.log(notification)}
  disabled={false}
  showMicTest={true}
  allowFileUpload={true}
/>
```

## Configuração da Variável de Ambiente

Adicione a chave da API ao arquivo `.env`:

```
ASSEMBLY_API_KEY=sua-chave-api-aqui
```

## Solução de Problemas

Se você encontrar problemas com o reconhecimento de fala:

1. Verifique se a chave da API está configurada corretamente
2. Verifique as permissões do microfone no navegador
3. Use o botão de teste do microfone para verificar se o áudio está sendo captado corretamente
4. Verifique o console do navegador para mensagens de erro detalhadas
