import * as FileSystem from "expo-file-system";

/**
 * Interface para objeto de imagem estruturado
 */
export interface ImageObject {
  name: string;
  mime: string;
  base64: string;
}

/**
 * Helper para garantir que a URL da imagem esteja correta
 * @param imageUrl - URL da imagem, URI local ou caminho relativo
 * @returns URL completa da imagem ou URI local
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  // Verificar se imageUrl existe e é uma string válida
  if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
    return "";
  }

  const trimmedUrl = imageUrl.trim();

  // Se é uma URI local (file://, content://, etc.), use diretamente
  if (trimmedUrl.startsWith("file://") || trimmedUrl.startsWith("content://")) {
    return trimmedUrl;
  }

  // Se já é uma URL completa, use diretamente
  if (trimmedUrl.startsWith("http")) {
    return trimmedUrl;
  }

  // Se é data URL (base64), use diretamente
  if (trimmedUrl.startsWith("data:")) {
    return trimmedUrl;
  }

  // Para outros casos, retorne como está
  return trimmedUrl;
};

/**
 * Detecta o tipo MIME da imagem baseado na extensão
 * @param uri - URI da imagem
 * @returns Tipo MIME da imagem
 */
export const getImageMimeType = (uri: string): string => {
  const extension = uri.toLowerCase().split(".").pop();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    default:
      return "image/jpeg"; // Fallback para JPEG
  }
};

/**
 * Gera um nome de arquivo baseado no índice e tipo MIME
 * @param index - Índice da foto (1-12)
 * @param mimeType - Tipo MIME da imagem
 * @returns Nome do arquivo
 */
export const generateImageName = (index: number, mimeType: string): string => {
  const extension = mimeType.split("/")[1];
  const finalExtension = extension === "jpeg" ? "jpg" : extension;
  return `foto${index}.${finalExtension}`;
};

/**
 * Converte uma imagem local para objeto estruturado com base64
 * @param imageUri - URI da imagem local (file:// ou content://)
 * @param index - Índice da foto (1-12)
 * @returns Objeto com name, mime e base64
 */
export const convertImageToStructuredObject = async (
  imageUri: string,
  index: number
): Promise<ImageObject> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mimeType = getImageMimeType(imageUri);
    const name = generateImageName(index, mimeType);

    return {
      name,
      mime: mimeType,
      base64,
    };
  } catch (error) {
    console.error("Error converting image to structured object:", error);
    throw new Error("Falha ao converter imagem para objeto estruturado");
  }
};

/**
 * Converte uma imagem local para base64 (mantido para compatibilidade)
 * @param imageUri - URI da imagem local (file:// ou content://)
 * @returns String base64 da imagem
 */
export const convertImageToBase64 = async (
  imageUri: string
): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw new Error("Falha ao converter imagem para base64");
  }
};
