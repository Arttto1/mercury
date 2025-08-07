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
  interessados: number;
  // Estado de loading para UX otimista
  _isUpdating?: boolean;
  _updatingFields?: (keyof Vehicle)[];
  _plateRelatedLoading?: boolean; // Loading específico para campos relacionados à placa
}

// Interface para atualizações de imagens
export interface ImageUpdate {
  id?: string;
  name: string;
  mime: string;
  base64: string;
  removed: boolean;
  path?: string;
}

// Interface para payload de atualização
export interface VehicleUpdatePayload {
  id: string;
  vehicleName?: string;
  placaVeiculo?: string;
  km?: number;
  preco?: number;
  observacao?: string;
  images?: ImageUpdate[];
  [key: string]: any;
}

// Interface para payload de delete
export interface VehicleDeletePayload {
  id: string;
  images: string[]; // Array com paths das imagens para deletar
}

// Interface para payload de bulk delete
export interface BulkDeletePayload {
  vehicles: {
    id: string;
    images: string[];
  }[];
}

// Backend response types
export interface BackendResponse {
  success: boolean;
  message?: string;
}

// Novo formato da resposta da API para criação
export interface ApiCreateVehicleResponse {
  vehicle: {
    vehicle_id: string;
    nome_modelo: string;
    placa: string;
    km: string;
    preco: string;
    tipo: string;
    ano_modelo: string;
    ano_fabricacao: string;
    combustivel: string;
    cor: string;
    observacao: string;
    created_at: string;
    interessados: number;
    foto1?: {
      path: string;
      idx: number;
    };
    foto2?: {
      path: string;
      idx: number;
    };
    foto3?: {
      path: string;
      idx: number;
    };
    foto4?: {
      path: string;
      idx: number;
    };
    foto5?: {
      path: string;
      idx: number;
    };
    foto6?: {
      path: string;
      idx: number;
    };
    foto7?: {
      path: string;
      idx: number;
    };
    foto8?: {
      path: string;
      idx: number;
    };
    foto9?: {
      path: string;
      idx: number;
    };
    foto10?: {
      path: string;
      idx: number;
    };
    foto11?: {
      path: string;
      idx: number;
    };
    foto12?: {
      path: string;
      idx: number;
    };
  };
  success: boolean;
}

export interface CreateVehicleResponse extends BackendResponse {
  vehicle: Vehicle; // Convertido para o formato do app
}

export interface UpdateVehicleResponse extends BackendResponse {
  success: boolean;
  vehicle: Vehicle; // Convertido para o formato do app
}

// Tipo para os dados brutos que vêm da API (listagem de veículos)
export interface VehicleApiResponse {
  vehicle_id: string;
  nome_modelo: string;
  placa: string;
  km: string;
  preco: string;
  tipo: string;
  ano_fabricacao: string | null;
  ano_modelo: string | null;
  combustivel: string | null;
  cor: string | null;
  obs: string | null;
  interessados: number;
  created_at: string;
  purchased_at: string | null;
  deleted_at: string | null;
  archived_at: string | null;
  images: Array<{
    path: string | null;
    idx: number | null;
  }>;
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
  interessadosMin?: number;
  interessadosMax?: number;
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
