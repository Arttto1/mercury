# JSON Final Simplificado - Apenas Campos Necessários

## Estrutura do JSON que chegará no Backend

Apenas os campos que realmente importam:

```json
{
  "vehicleData": {
    "placaVeiculo": "ADA8876",
    "km": 1544,
    "preco": 4994,
    "observacao": "Carro em bom estado",
    "tipo": "sedan",
    "combustivel": "flex"
  },
  "images": [
    {
      "name": "foto1.jpg",
      "mime": "image/jpeg",
      "base64": "/9j/4AAQSkZJRgABAQEA..."
    },
    {
      "name": "foto2.jpg",
      "mime": "image/jpeg",
      "base64": "/9j/4AAQSkZJRgABAQEA..."
    },
    "https://autosintese.s3.sa-east-1.amazonaws.com/existing.jpg"
  ]
}
```

## Campos do formulário:

### **Inputs do usuário** ✍️:

- ✅ `placaVeiculo` - Digitado pelo usuário
- ✅ `km` - Digitado pelo usuário
- ✅ `preco` - Digitado pelo usuário
- ✅ `observacao` - Digitado pelo usuário
- ✅ `tipo` - Campo editável (sedan, hatch, suv, pickup, etc.)
- ✅ `combustivel` - Campo editável (flex, gasolina, álcool, diesel, etc.)
- ✅ **Imagens** - Selecionadas pelo usuário

### **Dados automáticos (apenas para exibição)** 🤖:

- 📄 `nomeModelo` - Vem da API automática pela placa (só exibição)
- 📄 `cor` - Vem da API automática pela placa (só exibição)

### **Não são enviados** ❌:

- ❌ `nomeModelo` - Apenas exibido na tela (dados automáticos)
- ❌ `cor` - Apenas exibido na tela (dados automáticos)
- ❌ `quantidade` - Sempre 1
- ❌ `anoFabricacao` - Não existe no formulário
- ❌ `anoModelo` - Não existe no formulário
- ❌ `cor` - Apenas exibido na tela
- ❌ `quantidade` - Sempre 1
- ❌ `anoFabricacao` - Não existe no formulário
- ❌ `anoModelo` - Não existe no formulário

## Processamento no Backend:

1. **Extrair** `vehicleData` e `images`
2. **Para cada imagem** no array:
   - Se é objeto → Upload para S3
   - Se é string → URL existente
3. **Mapear imagens** para campos `foto1-foto12`
4. **Salvar** no banco com URLs finais

Agora está SIMPLES e direto! 🎯

## Nova Estrutura do JSON com Campos Otimizados

Agora as imagens são enviadas em um array e campos desnecessários foram removidos:

```json
{
  "vehicleData": {
    "placaVeiculo": "ADA8876",
    "km": 1544,
    "preco": 4994,
    "observacao": "Ajjdjand",
    "anoFabricacao": 2020,
    "anoModelo": 2021,
    "tipo": "sedan",
    "combustivel": "flex"
  },
  "images": [
    {
      "name": "foto1.jpg",
      "mime": "image/jpeg",
      "base64": "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    },
    {
      "name": "foto2.jpg",
      "mime": "image/jpeg",
      "base64": "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    },
    {
      "name": "foto3.png",
      "mime": "image/png",
      "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    },
    "https://autosintese.s3.sa-east-1.amazonaws.com/existing-image.jpg"
  ]
}
```

## Campos Removidos ❌

Os seguintes campos **NÃO** são mais enviados:

- ❌ `nomeModelo` (vazio)
- ❌ `tipoVeiculo` (substituído por `tipo`)
- ❌ `combustivel` (mantido mas otimizado)
- ❌ `cor` (vazio)
- ❌ `quantidade` (sempre 1)

## Novos Campos Adicionados ✅

- ✅ `tipo`: Tipo do veículo (sedan, hatch, suv, pickup, etc.)
- ✅ `combustivel`: Tipo de combustível (alcool, gasolina, flex, diesel, etc.)

