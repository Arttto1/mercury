export interface Vehicle {
  id: string;
  nomeModelo: string;
  placaVeiculo: string;
  km: number;
  preco: number;
  foto1: string;
  foto2: string;
  foto3: string;
  foto4?: string;
  foto5?: string;
  foto6?: string;
  foto7?: string;
  foto8?: string;
  foto9?: string;
  foto10?: string;
  foto11?: string;
  foto12?: string;
  tipoVeiculo: string;
  anoFabricacao: number;
  anoModelo: number;
  combustivel: string;
  cor: string;
  observacao?: string;
  quantidade: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  token: string;
}

export interface VehicleFilter {
  nomeModelo?: string;
  placaVeiculo?: string;
  kmMin?: number;
  kmMax?: number;
  precoMin?: number;
  precoMax?: number;
  tipoVeiculo?: string;
  anoFabricacaoMin?: number;
  anoFabricacaoMax?: number;
  anoModeloMin?: number;
  anoModeloMax?: number;
  combustivel?: string;
  cor?: string;
  observacao?: string;
  quantidadeMin?: number;
  quantidadeMax?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export type RootStackParamList = {
  Login: undefined;
  VehicleList: undefined;
  VehicleForm: { vehicle?: Vehicle };
  VehicleDetails: { vehicle: Vehicle };
};
