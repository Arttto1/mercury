import AsyncStorage from "@react-native-async-storage/async-storage";
import { Vehicle, LoginCredentials, User, VehicleFilter } from "../types";

// Endpoints placeholder - substitua pelos endpoints reais do n8n
const API_ENDPOINTS = {
  login: "login",
  fetchVehicles: "vehicles",
  createVehicle: "vehicles",
  updateVehicle: "vehicles",
  deleteVehicle: "vehicles",
  bulkUpdate: "vehicles/bulk",
  bulkDelete: "vehicles/bulk/delete",
  getVehicleDataByPlate: "vehicles/plate",
};

class ApiService {
  private baseURL = "https://webhooksintese.gruposintesedigital.com/webhook/as"; // Substitua pela URL base do seu n8n
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
    console.log("Attempting login with credentials:", credentials);
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

  async fetchVehicles(filter?: VehicleFilter): Promise<Vehicle[]> {
    try {
      // MODO TESTE - Dados mock para demonstração
      if (
        this.token &&
        (this.token === "mock_token_12345" || this.token === "mock_token_67890")
      ) {
        const mockVehicles: Vehicle[] = [
          {
            id: "1",
            nomeModelo: "Honda Civic LX 2.0",
            placaVeiculo: "ABC-1234",
            km: 15000,
            preco: 95000,
            foto1:
              "https://images.unsplash.com/photo-1549399819-bb173ce0e92a?w=500",
            foto2:
              "https://images.unsplash.com/photo-1551355738-1875eb8e8e82?w=500",
            foto3:
              "https://images.unsplash.com/photo-1549399819-bb173ce0e92a?w=500",
            tipoVeiculo: "Sedan",
            anoFabricacao: 2022,
            anoModelo: 2023,
            combustivel: "Flex",
            cor: "Branco",
            observacao: "Veículo em excelente estado, revisões em dia",
            quantidade: 2,
          },
          {
            id: "2",
            nomeModelo: "Toyota Corolla XEi",
            placaVeiculo: "DEF-5678",
            km: 25000,
            preco: 87000,
            foto1:
              "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500",
            foto2:
              "https://images.unsplash.com/photo-1549399819-bb173ce0e92a?w=500",
            foto3:
              "https://images.unsplash.com/photo-1551355738-1875eb8e8e82?w=500",
            tipoVeiculo: "Sedan",
            anoFabricacao: 2021,
            anoModelo: 2022,
            combustivel: "Flex",
            cor: "Prata",
            observacao: "Único dono, manual e chave reserva",
            quantidade: 1,
          },
          {
            id: "3",
            nomeModelo: "Jeep Compass Longitude",
            placaVeiculo: "GHI-9012",
            km: 8000,
            preco: 125000,
            foto1:
              "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500",
            foto2:
              "https://images.unsplash.com/photo-1549399819-bb173ce0e92a?w=500",
            foto3:
              "https://images.unsplash.com/photo-1551355738-1875eb8e8e82?w=500",
            tipoVeiculo: "SUV",
            anoFabricacao: 2023,
            anoModelo: 2023,
            combustivel: "Flex",
            cor: "Preto",
            observacao: "Semi-novo, garantia de fábrica",
            quantidade: 1,
          },
          {
            id: "4",
            nomeModelo: "Volkswagen Golf TSI",
            placaVeiculo: "JKL-3456",
            km: 35000,
            preco: 72000,
            foto1:
              "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500",
            foto2:
              "https://images.unsplash.com/photo-1549399819-bb173ce0e92a?w=500",
            foto3:
              "https://images.unsplash.com/photo-1551355738-1875eb8e8e82?w=500",
            tipoVeiculo: "Hatch",
            anoFabricacao: 2020,
            anoModelo: 2021,
            combustivel: "Gasolina",
            cor: "Azul",
            observacao: "Turbo, muito econômico",
            quantidade: 3,
          },
        ];

        // Simula filtros se fornecidos
        let filtered = mockVehicles;
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
              switch (key) {
                case "nomeModelo":
                case "placaVeiculo":
                case "tipoVeiculo":
                case "combustivel":
                case "cor":
                case "observacao":
                  filtered = filtered.filter((vehicle) =>
                    vehicle[key as keyof Vehicle]
                      ?.toString()
                      .toLowerCase()
                      .includes(value.toString().toLowerCase())
                  );
                  break;
              }
            }
          });
        }

        return filtered;
      }

      // API real (vai falhar por enquanto)
      const queryParams = filter
        ? `?${new URLSearchParams(filter as any).toString()}`
        : "";
      return await this.makeRequest(
        `${API_ENDPOINTS.fetchVehicles}${queryParams}`
      );
    } catch (error) {
      console.error("Fetch vehicles error:", error);
      throw error;
    }
  }

  async getVehicleDataByPlate(plate: string): Promise<Partial<Vehicle>> {
    try {
      // MODO TESTE - Simula busca de dados pela placa
      if (
        this.token &&
        (this.token === "mock_token_12345" || this.token === "mock_token_67890")
      ) {
        // Simula diferentes respostas baseadas na placa
        const mockData: { [key: string]: Partial<Vehicle> } = {
          "ABC-1234": {
            nomeModelo: "Honda Civic LX 2.0",
            tipoVeiculo: "Sedan",
            combustivel: "Flex",
            cor: "Branco",
            quantidade: 1,
          },
          "DEF-5678": {
            nomeModelo: "Toyota Corolla XEi",
            tipoVeiculo: "Sedan",
            combustivel: "Flex",
            cor: "Prata",
            quantidade: 1,
          },
          "GHI-9012": {
            nomeModelo: "Jeep Compass Longitude",
            tipoVeiculo: "SUV",
            combustivel: "Flex",
            cor: "Preto",
            quantidade: 1,
          },
          "JKL-3456": {
            nomeModelo: "Volkswagen Golf TSI",
            tipoVeiculo: "Hatch",
            combustivel: "Gasolina",
            cor: "Azul",
            quantidade: 1,
          },
        };

        const data = mockData[plate.toUpperCase()];
        if (data) {
          return data;
        } else {
          // Simula placa não encontrada - retorna dados genéricos
          return {
            nomeModelo: "Veículo não identificado",
            tipoVeiculo: "Não identificado",
            combustivel: "Não identificado",
            cor: "Não identificado",
            quantidade: 1,
          };
        }
      }

      // API real
      return await this.makeRequest(
        `${API_ENDPOINTS.getVehicleDataByPlate}/${plate}`
      );
    } catch (error) {
      console.error("Get vehicle data by plate error:", error);
      throw error;
    }
  }

  async createVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle> {
    try {
      return await this.makeRequest(API_ENDPOINTS.createVehicle, {
        method: "POST",
        body: JSON.stringify(vehicle),
      });
    } catch (error) {
      console.error("Create vehicle error:", error);
      throw error;
    }
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      return await this.makeRequest(`${API_ENDPOINTS.updateVehicle}/${id}`, {
        method: "PUT",
        body: JSON.stringify(vehicle),
      });
    } catch (error) {
      console.error("Update vehicle error:", error);
      throw error;
    }
  }

  async deleteVehicle(id: string): Promise<void> {
    try {
      await this.makeRequest(`${API_ENDPOINTS.deleteVehicle}/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete vehicle error:", error);
      throw error;
    }
  }

  async bulkUpdateVehicles(
    ids: string[],
    updates: Partial<Vehicle>
  ): Promise<void> {
    try {
      await this.makeRequest(API_ENDPOINTS.bulkUpdate, {
        method: "PUT",
        body: JSON.stringify({ ids, updates }),
      });
    } catch (error) {
      console.error("Bulk update error:", error);
      throw error;
    }
  }

  async bulkDeleteVehicles(ids: string[]): Promise<void> {
    try {
      await this.makeRequest(API_ENDPOINTS.bulkDelete, {
        method: "DELETE",
        body: JSON.stringify({ ids }),
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
