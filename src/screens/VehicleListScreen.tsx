import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Vehicle, VehicleFilter, RootStackParamList } from "../types";
import { VehicleCard } from "../components/VehicleCard";
import { FilterDrawer } from "../components/FilterDrawer";
import { apiService, alertService } from "../services";
import { useAuth } from "../contexts/AuthContext";

type NavigationProp = StackNavigationProp<RootStackParamList, "VehicleList">;

export const VehicleListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    logout,
    vehicles,
    setVehicles,
    replaceAllVehicles,
    loadingVehicles,
    bulkDeleteVehicles,
  } = useAuth();
  const insets = useSafeAreaInsets();

  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<VehicleFilter>({});
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilter(currentFilter);
  }, [vehicles, currentFilter]);

  const fetchVehicles = async () => {
    try {
      const data = await apiService.fetchVehicles();

      // Verificar se o array vem com apenas um objeto vazio (significa que não tem veículos no banco)
      const hasOnlyEmptyObject =
        data.length === 1 &&
        (!data[0].id ||
          data[0].id === "" ||
          !data[0].nomeModelo ||
          data[0].nomeModelo === "");

      if (hasOnlyEmptyObject) {
        console.log(
          "📋 Array com objeto vazio detectado - sem veículos no banco"
        );
        // Substituir por array vazio para mostrar tela de "sem veículos"
        replaceAllVehicles([]);
      } else {
        // For refresh/initial load, use replaceAllVehicles to reset state cleanly
        // This prevents conflicts with optimistic updates
        replaceAllVehicles(data);
      }
    } catch (error) {
      alertService.error("Erro", "Não foi possível carregar os veículos");
      console.error("Fetch vehicles error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVehicles();
    setRefreshing(false);
  }, []);

  const applyFilter = (filter: VehicleFilter) => {
    let filtered = vehicles;

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "nomeModelo":
          case "placaVeiculo":
          case "tipoVeiculo":
          case "combustivel":
          case "cor":
          case "observacao":
            filtered = filtered.filter((vehicle) =>
              vehicle[key as keyof Vehicle]
                ?.toString()
                .toLowerCase()
                .includes(value.toString().toLowerCase())
            );
            break;
          case "kmMin":
            filtered = filtered.filter(
              (vehicle) => vehicle.km >= (value as number)
            );
            break;
          case "kmMax":
            filtered = filtered.filter(
              (vehicle) => vehicle.km <= (value as number)
            );
            break;
          case "precoMin":
            filtered = filtered.filter(
              (vehicle) => vehicle.preco >= (value as number)
            );
            break;
          case "precoMax":
            filtered = filtered.filter(
              (vehicle) => vehicle.preco <= (value as number)
            );
            break;
          case "anoFabricacaoMin":
            filtered = filtered.filter(
              (vehicle) => vehicle.anoFabricacao >= (value as number)
            );
            break;
          case "anoFabricacaoMax":
            filtered = filtered.filter(
              (vehicle) => vehicle.anoFabricacao <= (value as number)
            );
            break;
          case "anoModeloMin":
            filtered = filtered.filter(
              (vehicle) => vehicle.anoModelo >= (value as number)
            );
            break;
          case "anoModeloMax":
            filtered = filtered.filter(
              (vehicle) => vehicle.anoModelo <= (value as number)
            );
            break;
          case "interessadosMin":
            filtered = filtered.filter(
              (vehicle) => vehicle.interessados >= (value as number)
            );
            break;
          case "interessadosMax":
            filtered = filtered.filter(
              (vehicle) => vehicle.interessados <= (value as number)
            );
            break;
        }
      }
    });

    setFilteredVehicles(filtered);
  };

  const handleVehiclePress = (vehicle: Vehicle) => {
    if (selectionMode) {
      toggleVehicleSelection(vehicle.id);
    } else {
      navigation.navigate("VehicleDetails", { vehicle });
    }
  };

  const toggleVehicleSelection = (vehicleId: string) => {
    const newSelection = new Set(selectedVehicles);
    if (newSelection.has(vehicleId)) {
      newSelection.delete(vehicleId);
    } else {
      newSelection.add(vehicleId);
    }
    setSelectedVehicles(newSelection);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedVehicles(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedVehicles.size === 0) {
      alertService.warning("Aviso", "Selecione pelo menos um veículo");
      return;
    }

    alertService.confirmDestructive(
      "Confirmar Exclusão",
      `Deseja excluir ${selectedVehicles.size} veículo(s) selecionado(s)?`,
      async () => {
        try {
          await bulkDeleteVehicles(Array.from(selectedVehicles));
          setSelectedVehicles(new Set());
          setSelectionMode(false);
          // Não mostrar mais alerta de sucesso - removido conforme padrão
        } catch (error) {
          alertService.error("Erro", "Não foi possível excluir os veículos");
        }
      },
      () => {},
      "Excluir",
      "Cancelar"
    );
  };

  const handleAddVehicle = () => {
    navigation.navigate("VehicleForm", {});
  };

  const handleLogout = () => {
    alertService.confirm(
      "Sair",
      "Deseja sair do aplicativo?",
      logout,
      () => {},
      "Sair",
      "Cancelar"
    );
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <VehicleCard
      vehicle={item}
      onPress={() => handleVehiclePress(item)}
      onSelect={() => toggleVehicleSelection(item.id)}
      isSelected={selectedVehicles.has(item.id)}
      showSelection={selectionMode}
      isLoading={loadingVehicles.has(item.id)}
    />
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>Veículos</Text>
        <Text style={styles.subtitle}>
          {filteredVehicles.length} veículo(s)
          {selectedVehicles.size > 0 &&
            ` • ${selectedVehicles.size} selecionado(s)`}
        </Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={24} color="#810CD2" />
      </TouchableOpacity>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="filter" size={20} color="#810CD2" />
          <Text style={styles.actionButtonText}>Filtrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            selectionMode && styles.actionButtonActive,
            selectionMode && styles.actionButtonCompact,
          ]}
          onPress={toggleSelectionMode}
        >
          <Ionicons
            name={selectionMode ? "checkmark-circle" : "checkbox-outline"}
            size={20}
            color={selectionMode ? "#fff" : "#810CD2"}
          />
          {!selectionMode && (
            <Text
              style={[
                styles.actionButtonText,
                selectionMode && styles.actionButtonTextActive,
              ]}
            >
              Selecionar
            </Text>
          )}
        </TouchableOpacity>

        {selectionMode && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleBulkDelete}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text
              style={[styles.actionButtonText, styles.actionButtonTextActive]}
            >
              Excluir
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#810CD2" />
        <Text style={styles.loadingText}>Carregando veículos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderActions()}

      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleItem}
        keyExtractor={(item, index) => {
          // Create absolutely unique key considering all states
          const baseKey = item.id || `unknown-${index}`;
          const stateKey = item._isUpdating ? "updating" : "stable";
          const fieldsKey = item._updatingFields
            ? Object.keys(item._updatingFields).join("-")
            : "none";
          return `${baseKey}-${stateKey}-${fieldsKey}-${index}`;
        }}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum veículo encontrado</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={handleAddVehicle}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <FilterDrawer
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilter={setCurrentFilter}
        onClearFilter={() => setCurrentFilter({})}
        currentFilter={currentFilter}
      />
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
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  actionsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 24,
    justifyContent: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#810CD2",
    backgroundColor: "#fff",
    gap: 6,
  },
  actionButtonCompact: {
    paddingHorizontal: 16,
    justifyContent: "center",
    width: 60,
    gap: 0,
  },
  actionButtonActive: {
    backgroundColor: "#810CD2",
  },
  actionButtonText: {
    color: "#810CD2",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtonTextActive: {
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderColor: "#FF3B30",
  },
  list: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#999",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#810CD2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
