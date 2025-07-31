import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VehicleFilter } from "../types";

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filter: VehicleFilter) => void;
  onClearFilter: () => void;
  currentFilter: VehicleFilter;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  visible,
  onClose,
  onApplyFilter,
  onClearFilter,
  currentFilter,
}) => {
  const [filter, setFilter] = useState<VehicleFilter>(currentFilter);

  const handleApply = () => {
    onApplyFilter(filter);
    onClose();
  };

  const handleClear = () => {
    const emptyFilter = {};
    setFilter(emptyFilter);
    onClearFilter();
    onClose();
  };

  const updateFilter = (key: keyof VehicleFilter, value: string | number) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filtros</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nome/Modelo */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Nome/Modelo</Text>
            <TextInput
              style={styles.input}
              value={filter.nomeModelo || ""}
              onChangeText={(text) => updateFilter("nomeModelo", text)}
              placeholder="Digite o nome ou modelo"
            />
          </View>

          {/* Placa */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Placa</Text>
            <TextInput
              style={styles.input}
              value={filter.placaVeiculo || ""}
              onChangeText={(text) => updateFilter("placaVeiculo", text)}
              placeholder="Digite a placa"
            />
          </View>

          {/* Quilometragem */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Quilometragem</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.kmMin?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("kmMin", text ? parseInt(text) : "")
                }
                placeholder="Min"
                keyboardType="numeric"
              />
              <Text style={styles.rangeText}>até</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.kmMax?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("kmMax", text ? parseInt(text) : "")
                }
                placeholder="Max"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Preço */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Preço</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.precoMin?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("precoMin", text ? parseFloat(text) : "")
                }
                placeholder="Min"
                keyboardType="numeric"
              />
              <Text style={styles.rangeText}>até</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.precoMax?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("precoMax", text ? parseFloat(text) : "")
                }
                placeholder="Max"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Tipo de Veículo */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Tipo de Veículo</Text>
            <TextInput
              style={styles.input}
              value={filter.tipoVeiculo || ""}
              onChangeText={(text) => updateFilter("tipoVeiculo", text)}
              placeholder="Ex: Sedan, SUV, Hatch"
            />
          </View>

          {/* Ano de Fabricação */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Ano de Fabricação</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.anoFabricacaoMin?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("anoFabricacaoMin", text ? parseInt(text) : "")
                }
                placeholder="Min"
                keyboardType="numeric"
              />
              <Text style={styles.rangeText}>até</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.anoFabricacaoMax?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("anoFabricacaoMax", text ? parseInt(text) : "")
                }
                placeholder="Max"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Ano do Modelo */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Ano do Modelo</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.anoModeloMin?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("anoModeloMin", text ? parseInt(text) : "")
                }
                placeholder="Min"
                keyboardType="numeric"
              />
              <Text style={styles.rangeText}>até</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.anoModeloMax?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("anoModeloMax", text ? parseInt(text) : "")
                }
                placeholder="Max"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Combustível */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Combustível</Text>
            <TextInput
              style={styles.input}
              value={filter.combustivel || ""}
              onChangeText={(text) => updateFilter("combustivel", text)}
              placeholder="Ex: Flex, Gasolina, Diesel"
            />
          </View>

          {/* Cor */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Cor</Text>
            <TextInput
              style={styles.input}
              value={filter.cor || ""}
              onChangeText={(text) => updateFilter("cor", text)}
              placeholder="Digite a cor"
            />
          </View>

          {/* Quantidade */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Quantidade</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.quantidadeMin?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("quantidadeMin", text ? parseInt(text) : "")
                }
                placeholder="Min"
                keyboardType="numeric"
              />
              <Text style={styles.rangeText}>até</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={filter.quantidadeMax?.toString() || ""}
                onChangeText={(text) =>
                  updateFilter("quantidadeMax", text ? parseInt(text) : "")
                }
                placeholder="Max"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Observação */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={styles.input}
              value={filter.observacao || ""}
              onChangeText={(text) => updateFilter("observacao", text)}
              placeholder="Buscar nas observações"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeText: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#810CD2",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#810CD2",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#810CD2",
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
