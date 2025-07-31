# CarroApp - Sistema de Gestão para Concessionárias

## Descrição

CarroApp é um aplicativo React Native desenvolvido com Expo para gestão de veículos em concessionárias. O aplicativo oferece funcionalidades completas para cadastro, visualização, edição e exclusão de veículos, com sistema de autenticação e filtros avançados.

## Funcionalidades

### 🔐 Autenticação

- Login com usuário e senha
- Sistema de token seguro
- Logout com confirmação

### 🚗 Gestão de Veículos

- **Lista de Veículos**: Visualização em cards com informações principais
- **Detalhes**: Tela completa com todas as informações e galeria de fotos
- **Cadastro/Edição**: Formulário completo com validações
- **Exclusão**: Individual ou em massa

### 🔍 Filtros Avançados

- Filtro por nome/modelo
- Filtro por placa
- Faixa de quilometragem
- Faixa de preço
- Tipo de veículo
- Ano de fabricação e modelo
- Combustível
- Cor
- Quantidade
- Observações

### 📱 Funcionalidades do App

- **Seleção Múltipla**: Para operações em massa
- **Pull to Refresh**: Atualização da lista
- **Galeria de Fotos**: Até 5 fotos por veículo
- **Design Responsivo**: Interface profissional e minimalista

## Estrutura de Dados

Cada veículo contém as seguintes informações:

- **ID**: Identificador único
- **Nome/Modelo**: Nome ou modelo do veículo
- **Placa**: Placa do veículo
- **Quilometragem**: KM rodados
- **Preço**: Valor do veículo
- **Fotos**: Até 5 fotos (foto1 obrigatória)
- **Tipo**: Sedan, SUV, Hatch, etc.
- **Ano de Fabricação**: Ano que foi fabricado
- **Ano do Modelo**: Ano do modelo
- **Combustível**: Flex, Gasolina, Diesel, etc.
- **Cor**: Cor do veículo
- **Observação**: Informações adicionais
- **Quantidade**: Quantidade em estoque

## Integração com Backend (n8n)

O aplicativo está preparado para integração com n8n através de webhooks. Todos os endpoints estão configurados como placeholders:

### Endpoints Configurados

```typescript
const API_ENDPOINTS = {
  login: "placeholderlogin",
  fetchVehicles: "placeholderfetchvehicles",
  createVehicle: "placeholdercreatevehicle",
  updateVehicle: "placeholderupdatevehicle",
  deleteVehicle: "placeholderdeletevehicle",
  bulkUpdate: "placeholderbulkupdate",
  bulkDelete: "placeholderbulkdelete",
};
```

### Como Configurar os Endpoints

1. Substitua a URL base no arquivo `src/services/apiService.ts`
2. Substitua cada placeholder pelo endpoint real do n8n
3. Configure os workflows no n8n para cada operação

## Instalação e Execução

### Pré-requisitos

- Node.js (versão 18 ou superior)
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### Instalação

```bash
# Clone ou navegue para o diretório do projeto
cd CarroApp

# Instale as dependências
npm install

# Execute o projeto
npm start
```

### Executar em Dispositivos

```bash
# Android
npm run android

# iOS (apenas no macOS)
npm run ios

# Web
npm run web
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── VehicleCard.tsx     # Card do veículo na lista
│   ├── FilterDrawer.tsx    # Drawer de filtros
│   └── index.ts           # Exports dos componentes
├── contexts/            # Contextos React
│   └── AuthContext.tsx    # Contexto de autenticação
├── screens/             # Telas do aplicativo
│   ├── LoginScreen.tsx        # Tela de login
│   ├── VehicleListScreen.tsx  # Lista de veículos
│   ├── VehicleFormScreen.tsx  # Formulário de veículo
│   ├── VehicleDetailsScreen.tsx # Detalhes do veículo
│   └── index.ts              # Exports das telas
├── services/            # Serviços e APIs
│   └── apiService.ts       # Serviço de comunicação com API
└── types/               # Definições de tipos TypeScript
    └── index.ts            # Tipos do projeto
```

## Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma de desenvolvimento
- **TypeScript**: Tipagem estática
- **React Navigation**: Navegação entre telas
- **AsyncStorage**: Armazenamento local
- **Expo Image Picker**: Seleção de imagens
- **React Native Vector Icons**: Ícones

## Customização

### Cores e Temas

As cores principais podem ser alteradas nos arquivos de estilo. A cor primária atual é `#810CD2` (roxo Sintese).

### Campos do Formulário

Para adicionar novos campos, edite:

1. Interface `Vehicle` em `src/types/index.ts`
2. Componente `VehicleFormScreen` para o formulário
3. Componente `VehicleCard` para exibição na lista
4. Componente `FilterDrawer` para filtros (se necessário)

### Validações

As validações estão centralizadas na função `validateForm()` do `VehicleFormScreen`.

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Faça um push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto.
