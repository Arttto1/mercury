import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Vehicle } from "../types";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  showSelection?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  onSelect,
  isSelected = false,
  showSelection = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatKm = (km: number) => {
    return new Intl.NumberFormat("pt-BR").format(km);
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
        {vehicle.foto1 ? (
          <Image source={{ uri: vehicle.foto1 }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="car" size={40} color="#ccc" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {vehicle.nomeModelo}
        </Text>

        <View style={styles.detailsRow}>
          <Text style={styles.year}>{vehicle.anoModelo}</Text>
          <Text style={styles.fuel}>{vehicle.combustivel}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.km}>{formatKm(vehicle.km)} km</Text>
          <Text style={styles.color}>{vehicle.cor}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(vehicle.preco)}</Text>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>Qtd: {vehicle.quantidade}</Text>
          </View>
        </View>

        {vehicle.observacao && (
          <Text style={styles.observation} numberOfLines={2}>
            {vehicle.observacao}
          </Text>
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
});
