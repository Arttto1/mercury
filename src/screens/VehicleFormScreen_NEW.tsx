import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Vehicle, RootStackParamList, VehicleUpdatePayload } from "../types";
import { apiService, alertService } from "../services";
import { getImageUrl } from "../utils/imageUtils";
import { useAuth } from "../contexts/AuthContext";
import {
  createUpdatePayload,
  isPlateRelatedField,
  EDITABLE_FIELDS,
  IMAGE_FIELDS,
  applyOptimisticUpdate,
  mergeApiResponse,
} from "../utils/vehicleEditUtils";
import { convertImageToStructuredObject } from "../utils/imageUtils";

type NavigationProp = StackNavigationProp<RootStackParamList, "VehicleForm">;
type RouteProps = RouteProp<RootStackParamList, "VehicleForm">;

interface DynamicPhoto {
  id: string;
  uri: string;
}

export const VehicleFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const {
    addVehicle,
    addVehicleOptimistic,
    updateVehicle,
    updateVehicleOptimistic,
    removeVehicle,
  } = useAuth();

  // Verificar se é modo de edição
  const isEditMode = !!route.params?.vehicle;
  const originalVehicle = route.params?.vehicle;

  const screenWidth = Dimensions.get("window").width;
  const formPadding = 32;
  const availableWidth = screenWidth - formPadding;

  const [formData, setFormData] = useState<Partial<Vehicle>>(() => {
    if (isEditMode && originalVehicle) {
      return { ...originalVehicle };
    }
    return {
      placaVeiculo: "",
      km: 0,
      preco: 0,
      observacao: "",
      foto1: "",
      foto2: "",
      foto3: "",
      foto4: "",
      foto5: "",
      foto6: "",
      foto7: "",
      foto8: "",
      foto9: "",
      foto10: "",
      foto11: "",
      foto12: "",
      nomeModelo: "",
      tipoVeiculo: "",
      combustivel: "",
      cor: "",
      interessados: 1,
    };
  });

  const [dynamicPhotos, setDynamicPhotos] = useState<DynamicPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [kmDisplay, setKmDisplay] = useState<string>("");

  useEffect(() => {
    if (isEditMode && originalVehicle) {
      setPriceDisplay(formatPrice(originalVehicle.preco?.toString() || "0"));
      setKmDisplay(formatKm(originalVehicle.km?.toString() || "0"));

      // Configurar título da tela
      navigation.setOptions({
        title: "Editar Veículo",
        headerShown: true,
      });
    } else {
      navigation.setOptions({
        title: "Novo Veículo",
        headerShown: true,
      });
    }
  }, [isEditMode, originalVehicle, navigation]);

  const updateField = (field: keyof Vehicle, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Se estamos em modo de edição, aplicar atualização otimista
    if (isEditMode && originalVehicle) {
      handleOptimisticUpdate(field, value);
    }
  };

  const handleOptimisticUpdate = async (field: keyof Vehicle, value: any) => {
    if (!originalVehicle) return;

    const updates: Partial<Vehicle> = { [field]: value };
    const isPlateRelated = field === "placaVeiculo";

    // Aplicar atualização otimista imediatamente para campos editáveis e imagens
    if (EDITABLE_FIELDS.includes(field) || IMAGE_FIELDS.includes(field)) {
      updateVehicleOptimistic(originalVehicle.id, updates, isPlateRelated);
    }
    // Para mudança de placa, aplicar skeleton nos campos relacionados
    else if (isPlateRelated) {
      const plateRelatedUpdates: Partial<Vehicle> = {
        placaVeiculo: value,
        _plateRelatedLoading: true,
      };
      updateVehicleOptimistic(originalVehicle.id, plateRelatedUpdates, true);
    }

    // Criar e enviar payload para API
    try {
      const payload = await createUpdatePayload(
        originalVehicle.id,
        originalVehicle.nomeModelo,
        originalVehicle,
        { ...formData, [field]: value }
      );

      // Só enviar se há mudanças reais
      if (Object.keys(payload).length > 2 || payload.images?.length) {
        // mais que id e vehicleName
        const apiResponse = await apiService.updateVehicleOptimistic(payload);

        // Mesclar resposta da API com veículo atual
        const currentVehicle = {
          ...originalVehicle,
          ...formData,
          [field]: value,
        };
        const updatedVehicle = mergeApiResponse(currentVehicle, apiResponse);
        updateVehicle(originalVehicle.id, updatedVehicle);
      }
    } catch (error) {
      console.error("Erro na atualização:", error);
      alertService.error("Erro", "Falha ao atualizar veículo");

      // Reverter atualização otimista em caso de erro
      updateVehicleOptimistic(originalVehicle.id, originalVehicle, false);
    }
  };

  const hasRequiredFields = (): boolean => {
    return !!(
      formData.placaVeiculo?.trim() &&
      formData.preco &&
      formData.preco > 0 &&
      formData.tipoVeiculo?.trim() &&
      formData.combustivel?.trim() &&
      formData.foto1 &&
      formData.foto2 &&
      formData.foto3
    );
  };

  const isButtonDisabled = (): boolean => {
    return isLoading || (!isEditMode && !hasRequiredFields());
  };

  const getDisabledMessage = (): string => {
    if (isLoading) return "";
    if (isEditMode) return ""; // Em modo de edição, não mostrar mensagem

    if (!hasRequiredFields()) {
      const missing: string[] = [];
      if (!formData.placaVeiculo?.trim()) missing.push("Placa");
      if (!formData.preco || formData.preco <= 0) missing.push("Preço");
      if (!formData.tipoVeiculo?.trim()) missing.push("Tipo");
      if (!formData.combustivel?.trim()) missing.push("Combustível");
      if (!formData.foto1) missing.push("Foto 1");
      if (!formData.foto2) missing.push("Foto 2");
      if (!formData.foto3) missing.push("Foto 3");

      return `Campos obrigatórios não preenchidos: ${missing.join(", ")}`;
    }

    return "";
  };

  const formatPrice = (value: string): string => {
    const numbersOnly = value.replace(/\D/g, "");
    if (!numbersOnly) return "";
    const number = parseInt(numbersOnly) || 0;
    return number.toLocaleString("pt-BR");
  };

  const parsePrice = (formattedPrice: string): number => {
    if (!formattedPrice) return 0;
    const cleanPrice = formattedPrice.replace(/\./g, "");
    return parseInt(cleanPrice) || 0;
  };

  const updatePrice = (text: string) => {
    const formatted = formatPrice(text);
    setPriceDisplay(formatted);
    const numericValue = parsePrice(formatted);
    updateField("preco", numericValue);
  };

  const formatKm = (value: string): string => {
    const numbersOnly = value.replace(/\D/g, "");
    if (!numbersOnly || numbersOnly === "0") return "";
    const number = parseInt(numbersOnly) || 0;
    return number.toLocaleString("pt-BR");
  };

  const parseKm = (formattedKm: string): number => {
    if (!formattedKm) return 0;
    const cleanKm = formattedKm.replace(/\./g, "");
    return parseInt(cleanKm) || 0;
  };

  const updateKm = (text: string) => {
    const formatted = formatKm(text);
    setKmDisplay(formatted);
    const numericValue = parseKm(formatted);
    updateField("km", numericValue);
  };

  const updatePlaca = (text: string) => {
    const cleanText = text.replace(/[^A-Za-z0-9]/g, "");
    updateField("placaVeiculo", cleanText.toUpperCase());
  };

  const pickImage = async (photoKey: "foto1" | "foto2" | "foto3" | string) => {
    try {
      alertService.showImagePicker(
        () => openCamera(photoKey),
        () => openIntelligentGallery(photoKey),
        () => {}
      );
    } catch (error) {
      alertService.error("Erro", "Não foi possível abrir as opções de imagem");
    }
  };

  const openIntelligentGallery = async (
    photoKey?: "foto1" | "foto2" | "foto3" | string
  ) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alertService.permissionDenied("à galeria de fotos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as any,
        allowsEditing: false,
        quality: 1.0,
        exif: false,
        allowsMultipleSelection: true,
        selectionLimit: 12,
      });

      if (!result.canceled && result.assets) {
        if (result.assets.length === 1) {
          if (
            photoKey &&
            (photoKey === "foto1" ||
              photoKey === "foto2" ||
              photoKey === "foto3")
          ) {
            setImageLoading((prev) => ({ ...prev, [photoKey]: true }));
          } else if (
            typeof photoKey === "string" &&
            photoKey.startsWith("photo-")
          ) {
            setImageLoading((prev) => ({ ...prev, [photoKey]: true }));
          }

          await handleSingleImage(result.assets[0], photoKey);
        } else {
          handleMultipleImages(result.assets);
        }
      }
    } catch (error) {
      alertService.photoError();
    }
  };

  const handleSingleImage = async (
    asset: any,
    photoKey?: "foto1" | "foto2" | "foto3" | string
  ) => {
    try {
      const optimizedUri = await optimizeImage(asset.uri);

      if (
        photoKey &&
        (photoKey === "foto1" || photoKey === "foto2" || photoKey === "foto3")
      ) {
        updateField(photoKey as keyof Vehicle, optimizedUri);
      } else if (
        typeof photoKey === "string" &&
        photoKey.startsWith("photo-")
      ) {
        setDynamicPhotos((prev) =>
          prev.map((photo) =>
            photo.id === photoKey ? { ...photo, uri: optimizedUri } : photo
          )
        );
      }
    } catch (error) {
      alertService.photoError();
    } finally {
      if (
        photoKey &&
        (photoKey === "foto1" || photoKey === "foto2" || photoKey === "foto3")
      ) {
        setImageLoading((prev) => ({ ...prev, [photoKey]: false }));
      } else if (
        typeof photoKey === "string" &&
        photoKey.startsWith("photo-")
      ) {
        setImageLoading((prev) => ({ ...prev, [photoKey]: false }));
      }
    }
  };

  const handleMultipleImages = async (assets: any[]) => {
    const newPhotos: DynamicPhoto[] = [];

    for (const asset of assets) {
      try {
        const optimizedUri = await optimizeImage(asset.uri);
        const newId = `photo-${Date.now()}-${Math.random()}`;
        newPhotos.push({ id: newId, uri: optimizedUri });
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
      }
    }

    setDynamicPhotos((prev) => [...prev, ...newPhotos]);
  };

  const openCamera = async (
    photoKey?: "foto1" | "foto2" | "foto3" | string
  ) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alertService.permissionDenied("à câmera");
        return;
      }

      if (
        photoKey &&
        (photoKey === "foto1" || photoKey === "foto2" || photoKey === "foto3")
      ) {
        setImageLoading((prev) => ({ ...prev, [photoKey]: true }));
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"] as any,
        allowsEditing: false,
        quality: 1.0,
        exif: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        await handleSingleImage(result.assets[0], photoKey);
      }
    } catch (error) {
      alertService.photoError();
    } finally {
      if (
        photoKey &&
        (photoKey === "foto1" || photoKey === "foto2" || photoKey === "foto3")
      ) {
        setImageLoading((prev) => ({ ...prev, [photoKey]: false }));
      }
    }
  };

  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      const result = await manipulateAsync(uri, [{ resize: { width: 800 } }], {
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      return result.uri;
    } catch (error) {
      console.error("Erro ao otimizar imagem:", error);
      return uri;
    }
  };

  const removePhoto = (photoId: string) => {
    setDynamicPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const removeMainPhoto = (photoKey: "foto1" | "foto2" | "foto3") => {
    updateField(photoKey, "");
  };

  const saveVehicle = async () => {
    if (isEditMode) {
      // Em modo de edição, as atualizações já são feitas em tempo real
      navigation.goBack();
      return;
    }

    // Lógica original para criação de novo veículo
    if (!hasRequiredFields()) {
      alertService.error("Erro", getDisabledMessage());
      return;
    }

    setIsLoading(true);

    try {
      const tempId = `temp-${Date.now()}`;
      const tempVehicle: Vehicle = {
        ...formData,
        id: tempId,
        _isUpdating: true,
      } as Vehicle;

      // Adiciona otimisticamente à lista
      addVehicleOptimistic(tempVehicle);

      // Preparar dados das fotos dinâmicas
      const dynamicPhotosData = await Promise.all(
        dynamicPhotos.map(async (photo, index) => {
          try {
            return await convertImageToStructuredObject(photo.uri, index + 4);
          } catch (error) {
            console.error(`Erro ao converter foto dinâmica ${index}:`, error);
            return null;
          }
        })
      );

      const validDynamicPhotos = dynamicPhotosData.filter(Boolean);

      const vehicleToSave = {
        ...formData,
        dynamicPhotos: validDynamicPhotos,
      } as Vehicle;

      const savedVehicle = await apiService.createVehicle(vehicleToSave);
      addVehicle(savedVehicle);

      // Não mostrar mais o alerta de sucesso - removido conforme solicitado
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      const tempId = `temp-${Date.now()}`;
      removeVehicle(tempId);
      alertService.error("Erro", "Falha ao cadastrar veículo");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhotoSlot = (
    photoKey: "foto1" | "foto2" | "foto3",
    label: string,
    isRequired: boolean = false
  ) => {
    const photoUri = formData[photoKey] as string;
    const isLoadingPhoto = imageLoading[photoKey];

    return (
      <View key={photoKey} style={styles.photoSlot}>
        <Text style={styles.photoLabel}>
          {label} {isRequired && <Text style={styles.required}>*</Text>}
        </Text>
        <TouchableOpacity
          style={[
            styles.photoContainer,
            isRequired && !photoUri && styles.photoContainerRequired,
          ]}
          onPress={() => pickImage(photoKey)}
          disabled={isLoadingPhoto}
        >
          {isLoadingPhoto ? (
            <ActivityIndicator size="large" color="#810CD2" />
          ) : photoUri ? (
            <>
              <Image
                source={{ uri: getImageUrl(photoUri) }}
                style={styles.photoImage}
              />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removeMainPhoto(photoKey)}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={40} color="#ccc" />
              <Text style={styles.photoPlaceholderText}>Adicionar Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderSkeletonField = (label: string) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.skeletonInput}>
        <ActivityIndicator size="small" color="#810CD2" />
        <Text style={styles.skeletonText}>Carregando...</Text>
      </View>
    </View>
  );

  const shouldShowSkeleton = (field: keyof Vehicle): boolean => {
    return (
      isEditMode &&
      !!originalVehicle?._plateRelatedLoading &&
      isPlateRelatedField(field)
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Placa do Veículo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.placaVeiculo}
              onChangeText={updatePlaca}
              placeholder="Digite a placa"
              autoCapitalize="characters"
              maxLength={7}
            />
          </View>

          {shouldShowSkeleton("nomeModelo") ? (
            renderSkeletonField("Nome/Modelo")
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome/Modelo</Text>
              <TextInput
                style={[styles.input, isEditMode && styles.inputDisabled]}
                value={formData.nomeModelo}
                onChangeText={(text) => updateField("nomeModelo", text)}
                placeholder="Nome será preenchido automaticamente"
                editable={!isEditMode}
              />
            </View>
          )}

          {shouldShowSkeleton("tipoVeiculo") ? (
            renderSkeletonField("Tipo de Veículo")
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tipo de Veículo <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isEditMode && styles.inputDisabled]}
                value={formData.tipoVeiculo}
                onChangeText={(text) => updateField("tipoVeiculo", text)}
                placeholder="Tipo será preenchido automaticamente"
                editable={!isEditMode}
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Quilometragem <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={kmDisplay}
              onChangeText={updateKm}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Preço <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={priceDisplay}
              onChangeText={updatePrice}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          {shouldShowSkeleton("combustivel") ? (
            renderSkeletonField("Combustível")
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Combustível <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isEditMode && styles.inputDisabled]}
                value={formData.combustivel}
                onChangeText={(text) => updateField("combustivel", text)}
                placeholder="Combustível será preenchido automaticamente"
                editable={!isEditMode}
              />
            </View>
          )}

          {shouldShowSkeleton("cor") ? (
            renderSkeletonField("Cor")
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cor</Text>
              <TextInput
                style={[styles.input, isEditMode && styles.inputDisabled]}
                value={formData.cor}
                onChangeText={(text) => updateField("cor", text)}
                placeholder="Cor será preenchida automaticamente"
                editable={!isEditMode}
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.observacao}
              onChangeText={(text) => updateField("observacao", text)}
              placeholder="Digite observações sobre o veículo"
              multiline
              numberOfLines={4}
            />
          </View>

          <Text style={styles.sectionTitle}>Fotos do Veículo</Text>

          <View style={styles.photosGrid}>
            {renderPhotoSlot("foto1", "Foto 1", true)}
            {renderPhotoSlot("foto2", "Foto 2", true)}
            {renderPhotoSlot("foto3", "Foto 3", true)}
          </View>

          <View style={styles.additionalPhotosSection}>
            <View style={styles.additionalPhotosHeader}>
              <Text style={styles.sectionTitle}>Fotos Adicionais</Text>
              <Text style={styles.photoCounter}>
                {dynamicPhotos.length}/9 fotos
              </Text>
            </View>

            {dynamicPhotos.length > 0 && (
              <View style={styles.photosGrid}>
                {dynamicPhotos.map((photo) => (
                  <View key={photo.id} style={styles.photoSlot}>
                    <View style={styles.photoContainer}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.photoImage}
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(photo.id)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#FF3B30"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {dynamicPhotos.length < 9 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => openIntelligentGallery()}
              >
                <Ionicons name="add" size={24} color="#810CD2" />
                <Text style={styles.addPhotoText}>Adicionar Fotos</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {!isEditMode && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              isButtonDisabled() && styles.saveButtonDisabled,
            ]}
            onPress={saveVehicle}
            disabled={isButtonDisabled()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  isButtonDisabled() && styles.saveButtonTextDisabled,
                ]}
              >
                Salvar Veículo
              </Text>
            )}
          </TouchableOpacity>

          {getDisabledMessage() && (
            <Text style={styles.disabledMessage}>{getDisabledMessage()}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  skeletonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
  },
  skeletonText: {
    marginLeft: 8,
    color: "#666",
    fontStyle: "italic",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  photoSlot: {
    width: "32%",
    marginBottom: 16,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  photoContainer: {
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
    position: "relative",
  },
  photoContainerRequired: {
    borderColor: "#FF3B30",
    borderStyle: "dashed",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
    textAlign: "center",
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  additionalPhotosSection: {
    marginTop: 16,
  },
  additionalPhotosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  photoCounter: {
    fontSize: 14,
    color: "#666",
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#810CD2",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#f8f9ff",
    gap: 8,
  },
  addPhotoText: {
    color: "#810CD2",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#810CD2",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    color: "#999",
  },
  disabledMessage: {
    textAlign: "center",
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 8,
  },
});
