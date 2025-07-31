import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Vehicle, RootStackParamList } from "../types";
import { apiService } from "../services/apiService";

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

  const isEditing = !!route.params?.vehicle;
  const vehicleToEdit = route.params?.vehicle;

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    placaVeiculo: "",
    km: 0,
    preco: 0,
    anoFabricacao: new Date().getFullYear(),
    anoModelo: new Date().getFullYear(),
    observacao: "",
    foto1: "",
    foto2: "",
    foto3: "",
    // Campos que serão preenchidos automaticamente pela API
    nomeModelo: "",
    tipoVeiculo: "",
    combustivel: "",
    cor: "",
    quantidade: 1,
  });

  const [dynamicPhotos, setDynamicPhotos] = useState<DynamicPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [plateSearchLoading, setPlateSearchLoading] = useState(false);
  const [autoDataFetched, setAutoDataFetched] = useState(false);

  useEffect(() => {
    if (vehicleToEdit) {
      setFormData(vehicleToEdit);
      // Carregar fotos extras se existirem
      const extraPhotos: DynamicPhoto[] = [];
      for (let i = 4; i <= 12; i++) {
        const photoKey = `foto${i}` as keyof Vehicle;
        const photoUri = vehicleToEdit[photoKey] as string;
        if (photoUri) {
          extraPhotos.push({
            id: `photo-${i}`,
            uri: photoUri,
          });
        }
      }
      setDynamicPhotos(extraPhotos);
      setAutoDataFetched(true);
    }
  }, [vehicleToEdit]);

  const updateField = (field: keyof Vehicle, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const searchVehicleDataByPlate = async (plate: string) => {
    if (!plate || plate.length < 7 || autoDataFetched) return;

    try {
      setPlateSearchLoading(true);
      const vehicleData = await apiService.getVehicleDataByPlate(plate);

      // Atualiza apenas os campos que vêm da API
      setFormData((prev) => ({
        ...prev,
        nomeModelo: vehicleData.nomeModelo || "",
        tipoVeiculo: vehicleData.tipoVeiculo || "",
        combustivel: vehicleData.combustivel || "",
        cor: vehicleData.cor || "",
        quantidade: vehicleData.quantidade || 1,
      }));

      setAutoDataFetched(true);

      if (vehicleData.nomeModelo) {
        Alert.alert(
          "Sucesso",
          "Dados do veículo encontrados e preenchidos automaticamente!"
        );
      }
    } catch (error) {
      console.error("Error searching vehicle data:", error);
      Alert.alert(
        "Aviso",
        "Não foi possível buscar os dados do veículo. Preencha manualmente."
      );
    } finally {
      setPlateSearchLoading(false);
    }
  };

  const pickImage = async (photoKey: "foto1" | "foto2" | "foto3" | string) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "É necessário permitir acesso à galeria de fotos"
        );
        return;
      }

      setImageLoading((prev) => ({ ...prev, [photoKey]: true }));

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (
          photoKey === "foto1" ||
          photoKey === "foto2" ||
          photoKey === "foto3"
        ) {
          updateField(photoKey as keyof Vehicle, result.assets[0].uri);
        } else {
          // É uma foto dinâmica
          setDynamicPhotos((prev) =>
            prev.map((photo) =>
              photo.id === photoKey
                ? { ...photo, uri: result.assets[0].uri }
                : photo
            )
          );
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    } finally {
      setImageLoading((prev) => ({ ...prev, [photoKey]: false }));
    }
  };

  const addDynamicPhoto = () => {
    const totalPhotos = 3 + dynamicPhotos.length; // 3 obrigatórias + dinâmicas
    if (totalPhotos >= 12) {
      Alert.alert("Limite atingido", "Máximo de 12 fotos permitidas");
      return;
    }

    const newId = `photo-${Date.now()}`;
    setDynamicPhotos((prev) => [...prev, { id: newId, uri: "" }]);
  };

  const removeDynamicPhoto = (photoId: string) => {
    setDynamicPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const validateForm = (): boolean => {
    if (!formData.placaVeiculo?.trim()) {
      Alert.alert("Erro", "Placa do veículo é obrigatória");
      return false;
    }
    if (!formData.preco || formData.preco <= 0) {
      Alert.alert("Erro", "Preço deve ser maior que zero");
      return false;
    }
    if (!formData.foto1 || !formData.foto2 || !formData.foto3) {
      Alert.alert("Erro", "As 3 primeiras fotos são obrigatórias");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Monta os dados finais incluindo fotos dinâmicas
      const finalData = { ...formData };

      // Adiciona fotos dinâmicas aos campos foto4-foto12
      dynamicPhotos.forEach((photo, index) => {
        const photoKey = `foto${index + 4}` as keyof Vehicle;
        if (photo.uri) {
          (finalData as any)[photoKey] = photo.uri;
        }
      });

      if (isEditing && vehicleToEdit) {
        await apiService.updateVehicle(vehicleToEdit.id, finalData);
        Alert.alert("Sucesso", "Veículo atualizado com sucesso");
      } else {
        await apiService.createVehicle(finalData as Omit<Vehicle, "id">);
        Alert.alert("Sucesso", "Veículo criado com sucesso");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o veículo");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequiredPhoto = (
    photoKey: "foto1" | "foto2" | "foto3",
    label: string
  ) => (
    <View style={styles.photoSection}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => pickImage(photoKey)}
        disabled={imageLoading[photoKey]}
      >
        {imageLoading[photoKey] ? (
          <ActivityIndicator size="large" color="#810CD2" />
        ) : formData[photoKey] ? (
          <Image source={{ uri: formData[photoKey] }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={40} color="#ccc" />
            <Text style={styles.photoPlaceholderText}>Adicionar Foto</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderDynamicPhoto = (photo: DynamicPhoto, index: number) => (
    <View key={photo.id} style={styles.photoSection}>
      <View style={styles.dynamicPhotoHeader}>
        <Text style={styles.label}>Foto {index + 4}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeDynamicPhoto(photo.id)}
        >
          <Ionicons name="trash" size={16} color="#FF3B30" />
          <Text style={styles.removeButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => pickImage(photo.id)}
        disabled={imageLoading[photo.id]}
      >
        {imageLoading[photo.id] ? (
          <ActivityIndicator size="large" color="#810CD2" />
        ) : photo.uri ? (
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={40} color="#ccc" />
            <Text style={styles.photoPlaceholderText}>Adicionar Foto</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? "Editar Veículo" : "Novo Veículo"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Placa do Veículo */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Placa do Veículo <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.plateContainer}>
              <TextInput
                style={[styles.input, styles.plateInput]}
                value={formData.placaVeiculo}
                onChangeText={(text) => {
                  updateField("placaVeiculo", text.toUpperCase());
                  if (text.length >= 7 && !isEditing) {
                    searchVehicleDataByPlate(text);
                  }
                }}
                placeholder="ABC-1234"
                autoCapitalize="characters"
                maxLength={8}
              />
              {plateSearchLoading && (
                <ActivityIndicator
                  size="small"
                  color="#810CD2"
                  style={styles.plateLoader}
                />
              )}
            </View>
            {!autoDataFetched && !isEditing && (
              <Text style={styles.helpText}>
                Digite a placa para buscar dados automaticamente
              </Text>
            )}
          </View>

          {/* Dados Preenchidos Automaticamente */}
          {autoDataFetched && (
            <View style={styles.autoDataSection}>
              <Text style={styles.sectionTitle}>Dados Automáticos</Text>

              <View style={styles.autoDataRow}>
                <Text style={styles.autoDataLabel}>Modelo:</Text>
                <Text style={styles.autoDataValue}>{formData.nomeModelo}</Text>
              </View>
              <View style={styles.autoDataRow}>
                <Text style={styles.autoDataLabel}>Tipo:</Text>
                <Text style={styles.autoDataValue}>{formData.tipoVeiculo}</Text>
              </View>
              <View style={styles.autoDataRow}>
                <Text style={styles.autoDataLabel}>Combustível:</Text>
                <Text style={styles.autoDataValue}>{formData.combustivel}</Text>
              </View>
              <View style={styles.autoDataRow}>
                <Text style={styles.autoDataLabel}>Cor:</Text>
                <Text style={styles.autoDataValue}>{formData.cor}</Text>
              </View>
            </View>
          )}

          {/* Quilometragem e Preço */}
          <View style={styles.row}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Quilometragem</Text>
              <TextInput
                style={styles.input}
                value={formData.km?.toString()}
                onChangeText={(text) => updateField("km", parseInt(text) || 0)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>
                Preço <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.preco?.toString()}
                onChangeText={(text) =>
                  updateField("preco", parseFloat(text) || 0)
                }
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Ano de Fabricação e Modelo */}
          <View style={styles.row}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Ano Fabricação</Text>
              <TextInput
                style={styles.input}
                value={formData.anoFabricacao?.toString()}
                onChangeText={(text) =>
                  updateField(
                    "anoFabricacao",
                    parseInt(text) || new Date().getFullYear()
                  )
                }
                placeholder={new Date().getFullYear().toString()}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Ano Modelo</Text>
              <TextInput
                style={styles.input}
                value={formData.anoModelo?.toString()}
                onChangeText={(text) =>
                  updateField(
                    "anoModelo",
                    parseInt(text) || new Date().getFullYear()
                  )
                }
                placeholder={new Date().getFullYear().toString()}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Observação */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.observacao}
              onChangeText={(text) => updateField("observacao", text)}
              placeholder="Observações adicionais..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Fotos Obrigatórias */}
          <Text style={styles.sectionTitle}>Fotos Obrigatórias</Text>
          {renderRequiredPhoto("foto1", "Foto 1")}
          {renderRequiredPhoto("foto2", "Foto 2")}
          {renderRequiredPhoto("foto3", "Foto 3")}

          {/* Fotos Adicionais */}
          <View style={styles.additionalPhotosSection}>
            <View style={styles.additionalPhotosHeader}>
              <Text style={styles.sectionTitle}>Fotos Adicionais</Text>
              <Text style={styles.photoCounter}>
                {3 + dynamicPhotos.length}/12 fotos
              </Text>
            </View>

            {dynamicPhotos.map((photo, index) =>
              renderDynamicPhoto(photo, index)
            )}

            {3 + dynamicPhotos.length < 12 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={addDynamicPhoto}
              >
                <Ionicons name="add-circle" size={24} color="#810CD2" />
                <Text style={styles.addPhotoText}>Adicionar Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? "Atualizar" : "Salvar"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  plateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  plateInput: {
    flex: 1,
  },
  plateLoader: {
    marginLeft: 8,
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  autoDataSection: {
    backgroundColor: "#f1deff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  autoDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  autoDataLabel: {
    fontSize: 14,
    color: "#810CD2",
    fontWeight: "500",
  },
  autoDataValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 24,
    marginBottom: 16,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoContainer: {
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  dynamicPhotoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  removeButtonText: {
    color: "#FF3B30",
    fontSize: 14,
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
});
