import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Vehicle, RootStackParamList } from "../types";
import { apiService, alertService } from "../services";
import { getImageUrl } from "../utils/imageUtils";
import { useAuth } from "../contexts/AuthContext";

type NavigationProp = StackNavigationProp<RootStackParamList, "VehicleDetails">;
type RouteProps = RouteProp<RootStackParamList, "VehicleDetails">;

const { width } = Dimensions.get("window");

export const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { vehicles, deleteVehicle } = useAuth();

  // Buscar o veículo mais atualizado do contexto usando o ID da rota
  const vehicleId = route.params.vehicle.id;
  const vehicle =
    vehicles.find((v) => v.id === vehicleId) || route.params.vehicle;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const scrollViewRef = useRef<ScrollView>(null);

  // Recalcular imagens sempre que o veículo for atualizado
  const images = useMemo(() => {
    return [
      vehicle.foto1,
      vehicle.foto2,
      vehicle.foto3,
      vehicle.foto4,
      vehicle.foto5,
      vehicle.foto6,
      vehicle.foto7,
      vehicle.foto8,
      vehicle.foto9,
      vehicle.foto10,
      vehicle.foto11,
      vehicle.foto12,
    ].filter(
      (img): img is string =>
        Boolean(img) && typeof img === "string" && img.trim() !== ""
    );
  }, [vehicle]);

  // Resetar índice da imagem se necessário quando as imagens mudarem
  useEffect(() => {
    if (currentImageIndex >= images.length && images.length > 0) {
      setCurrentImageIndex(0);
    }
    // Resetar estados de loading das imagens quando mudarem
    setImageLoadingStates({});
  }, [images, currentImageIndex]);

  const formatPrice = (price: number) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatKm = (km: number) => {
    if (km === undefined || km === null || isNaN(km)) {
      return "0";
    }
    return new Intl.NumberFormat("pt-BR").format(km);
  };

  const handleEdit = () => {
    navigation.navigate("VehicleForm", { vehicle });
  };

  const handleDelete = () => {
    alertService.confirmDeleteVehicle(vehicle.nomeModelo, async () => {
      try {
        await deleteVehicle(vehicle);
        // Voltar instantaneamente sem mostrar alerta de sucesso
        navigation.goBack();
      } catch (error) {
        alertService.error("Erro", "Não foi possível excluir o veículo");
      }
    });
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalVisible(true);
  };

  const setImageLoading = (imageUrl: string, isLoading: boolean) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [imageUrl]: isLoading,
    }));
  };

  const isImageLoading = (imageUrl: string) => {
    return imageLoadingStates[imageUrl] || false;
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);

    // Garante que o índice está dentro dos limites válidos
    if (index >= 0 && index < images.length && index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  const renderImageGallery = () => {
    if (images.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Ionicons name="car" size={80} color="#ccc" />
          <Text style={styles.noImageText}>Nenhuma imagem disponível</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageGallery}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => {
            const imageUrl = getImageUrl(image);
            return imageUrl ? (
              <View key={`image-${index}`} style={styles.imageContainer}>
                {isImageLoading(imageUrl) && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator size="large" color="#810CD2" />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleImagePress(imageUrl)}
                  activeOpacity={0.9}
                  style={styles.imageWrapper}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    onLoadStart={() => setImageLoading(imageUrl, true)}
                    onLoad={() => setImageLoading(imageUrl, false)}
                    onError={() => setImageLoading(imageUrl, false)}
                  />
                </TouchableOpacity>
              </View>
            ) : null;
          })}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={`indicator-${index}`}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <ActivityIndicator size="small" color="#810CD2" />
      <Text style={styles.skeletonText}>Carregando...</Text>
    </View>
  );

  const renderDetailRow = (
    label: string,
    value: string | number,
    icon?: string,
    isLoading?: boolean
  ) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color="#666"
            style={styles.detailIcon}
          />
        )}
        <Text style={styles.detailLabelText}>{label}</Text>
      </View>
      {isLoading ? (
        renderSkeletonLoader()
      ) : (
        <Text style={styles.detailValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.nomeModelo}
        </Text>
        <TouchableOpacity onPress={handleEdit}>
          <Ionicons
            name="create-outline"
            size={26}
            color="#810CD2"
            style={{ fontWeight: "bold" }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}

        <View style={styles.infoContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.vehicleTitle}>
              {vehicle._plateRelatedLoading
                ? "Carregando..."
                : vehicle.nomeModelo}
            </Text>
            <Text style={styles.vehiclePrice}>
              {formatPrice(vehicle.preco)}
            </Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              {vehicle._plateRelatedLoading ? (
                renderSkeletonLoader()
              ) : (
                <Text style={styles.quickInfoText}>{vehicle.anoModelo}</Text>
              )}
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="speedometer" size={16} color="#666" />
              <Text style={styles.quickInfoText}>
                {formatKm(vehicle.km)} km
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="color-palette" size={16} color="#666" />
              {vehicle._plateRelatedLoading ? (
                renderSkeletonLoader()
              ) : (
                <Text style={styles.quickInfoText}>{vehicle.cor}</Text>
              )}
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Informações Detalhadas</Text>

            {renderDetailRow("Placa", vehicle.placaVeiculo || "N/I", "card")}
            {renderDetailRow("Tipo", vehicle.tipoVeiculo || "N/I", "car")}
            {renderDetailRow(
              "Ano de Fabricação",
              (vehicle.anoFabricacao || 0).toString(),
              "build",
              vehicle._plateRelatedLoading
            )}
            {renderDetailRow(
              "Combustível",
              vehicle.combustivel || "N/I",
              "flash"
            )}
            {renderDetailRow(
              "Interessados",
              (vehicle.interessados || 0).toString(),
              "people"
            )}

            {vehicle.observacao && (
              <View style={styles.observationContainer}>
                <Text style={styles.sectionTitle}>Observações</Text>
                <Text style={styles.observationText}>{vehicle.observacao}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.editButton,
            vehicle._isUpdating && styles.editButtonLoading,
          ]}
          onPress={handleEdit}
          disabled={vehicle._isUpdating}
        >
          {vehicle._isUpdating ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.editButtonText}>Salvando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="create" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Editar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de visualização de imagem */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalCloseArea}
            onPress={() => setIsImageModalVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.imageModalContainer}>
              <TouchableOpacity
                style={styles.imageModalCloseButton}
                onPress={() => setIsImageModalVisible(false)}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>

              {selectedImageUrl ? (
                <Image
                  source={{ uri: selectedImageUrl }}
                  style={styles.imageModalImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    height: 250,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width,
    height: 250,
    resizeMode: "cover",
  },
  noImageContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "#fff",
  },
  infoContainer: {
    backgroundColor: "#fff",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 16,
    minHeight: 400,
  },
  titleSection: {
    marginBottom: 20,
  },
  vehicleTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  vehiclePrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E7D32",
  },
  quickInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickInfoText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabelText: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  observationContainer: {
    marginTop: 24,
  },
  observationText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#810CD2",
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos do modal de imagem
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalCloseArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContainer: {
    width: "90%",
    height: "80%",
    position: "relative",
  },
  imageModalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  imageModalImage: {
    width: "100%",
    height: "100%",
  },
  skeletonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
  },
  skeletonText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#666",
  },
  imageContainer: {
    position: "relative",
    width: width,
    height: 250,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(248, 248, 248, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderRadius: 8,
  },
  editButtonLoading: {
    backgroundColor: "#B888F5", // Cor mais clara quando em loading
    opacity: 0.8,
  },
});
