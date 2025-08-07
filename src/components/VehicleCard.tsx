import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Vehicle } from "../types";
import { getImageUrl } from "../utils/imageUtils";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  showSelection?: boolean;
  isLoading?: boolean; // Novo prop para loading geral do card
}

// Componente Skeleton para loading de campos específicos
const SkeletonText: React.FC<{ width?: number; height?: number }> = ({
  width = 100,
  height = 16,
}) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", "#F5F5F5"],
  });

  return (
    <Animated.View
      style={[styles.skeleton, { width, height, backgroundColor }]}
    />
  );
};

// Componente para texto com possível skeleton
const FieldText: React.FC<{
  fieldName: keyof Vehicle;
  vehicle: Vehicle;
  style: any;
  children: React.ReactNode;
  skeletonWidth?: number;
  skeletonHeight?: number;
  numberOfLines?: number;
}> = ({
  fieldName,
  vehicle,
  style,
  children,
  skeletonWidth,
  skeletonHeight,
  numberOfLines,
}) => {
  const isFieldUpdating =
    vehicle._isUpdating && vehicle._updatingFields?.includes(fieldName);

  if (isFieldUpdating) {
    return <SkeletonText width={skeletonWidth} height={skeletonHeight} />;
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  onSelect,
  isSelected = false,
  showSelection = false,
  isLoading = false,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const formatPrice = (price: number) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "R$ 0";
    }
    return `R$ ${price.toLocaleString("pt-BR")}`;
  };

  const formatKm = (km: number) => {
    if (km === undefined || km === null || isNaN(km) || km === 0) {
      return "0";
    }
    return km.toLocaleString("pt-BR");
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showSelection && (
        <TouchableOpacity style={styles.selectionButton} onPress={onSelect}>
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={isSelected ? "#810CD2" : "#666"}
          />
        </TouchableOpacity>
      )}

      <View style={styles.imageContainer}>
        {vehicle.foto1 && getImageUrl(vehicle.foto1) && !imageError ? (
          <>
            <Image
              source={{ uri: getImageUrl(vehicle.foto1) }}
              style={styles.image}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color="#810CD2" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="car" size={40} color="#ccc" />
          </View>
        )}

        {/* Badge "Atualizando" no canto da imagem */}
        {vehicle._isUpdating && (
          <View style={styles.updatingBadge}>
            <ActivityIndicator size={12} color="white" />
            <Text style={styles.updatingText}>Atualizando</Text>
          </View>
        )}
      </View>

      {/* Overlay de loading geral do card */}
      {isLoading && (
        <View style={styles.cardLoadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#810CD2" />
            <Text style={styles.loadingText}>Salvando...</Text>
          </View>
        </View>
      )}

      <View
        style={[
          styles.infoContainer,
          isLoading && styles.infoContainerDisabled,
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingInfo}>
            <Text style={styles.loadingTitle}>Processando veículo...</Text>
            <Text style={styles.loadingSubtitle}>Aguarde um momento</Text>
          </View>
        ) : (
          <>
            <FieldText
              fieldName="nomeModelo"
              vehicle={vehicle}
              style={styles.title}
              numberOfLines={2}
              skeletonWidth={120}
              skeletonHeight={18}
            >
              {vehicle.nomeModelo || "Modelo não informado"}
            </FieldText>

            <View style={styles.detailsRow}>
              <FieldText
                fieldName="anoModelo"
                vehicle={vehicle}
                style={styles.year}
                skeletonWidth={60}
                skeletonHeight={14}
              >
                {vehicle.anoModelo || "----"}
              </FieldText>
              <FieldText
                fieldName="combustivel"
                vehicle={vehicle}
                style={styles.fuel}
                skeletonWidth={40}
                skeletonHeight={14}
              >
                {vehicle.combustivel || "N/I"}
              </FieldText>
            </View>

            <View style={styles.detailsRow}>
              <FieldText
                fieldName="km"
                vehicle={vehicle}
                style={styles.km}
                skeletonWidth={70}
                skeletonHeight={14}
              >
                {formatKm(vehicle.km)} km
              </FieldText>
              <FieldText
                fieldName="cor"
                vehicle={vehicle}
                style={styles.color}
                skeletonWidth={50}
                skeletonHeight={14}
              >
                {vehicle.cor || "N/I"}
              </FieldText>
            </View>

            <View style={styles.priceRow}>
              <FieldText
                fieldName="preco"
                vehicle={vehicle}
                style={styles.price}
                skeletonWidth={90}
                skeletonHeight={20}
              >
                {formatPrice(vehicle.preco)}
              </FieldText>
              {(vehicle.interessados || 0) > 0 && (
                <View style={styles.quantityBadge}>
                  <FieldText
                    fieldName="interessados"
                    vehicle={vehicle}
                    style={styles.quantityText}
                    skeletonWidth={20}
                    skeletonHeight={12}
                  >
                    {vehicle.interessados}
                  </FieldText>
                </View>
              )}
            </View>

            {vehicle.observacao && (
              <FieldText
                fieldName="observacao"
                vehicle={vehicle}
                style={styles.observation}
                numberOfLines={2}
                skeletonWidth={150}
                skeletonHeight={32}
              >
                {vehicle.observacao}
              </FieldText>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: "#810CD2",
  },
  selectionButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 4,
  },
  imageContainer: {
    height: 180,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  year: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  fuel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  km: {
    fontSize: 14,
    color: "#666",
  },
  color: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
  },
  quantityBadge: {
    backgroundColor: "#f1deff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 12,
    color: "#810CD2",
    fontWeight: "500",
  },
  observation: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  // Skeleton loading styles
  skeleton: {
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  updatingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(129, 12, 210, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
  },
  updatingText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },
  // Novos estilos para loading
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 12,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#810CD2",
    fontWeight: "600",
  },
  infoContainerDisabled: {
    opacity: 0.6,
  },
  loadingInfo: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
