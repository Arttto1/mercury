import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Vehicle, RootStackParamList } from "../types";
import { apiService } from "../services/apiService";

type NavigationProp = StackNavigationProp<RootStackParamList, "VehicleDetails">;
type RouteProps = RouteProp<RootStackParamList, "VehicleDetails">;

const { width } = Dimensions.get("window");

export const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();

  const { vehicle } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
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
  ].filter(Boolean) as string[];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatKm = (km: number) => {
    return new Intl.NumberFormat("pt-BR").format(km);
  };

  const handleEdit = () => {
    navigation.navigate("VehicleForm", { vehicle });
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja excluir este veículo? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deleteVehicle(vehicle.id);
              Alert.alert("Sucesso", "Veículo excluído com sucesso");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o veículo");
            }
          },
        },
      ]
    );
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
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.floor(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
        >
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.image} />
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
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

  const renderDetailRow = (
    label: string,
    value: string | number,
    icon?: string
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
      <Text style={styles.detailValue}>{value}</Text>
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
            <Text style={styles.vehicleTitle}>{vehicle.nomeModelo}</Text>
            <Text style={styles.vehiclePrice}>
              {formatPrice(vehicle.preco)}
            </Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.quickInfoText}>{vehicle.anoModelo}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="speedometer" size={16} color="#666" />
              <Text style={styles.quickInfoText}>
                {formatKm(vehicle.km)} km
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="color-palette" size={16} color="#666" />
              <Text style={styles.quickInfoText}>{vehicle.cor}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Informações Detalhadas</Text>

            {renderDetailRow("Placa", vehicle.placaVeiculo, "card")}
            {renderDetailRow("Tipo", vehicle.tipoVeiculo, "car")}
            {renderDetailRow(
              "Ano de Fabricação",
              vehicle.anoFabricacao.toString(),
              "build"
            )}
            {renderDetailRow("Combustível", vehicle.combustivel, "flash")}
            {renderDetailRow(
              "Quantidade",
              vehicle.quantidade.toString(),
              "cube"
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
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Editar</Text>
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
});
