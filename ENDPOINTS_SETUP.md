# Guia de Configuração dos Endpoints

## Configuração dos Endpoints no n8n

Para conectar o aplicativo ao seu backend n8n, você precisa substituir os endpoints placeholder pelos URLs reais dos seus webhooks.

### Arquivo a ser editado: `src/services/apiService.ts`

Localize a seguinte seção:

```typescript
// Endpoints placeholder - substitua pelos endpoints reais do n8n
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

### 1. URL Base

Primeiro, substitua a URL base:

```typescript
private baseURL = 'https://seu-n8n-instance.com/webhook';
```

### 2. Endpoints Individuais

Substitua cada placeholder pelo endpoint real do n8n:

```typescript
const API_ENDPOINTS = {
  login: "auth/login",
  fetchVehicles: "vehicles/list",
  createVehicle: "vehicles/create",
  updateVehicle: "vehicles/update",
  deleteVehicle: "vehicles/delete",
  bulkUpdate: "vehicles/bulk-update",
  bulkDelete: "vehicles/bulk-delete",
};
```

### Exemplo de Configuração Completa:

```typescript
private baseURL = 'https://sua-instancia.n8n.cloud/webhook';

const API_ENDPOINTS = {
  login: 'carroapp/auth/login',
  fetchVehicles: 'carroapp/vehicles/list',
  createVehicle: 'carroapp/vehicles/create',
  updateVehicle: 'carroapp/vehicles/update',
  deleteVehicle: 'carroapp/vehicles/delete',
  bulkUpdate: 'carroapp/vehicles/bulk-update',
  bulkDelete: 'carroapp/vehicles/bulk-delete',
};
```

## Estrutura dos Dados Esperados

### Login Request:

```json
{
  "username": "string",
  "password": "string"
}
```

### Login Response:

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "string"
}
```

### Vehicle Object:

```json
{
  "id": "string",
  "nomeModelo": "string",
  "placaVeiculo": "string",
  "km": number,
  "preco": number,
  "foto1": "string",
  "foto2": "string",
  "foto3": "string",
  "foto4": "string",
  "foto5": "string",
  "tipoVeiculo": "string",
  "anoFabricacao": number,
  "anoModelo": number,
  "combustivel": "string",
  "cor": "string",
  "observacao": "string",
  "quantidade": number
}
```

## Workflows Sugeridos no n8n

### 1. Workflow de Login

- **Trigger**: Webhook (POST)
- **Endpoint**: `/auth/login`
- **Função**: Validar credenciais e retornar token JWT

### 2. Workflow de Listagem de Veículos

- **Trigger**: Webhook (GET)
- **Endpoint**: `/vehicles/list`
- **Função**: Retornar lista de veículos (com filtros opcionais)

### 3. Workflow de Criação de Veículo

- **Trigger**: Webhook (POST)
- **Endpoint**: `/vehicles/create`
- **Função**: Criar novo veículo no banco de dados

### 4. Workflow de Atualização de Veículo

- **Trigger**: Webhook (PUT)
- **Endpoint**: `/vehicles/update/:id`
- **Função**: Atualizar dados de um veículo específico

### 5. Workflow de Exclusão de Veículo

- **Trigger**: Webhook (DELETE)
- **Endpoint**: `/vehicles/delete/:id`
- **Função**: Excluir um veículo específico

### 6. Workflow de Operações em Massa

- **Trigger**: Webhook (PUT/DELETE)
- **Endpoints**: `/vehicles/bulk-update` e `/vehicles/bulk-delete`
- **Função**: Operações em múltiplos veículos

## Teste de Conectividade

Após configurar os endpoints, você pode testar a conectividade usando o login do aplicativo. Se houver problemas, verifique:

1. URLs dos endpoints estão corretos
2. n8n está rodando e acessível
3. Workflows estão ativos
4. Estrutura de dados está correta
5. Headers de autenticação estão sendo enviados corretamente

## Segurança

Lembre-se de:

- Usar HTTPS em produção
- Implementar validação de token JWT
- Sanitizar dados de entrada
- Implementar rate limiting se necessário