## Mapeamento de Campos

| Campo Frontend | Campo Backend | Exemplo                      |
| -------------- | ------------- | ---------------------------- |
| `tipoVeiculo`  | `tipo`        | "sedan", "hatch", "suv"      |
| `combustivel`  | `combustivel` | "flex", "gasolina", "alcool" |

## Processamento no Backend (n8n)

### 1. Extrair dados e imagens do payload:

```javascript
const { vehicleData, images } = payload;
const uploadedImageUrls = [];

// Processar cada imagem no array
for (let i = 0; i < images.length; i++) {
  const image = images[i];

  if (typeof image === "object" && image.base64) {
    // É uma nova imagem - fazer upload para S3
    const imageBuffer = Buffer.from(image.base64, "base64");
    const s3Key = `vehicles/${vehicleId}/${image.name}`;

    // Upload para S3
    const s3Url = await uploadToS3(imageBuffer, s3Key, image.mime);
    uploadedImageUrls.push(s3Url);
  } else if (typeof image === "string" && image.startsWith("http")) {
    // É uma URL existente - manter como está
    uploadedImageUrls.push(image);
  }
}

// Adicionar URLs das imagens aos dados do veículo
for (let i = 0; i < uploadedImageUrls.length; i++) {
  vehicleData[`foto${i + 1}`] = uploadedImageUrls[i];
}

// Garantir que campos de foto não utilizados sejam vazios
for (let i = uploadedImageUrls.length + 1; i <= 12; i++) {
  vehicleData[`foto${i}`] = "";
}
```

### 2. Vantagens desta nova estrutura:

✅ **Separação clara**: Dados do veículo separados das imagens
✅ **Array organizado**: Todas as imagens em uma estrutura única
✅ **Flexibilidade**: Backend pode processar quantas imagens forem enviadas
✅ **Ordem preservada**: As imagens mantêm a ordem foto1, foto2, etc.
✅ **Menos campos**: Não precisa verificar 12 campos individuais

### 3. Exemplo de função de processamento:

```javascript
async function processVehicleWithImages(payload) {
  const { vehicleData, images } = payload;
  const processedVehicleData = { ...vehicleData };

  // Processar todas as imagens
  for (let i = 0; i < images.length && i < 12; i++) {
    const image = images[i];

    if (typeof image === "object" && image.base64) {
      // Upload nova imagem
      const imageBuffer = Buffer.from(image.base64, "base64");
      const s3Key = `vehicles/${Date.now()}_${image.name}`;
      const s3Url = await uploadToS3(imageBuffer, s3Key, image.mime);
      processedVehicleData[`foto${i + 1}`] = s3Url;
    } else if (typeof image === "string") {
      // URL existente
      processedVehicleData[`foto${i + 1}`] = image;
    }
  }

  // Limpar campos não utilizados
  for (let i = images.length; i < 12; i++) {
    processedVehicleData[`foto${i + 1}`] = "";
  }

  return processedVehicleData;
}
```

### 4. Resultado final salvo no banco:

```json
{
  "placaVeiculo": "ADA8876",
  "km": 1544,
  "preco": 4994,
  "observacao": "Ajjdjand",
  "foto1": "https://autosintese.s3.sa-east-1.amazonaws.com/vehicles/123/foto1.jpg",
  "foto2": "https://autosintese.s3.sa-east-1.amazonaws.com/vehicles/123/foto2.jpg",
  "foto3": "https://autosintese.s3.sa-east-1.amazonaws.com/vehicles/123/foto3.png",
  "foto4": "https://autosintese.s3.sa-east-1.amazonaws.com/existing-image.jpg",
  "foto5": "",
  "foto6": "",
  "foto7": "",
  "foto8": "",
  "foto9": "",
  "foto10": "",
  "foto11": "",
  "foto12": "",
  "nomeModelo": "",
  "tipoVeiculo": "",
  "combustivel": "",
  "cor": "",
  "quantidade": 1
}
```
