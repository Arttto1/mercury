import { Vehicle, VehicleUpdatePayload, ImageUpdate } from "../types";
import { convertImageToStructuredObject } from "./imageUtils";

/**
 * Utilitários para edição otimista de veículos
 */

// Campos que dependem da placa do veículo (preenchidos pela API)
export const PLATE_RELATED_FIELDS: (keyof Vehicle)[] = [
  "nomeModelo",
  "anoFabricacao",
  "anoModelo",
  "cor",
];

// Campos que têm inputs específicos no formulário
export const EDITABLE_FIELDS: (keyof Vehicle)[] = [
  "placaVeiculo",
  "km",
  "preco",
  "combustivel",
  "tipoVeiculo",
  "observacao",
];

// Campos de imagens
export const IMAGE_FIELDS: (keyof Vehicle)[] = [
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

/**
 * Verifica se o campo é relacionado à placa
 */
export const isPlateRelatedField = (field: keyof Vehicle): boolean => {
  return PLATE_RELATED_FIELDS.includes(field);
};

/**
 * Cria o payload de atualização com base nas mudanças
 */
export const createUpdatePayload = async (
  vehicleId: string,
  vehicleName: string,
  originalVehicle: Vehicle,
  updatedFields: Partial<Vehicle>
): Promise<VehicleUpdatePayload> => {
  const payload: VehicleUpdatePayload = {
    id: vehicleId,
    vehicleName: vehicleName,
  };

  const images: ImageUpdate[] = [];

  // Processar campos não-imagem
  for (const [field, value] of Object.entries(updatedFields)) {
    if (IMAGE_FIELDS.includes(field as keyof Vehicle)) {
      continue; // Processar imagens separadamente
    }

    if (value !== originalVehicle[field as keyof Vehicle]) {
      payload[field] = value;
    }
  }

  // Processar mudanças de imagens
  for (const field of IMAGE_FIELDS) {
    const originalUrl = originalVehicle[field] as string;
    const newUrl = updatedFields[field] as string;

    if (originalUrl !== newUrl) {
      // Imagem foi removida
      if (originalUrl && !newUrl) {
        const imageId = extractImageIdFromPath(originalUrl);
        const imagePath = extractImagePathFromUrl(originalUrl);

        if (imageId && imagePath) {
          images.push({
            id: imageId,
            name: `${field}.jpg`,
            mime: "image/jpeg",
            base64: "",
            removed: true,
            path: imagePath,
          });
        }
      }
      // Imagem foi adicionada/substituída
      else if (newUrl) {
        // Se é uma nova imagem local
        if (newUrl.startsWith("file://") || newUrl.startsWith("content://")) {
          try {
            const imageObject = await convertImageToStructuredObject(
              newUrl,
              IMAGE_FIELDS.indexOf(field) + 1
            );

            images.push({
              name: `${field}.jpg`,
              mime: imageObject.mime,
              base64: imageObject.base64,
              removed: false,
            });

            // Se estava substituindo uma imagem existente, marcar a antiga como removida
            if (originalUrl) {
              const imageId = extractImageIdFromPath(originalUrl);
              const imagePath = extractImagePathFromUrl(originalUrl);

              if (imageId && imagePath) {
                images.push({
                  id: imageId,
                  name: `${field}_old.jpg`,
                  mime: "image/jpeg",
                  base64: "",
                  removed: true,
                  path: imagePath,
                });
              }
            }
          } catch (error) {
            console.error(`Erro ao processar imagem ${field}:`, error);
          }
        }
      }
    }
  }

  // Adicionar imagens ao payload se houver mudanças
  if (images.length > 0) {
    payload.images = images;
  }

  return payload;
};

/**
 * Extrai o ID da imagem a partir do path
 */
export const extractImageIdFromPath = (url: string): string | null => {
  if (!url) return null;

  // Padrão para URLs do S3: nome-do-veiculo-UUID.jpeg
  // Exemplo: JEEP-COMPASS-123-be696112-ec99-45e5-b71c-bfba4684f17c.jpeg
  const uuidPattern =
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
  const uuidMatch = url.match(uuidPattern);

  if (uuidMatch) {
    return uuidMatch[1];
  }

  // Fallback: procurar por qualquer ID alfanumérico longo
  const fallbackPattern = /\/([a-f0-9\-]{8,})\.(jpg|jpeg|png)/i;
  const fallbackMatch = url.match(fallbackPattern);

  if (fallbackMatch) {
    return fallbackMatch[1];
  }

  return null;
};

/**
 * Extrai o path da imagem a partir da URL
 */
export const extractImagePathFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    // Remove a barra inicial
    return urlObj.pathname.substring(1);
  } catch {
    // Se não for uma URL válida, assumir que já é um path
    return url.startsWith("/") ? url.substring(1) : url;
  }
};

/**
 * Aplica atualizações otimistas no veículo
 */
export const applyOptimisticUpdate = (
  originalVehicle: Vehicle,
  updates: Partial<Vehicle>,
  isPlateRelated: boolean = false
): Vehicle => {
  const updatingFields = Object.keys(updates) as (keyof Vehicle)[];

  return {
    ...originalVehicle,
    ...updates,
    _isUpdating: true,
    _updatingFields: updatingFields,
    _plateRelatedLoading: isPlateRelated,
  };
};

/**
 * Mescla a resposta da API com o veículo atual
 */
export const mergeApiResponse = (
  currentVehicle: Vehicle,
  apiResponse: Partial<Vehicle>
): Vehicle => {
  return {
    ...currentVehicle,
    ...apiResponse,
    _isUpdating: false,
    _updatingFields: undefined,
    _plateRelatedLoading: false,
  };
};
