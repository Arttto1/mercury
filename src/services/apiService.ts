import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Vehicle,
  LoginCredentials,
  User,
  VehicleFilter,
  VehicleUpdatePayload,
  VehicleDeletePayload,
  BulkDeletePayload,
  ImageUpdate,
} from "../types";
import { convertImageToStructuredObject } from "../utils/imageUtils";

// Endpoints placeholder - substitua pelos endpoints reais do n8n
const API_ENDPOINTS = {
  login: "login",
  fetchVehicles: "vehicles",
  createVehicle: "create-vehicle",
  updateVehicle: "update-vehicle",
  deleteVehicle: "delete-vehicle",
  bulkDelete: "bulk-delete-vehicle",
};

class ApiService {
  private baseURL = "https://webhooksintese.gruposintesedigital.com/webhook/as";
  private s3URL = "https://autosintese.s3.sa-east-1.amazonaws.com"; // Substitua pela URL base do seu n8n
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem("@auth_token");
    } catch (error) {
      console.error("Error loading token:", error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem("@auth_token", token);
      this.token = token;
    } catch (error) {
      console.error("Error saving token:", error);
    }
  }

  private async removeToken() {
    try {
      await AsyncStorage.removeItem("@auth_token");
      this.token = null;
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };
    console.log(`${this.baseURL}/${endpoint}`);
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // MODO TESTE - Remova isso quando conectar ao n8n real
      if (
        credentials.username === "admin" &&
        credentials.password === "teste123"
      ) {
        const mockUser = {
          id: "1",
          username: "admin",
          email: "admin@carroapp.com",
          token: "mock_token_12345",
        };

        await this.saveToken(mockUser.token);
        return mockUser;
      }

      if (
        credentials.username === "demo" &&
        credentials.password === "123456"
      ) {
        const mockUser = {
          id: "2",
          username: "demo",
          email: "demo@carroapp.com",
          token: "mock_token_67890",
        };

        await this.saveToken(mockUser.token);
        return mockUser;
      }

      const [response] = await this.makeRequest(API_ENDPOINTS.login, {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      await this.saveToken(response.token);
      return response.user;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Credenciais inválidas");
    }
  }

  async logout() {
    await this.removeToken();
  }

  // Função para extrair ID da imagem do path
  private extractImageIdFromPath(imageUrl: string): string | null {
    try {
      // Extrair apenas o nome do arquivo do URL
      const fileName = imageUrl.split("/").pop() || "";

      // Padrão: vehicles/JEEP-COMPASS-123-8bc9283e-8cda-43af-8790-c1606e5c8400.jpeg
      // ID: 8bc9283e-8cda-43af-8790-c1606e5c8400 (UUID completo)
      const uuidMatch = fileName.match(
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
      );

      if (uuidMatch) {
        return uuidMatch[1];
      }

      return null;
    } catch (error) {
      console.error("Erro ao extrair ID da imagem:", error);
      return null;
    }
  }

  // Função para extrair path da imagem do URL completo
  private extractImagePathFromUrl(imageUrl: string): string | null {
    try {
      // Se é uma URL completa com S3, extrair apenas o path
      if (imageUrl.includes(this.s3URL)) {
        return imageUrl.replace(`${this.s3URL}/`, "");
      }

      // Se já é um path relativo, retornar como está
      if (imageUrl.startsWith("vehicles/")) {
        return imageUrl;
      }

      // Tentar extrair o path de outros formatos de URL
      const urlParts = imageUrl.split("/");
      const vehiclesIndex = urlParts.findIndex((part) => part === "vehicles");

      if (vehiclesIndex !== -1 && vehiclesIndex < urlParts.length - 1) {
        return urlParts.slice(vehiclesIndex).join("/");
      }

      return null;
    } catch (error) {
      console.error("Erro ao extrair path da imagem:", error);
      return null;
    }
  }

  // Função para transformar resposta da API para interface Vehicle
  private transformApiResponseToVehicle(
    apiData: any,
    originalVehicle?: Vehicle
  ): Vehicle {
    const vehicle: Vehicle = {
      id: String(apiData.vehicle_id || apiData.id || ""),
      nomeModelo: String(apiData.nome_modelo || apiData.nomeModelo || ""),
      placaVeiculo: String(apiData.placa || apiData.placaVeiculo || ""),
      km: parseInt(String(apiData.km || 0)) || 0,
      preco: parseFloat(String(apiData.preco || 0)) || 0,
      foto1: originalVehicle?.foto1 || "",
      foto2: originalVehicle?.foto2 || "",
      foto3: originalVehicle?.foto3 || "",
      foto4: originalVehicle?.foto4 || "",
      foto5: originalVehicle?.foto5 || "",
      foto6: originalVehicle?.foto6 || "",
      foto7: originalVehicle?.foto7 || "",
      foto8: originalVehicle?.foto8 || "",
      foto9: originalVehicle?.foto9 || "",
      foto10: originalVehicle?.foto10 || "",
      foto11: originalVehicle?.foto11 || "",
      foto12: originalVehicle?.foto12 || "",
      tipoVeiculo: String(
        apiData.tipo || apiData.tipo_veiculo || apiData.tipoVeiculo || ""
      ),
      anoFabricacao:
        parseInt(
          String(apiData.ano_fabricacao || apiData.anoFabricacao || 0)
        ) || 0,
      anoModelo:
        parseInt(String(apiData.ano_modelo || apiData.anoModelo || 0)) || 0,
      combustivel: String(apiData.combustivel || ""),
      cor: String(apiData.cor || ""),
      observacao: String(apiData.obs || apiData.observacao || ""),
      interessados: parseInt(String(apiData.interessados || 0)) || 0,
    };

    // Transforma o array de imagens em propriedades foto1, foto2, etc.
    if (apiData.images && Array.isArray(apiData.images)) {
      apiData.images.forEach((image: any, index: number) => {
        if (index < 12) {
          // Máximo 12 fotos suportadas
          const fotoKey = `foto${index + 1}` as keyof Vehicle;

          // Construir URL completa a partir do path
          let imageUrl = "";
          if (image?.path) {
            // Se o path não começa com http, adicionar a base URL
            if (image.path.startsWith("http")) {
              imageUrl = image.path;
            } else {
              // Construir URL completa usando a base URL
              // O path já vem com "vehicles/" então não duplicar
              imageUrl = `${this.s3URL}/${image.path}`;
            }
          } else if (image?.url) {
            imageUrl = image.url;
          } else if (image?.base64) {
            imageUrl = image.base64;
          }

          (vehicle as any)[fotoKey] = String(imageUrl || "");
        }
      });
    }

    // Novo formato: fotos vêm como objetos individuais (foto1: {path: "...", idx: 0})
    // Apenas atualizar as fotos que vêm na resposta da API
    console.log("🔍 Processando resposta de imagens do updateVehicle...");

    for (let i = 1; i <= 12; i++) {
      const fotoKey = `foto${i}` as keyof Vehicle;
      const fotoData = apiData[fotoKey];

      // Se a foto veio na resposta da API, processar ela
      if (fotoData !== undefined) {
        console.log(`📸 ${fotoKey} veio na resposta:`, fotoData);

        if (fotoData && typeof fotoData === "object" && fotoData.path) {
          // Construir URL completa a partir do path
          let imageUrl = "";
          if (fotoData.path.startsWith("http")) {
            imageUrl = fotoData.path;
          } else {
            // Construir URL completa usando a base URL
            imageUrl = `${this.s3URL}/${fotoData.path}`;
          }

          (vehicle as any)[fotoKey] = String(imageUrl || "");
          console.log(`✅ ${fotoKey} atualizada: ${imageUrl}`);
        } else if (typeof fotoData === "string") {
          // Se já é uma string (URL completa ou base64)
          (vehicle as any)[fotoKey] = String(fotoData);
          console.log(`✅ ${fotoKey} atualizada (string): ${fotoData}`);
        } else if (fotoData === null || fotoData === "") {
          // Se veio null ou string vazia, significa que foi removida
          (vehicle as any)[fotoKey] = "";
          console.log(`🗑️ ${fotoKey} removida`);
        }
      } else {
        // Se não veio na resposta, manter o valor original
        const originalValue = (originalVehicle?.[fotoKey] as string) || "";
        console.log(`🔄 ${fotoKey} preservada: ${originalValue}`);
      }
    }

    return vehicle;
  }

  async fetchVehicles(filter?: VehicleFilter): Promise<Vehicle[]> {
    try {
      // API real - agora com transformação de dados
      const queryParams = filter
        ? `?${new URLSearchParams(filter as any).toString()}`
        : "";
      const apiResponse = await this.makeRequest(
        `${API_ENDPOINTS.fetchVehicles}${queryParams}`
      );

      // Transforma a resposta da API para o formato esperado
      if (Array.isArray(apiResponse)) {
        return apiResponse.map((item) =>
          this.transformApiResponseToVehicle(item)
        );
      } else if (apiResponse && Array.isArray(apiResponse.data)) {
        return apiResponse.data.map((item: any) =>
          this.transformApiResponseToVehicle(item)
        );
      } else {
        console.warn("Formato de resposta da API não esperado:", apiResponse);
        return [];
      }
    } catch (error) {
      console.error("Fetch vehicles error:", error);
      throw error;
    }
  }

  async createVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle> {
    try {
      // Criar payload base sem as imagens
      const vehiclePayload = { ...vehicle };
      const images: Array<{
        name: string;
        mime: string;
        base64: string;
        id?: string;
        path?: string;
        removed?: boolean;
      }> = [];

      const imageFields = [
        "foto1",
        "foto2",
        "foto3",
        "foto4",
        "foto5",
        "foto6",
        "foto7",
        "foto8",
        "foto9",
        "foto10",
        "foto11",
        "foto12",
      ];

      // Processar cada imagem e remover do payload principal
      for (let i = 0; i < imageFields.length; i++) {
        const fieldName = imageFields[i] as keyof Omit<Vehicle, "id">;
        const imageUri = vehicle[fieldName] as string;

        // Remover campo de imagem do payload principal
        delete (vehiclePayload as any)[fieldName];

        if (
          imageUri &&
          (imageUri.startsWith("file://") || imageUri.startsWith("content://"))
        ) {
          try {
            // Converter imagem para base64
            const imageObject = await convertImageToStructuredObject(
              imageUri,
              i + 1
            );

            // Adicionar ao array de imagens
            images.push({
              name: `${fieldName}.jpg`,
              mime: imageObject.mime,
              base64: imageObject.base64,
            });
          } catch (error) {
            console.error(`❌ Erro ao converter ${fieldName}:`, error);
          }
        }
      }

      // Adicionar array de imagens ao payload
      const finalPayload = {
        ...vehiclePayload,
        images: images,
      };

      // Enviar veículo com array de imagens estruturadas para o endpoint
      const apiResponse = await this.makeRequest(API_ENDPOINTS.createVehicle, {
        method: "POST",
        body: JSON.stringify(finalPayload),
      });

      // Transforma a resposta da API para o formato Vehicle
      if (Array.isArray(apiResponse) && apiResponse.length > 0) {
        // API retorna array com um objeto: [{vehicle: {...}, success: true}]
        const responseData = apiResponse[0];
        if (responseData && responseData.vehicle) {
          return this.transformApiResponseToVehicle(responseData.vehicle);
        }
      } else if (apiResponse && typeof apiResponse === "object") {
        if (apiResponse.vehicle_id) {
          return this.transformApiResponseToVehicle(apiResponse);
        } else if (apiResponse.success && apiResponse.vehicle) {
          // Se a resposta tem formato {success: true, vehicle: {...}}
          return this.transformApiResponseToVehicle(apiResponse.vehicle);
        } else if (apiResponse.vehicle) {
          // Se a resposta tem apenas {vehicle: {...}}
          return this.transformApiResponseToVehicle(apiResponse.vehicle);
        }
      }

      // Fallback - tentar transformar a resposta diretamente
      return this.transformApiResponseToVehicle(apiResponse);
    } catch (error) {
      console.error("Create vehicle error:", error);
      throw error;
    }
  }

  async updateVehicle(
    id: string,
    vehicle: Partial<Vehicle>,
    originalVehicle: Vehicle
  ): Promise<Vehicle> {
    try {
      console.log(
        "🚗 Atualizando veículo - enviando apenas campos alterados..."
      );

      // Criar payload inteligente apenas com campos alterados
      const changedFields: Partial<Vehicle> = {};
      const images: Array<{
        name: string;
        mime: string;
        base64: string;
        id?: string;
        path?: string;
        removed?: boolean;
      }> = [];

      const vehicleName = originalVehicle.nomeModelo || "";

      const imageFields = [
        "foto1",
        "foto2",
        "foto3",
        "foto4",
        "foto5",
        "foto6",
        "foto7",
        "foto8",
        "foto9",
        "foto10",
        "foto11",
        "foto12",
      ];

      // Comparar campos não-imagem
      const fieldsToCheck = [
        "placaVeiculo",
        "km",
        "preco",
        "tipoVeiculo",
        "combustivel",
        "observacao",
        "nomeModelo",
        "anoFabricacao",
        "anoModelo",
        "cor",
        "interessados",
      ] as (keyof Vehicle)[];

      fieldsToCheck.forEach((field) => {
        if (
          vehicle[field] !== undefined &&
          vehicle[field] !== originalVehicle[field]
        ) {
          (changedFields as any)[field] = vehicle[field];
          console.log(`📝 Campo alterado: ${field} = ${vehicle[field]}`);
        }
      });

      // Comparar e processar imagens alteradas
      console.log("🔍 === ANÁLISE DE IMAGENS ===");

      // Primeiro, criar arrays das imagens originais e atuais (sem strings vazias)
      const originalImages = imageFields
        .map((field, index) => ({
          field: field as keyof Vehicle,
          url: originalVehicle[field as keyof Vehicle] as string,
          index,
        }))
        .filter((img) => img.url && img.url.trim() !== "");

      const currentImages = imageFields
        .map((field, index) => ({
          field: field as keyof Vehicle,
          url: vehicle[field as keyof Vehicle] as string,
          index,
        }))
        .filter((img) => img.url && img.url.trim() !== "");

      console.log(
        "🏷️ Imagens originais:",
        originalImages.map((img) => `${img.field}="${img.url}"`)
      );
      console.log(
        "�️ Imagens atuais:",
        currentImages.map((img) => `${img.field}="${img.url}"`)
      );

      // Detectar imagens removidas (estavam no original mas não estão no atual)
      const removedImages = originalImages.filter(
        (original) =>
          !currentImages.some((current) => current.url === original.url)
      );

      // Detectar imagens adicionadas (estão no atual mas não estavam no original)
      const addedImages = currentImages.filter(
        (current) =>
          !originalImages.some((original) => original.url === current.url)
      );

      console.log(
        "�️ Imagens removidas:",
        removedImages.map((img) => `${img.field}="${img.url}"`)
      );
      console.log(
        "➕ Imagens adicionadas:",
        addedImages.map((img) => `${img.field}="${img.url}"`)
      );

      // Processar imagens removidas
      removedImages.forEach((removedImg) => {
        const imageId = this.extractImageIdFromPath(removedImg.url);
        const imagePath = this.extractImagePathFromUrl(removedImg.url);

        console.log(
          `🆔 ${removedImg.field} removida - ID: ${imageId} | Path: ${imagePath}`
        );

        if (imageId && imagePath) {
          images.push({
            name: `${removedImg.field}.jpg`,
            mime: "image/jpeg",
            base64: "",
            id: imageId,
            path: imagePath,
            removed: true,
          });
        }
      });

      // Processar imagens adicionadas
      for (const addedImg of addedImages) {
        if (
          addedImg.url.startsWith("file://") ||
          addedImg.url.startsWith("content://")
        ) {
          try {
            const imageObject = await convertImageToStructuredObject(
              addedImg.url,
              addedImg.index + 1
            );

            console.log(`➕ ${addedImg.field} adicionada`);
            images.push({
              name: `${addedImg.field}.jpg`,
              mime: imageObject.mime,
              base64: imageObject.base64,
              removed: false,
            });
          } catch (error) {
            console.error(`❌ Erro ao converter ${addedImg.field}:`, error);
            (changedFields as any)[addedImg.field] = addedImg.url;
          }
        } else {
          // URL externa adicionada
          (changedFields as any)[addedImg.field] = addedImg.url;
        }
      }

      console.log("🔍 === FIM ANÁLISE DE IMAGENS ===");

      // Verificar se há alterações para enviar
      if (Object.keys(changedFields).length === 0 && images.length === 0) {
        console.log(
          "ℹ️ Nenhuma alteração detectada - retornando veículo original"
        );
        return originalVehicle;
      }

      // Montar payload final com ID do veículo
      const finalPayload = {
        id: id, // Adicionar ID no payload
        vehicleName, // Adicionar campo vehicleName
        ...changedFields,
        ...(images.length > 0 && { images }),
      };

      console.log("🚀 Enviando payload otimizado:", {
        id,
        fieldsChanged: Object.keys(changedFields),
        imagesCount: images.length,
        imagesDetails: images.map((img) => ({
          name: img.name,
          hasBase64: !!img.base64,
          id: img.id,
          path: img.path,
          removed: img.removed,
        })),
      });

      const apiResponse = await this.makeRequest(API_ENDPOINTS.updateVehicle, {
        method: "POST",
        body: JSON.stringify(finalPayload),
      });

      console.log("✅ Resposta da API updateVehicle recebida");

      // Transforma a resposta da API para o formato Vehicle, preservando dados originais
      if (Array.isArray(apiResponse) && apiResponse.length > 0) {
        const responseData = apiResponse[0];
        if (responseData && responseData.vehicle) {
          return this.transformApiResponseToVehicle(
            responseData.vehicle,
            originalVehicle
          );
        }
      } else if (apiResponse && typeof apiResponse === "object") {
        if (apiResponse.vehicle_id) {
          return this.transformApiResponseToVehicle(
            apiResponse,
            originalVehicle
          );
        } else if (apiResponse.success && apiResponse.vehicle) {
          return this.transformApiResponseToVehicle(
            apiResponse.vehicle,
            originalVehicle
          );
        } else if (apiResponse.vehicle) {
          return this.transformApiResponseToVehicle(
            apiResponse.vehicle,
            originalVehicle
          );
        }
      }

      return this.transformApiResponseToVehicle(apiResponse, originalVehicle);
    } catch (error) {
      console.error("Update vehicle error:", error);
      throw error;
    }
  }

  // Nova função para atualização otimista
  async updateVehicleOptimistic(
    payload: VehicleUpdatePayload
  ): Promise<Partial<Vehicle>> {
    try {
      console.log("🚗 Atualizando veículo com payload:", payload);

      const apiResponse = await this.makeRequest(API_ENDPOINTS.updateVehicle, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("✅ Resposta da API updateVehicle recebida:", apiResponse);

      // A API retorna apenas os campos alterados
      // Transformar a resposta para o formato Vehicle (parcial)
      if (Array.isArray(apiResponse) && apiResponse.length > 0) {
        const responseData = apiResponse[0];
        if (responseData && responseData.vehicle) {
          return this.transformPartialApiResponseToVehicle(
            responseData.vehicle
          );
        }
      } else if (apiResponse && typeof apiResponse === "object") {
        if (apiResponse.vehicle_id) {
          return this.transformPartialApiResponseToVehicle(apiResponse);
        } else if (apiResponse.success && apiResponse.vehicle) {
          return this.transformPartialApiResponseToVehicle(apiResponse.vehicle);
        } else if (apiResponse.vehicle) {
          return this.transformPartialApiResponseToVehicle(apiResponse.vehicle);
        }
      }

      return this.transformPartialApiResponseToVehicle(apiResponse);
    } catch (error) {
      console.error("Update vehicle error:", error);
      throw error;
    }
  }

  // Nova função para transformar resposta parcial da API
  private transformPartialApiResponseToVehicle(apiData: any): Partial<Vehicle> {
    const partialVehicle: Partial<Vehicle> = {};

    // Mapear apenas os campos que vêm na resposta
    if (apiData.vehicle_id !== undefined)
      partialVehicle.id = apiData.vehicle_id;
    if (apiData.nome_modelo !== undefined)
      partialVehicle.nomeModelo = apiData.nome_modelo;
    if (apiData.placa !== undefined)
      partialVehicle.placaVeiculo = apiData.placa;
    if (apiData.km !== undefined)
      partialVehicle.km = parseInt(apiData.km.toString()) || 0;
    if (apiData.preco !== undefined)
      partialVehicle.preco = parseInt(apiData.preco.toString()) || 0;
    if (apiData.tipo !== undefined) partialVehicle.tipoVeiculo = apiData.tipo;
    if (apiData.ano_fabricacao !== undefined)
      partialVehicle.anoFabricacao =
        parseInt(apiData.ano_fabricacao.toString()) || 0;
    if (apiData.ano_modelo !== undefined)
      partialVehicle.anoModelo = parseInt(apiData.ano_modelo.toString()) || 0;
    if (apiData.combustivel !== undefined)
      partialVehicle.combustivel = apiData.combustivel;
    if (apiData.cor !== undefined) partialVehicle.cor = apiData.cor;
    if (apiData.observacao !== undefined)
      partialVehicle.observacao = apiData.observacao || apiData.obs;
    if (apiData.interessados !== undefined)
      partialVehicle.interessados = apiData.interessados;

    // Processar imagens se estiverem na resposta
    const imageFields = [
      "foto1",
      "foto2",
      "foto3",
      "foto4",
      "foto5",
      "foto6",
      "foto7",
      "foto8",
      "foto9",
      "foto10",
      "foto11",
      "foto12",
    ];

    imageFields.forEach((field, index) => {
      const imgIdx = index + 1;
      const imageData =
        apiData[`foto${imgIdx}`] ||
        (apiData.images &&
          apiData.images.find((img: any) => img.idx === imgIdx));

      if (imageData) {
        if (typeof imageData === "string") {
          (partialVehicle as any)[field] = imageData;
        } else if (imageData.path) {
          (partialVehicle as any)[field] = `${this.s3URL}/${imageData.path}`;
        }
      }
    });

    // Remover flags de atualização
    partialVehicle._isUpdating = false;
    partialVehicle._updatingFields = undefined;
    partialVehicle._plateRelatedLoading = false;

    console.log("🔄 Dados parciais transformados:", partialVehicle);
    return partialVehicle;
  }

  async deleteVehicle(vehicle: Vehicle): Promise<void> {
    try {
      // Extrair paths de todas as imagens do veículo
      const imagePaths = this.extractImagePaths(vehicle);

      // Criar payload com ID e array de paths das imagens
      const deletePayload: VehicleDeletePayload = {
        id: vehicle.id,
        images: imagePaths,
      };

      await this.makeRequest("delete-vehicle", {
        method: "POST",
        body: JSON.stringify(deletePayload),
      });
    } catch (error) {
      console.error("Delete vehicle error:", error);
      throw error;
    }
  }

  private extractImagePaths(vehicle: Vehicle): string[] {
    const imageFields = [
      "foto1",
      "foto2",
      "foto3",
      "foto4",
      "foto5",
      "foto6",
      "foto7",
      "foto8",
      "foto9",
      "foto10",
      "foto11",
      "foto12",
    ] as const;

    const imagePaths: string[] = [];

    imageFields.forEach((field) => {
      const imageUrl = vehicle[field] as string;
      if (imageUrl && imageUrl.trim() !== "") {
        // Extrair path da URL
        const path = this.extractPathFromImageUrl(imageUrl);
        if (path) {
          imagePaths.push(path);
        }
      }
    });

    return imagePaths;
  }

  private extractPathFromImageUrl(url: string): string | null {
    if (!url) return null;

    try {
      // Para URLs do S3: https://autosintese.s3.sa-east-1.amazonaws.com/vehicles/filename.jpg
      // Extrair: vehicles/filename.jpg
      const urlObj = new URL(url);
      const path = urlObj.pathname.substring(1); // Remove a barra inicial
      return path;
    } catch {
      // Se não for uma URL válida, assumir que já é um path
      return url.startsWith("/") ? url.substring(1) : url;
    }
  }

  async bulkDeleteVehicles(vehicles: Vehicle[]): Promise<void> {
    try {
      // Criar payload com array de objetos contendo ID e imagens de cada veículo
      const vehiclesPayload = vehicles.map((vehicle) => ({
        id: vehicle.id,
        images: this.extractImagePaths(vehicle),
      }));

      const bulkDeletePayload: BulkDeletePayload = {
        vehicles: vehiclesPayload,
      };

      await this.makeRequest("bulk-delete-vehicle", {
        method: "POST",
        body: JSON.stringify(bulkDeletePayload),
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
