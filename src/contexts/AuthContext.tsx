import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  LoginCredentials,
  Vehicle,
  VehicleUpdatePayload,
} from "../types";
import { apiService } from "../services/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  // Vehicle list management
  vehicles: Vehicle[];
  loadingVehicles: Set<string>; // IDs dos veículos em loading
  setVehicles: (vehicles: Vehicle[]) => void;
  replaceAllVehicles: (vehicles: Vehicle[]) => void; // For initial fetch
  addVehicle: (vehicle: Vehicle) => void;
  addVehicleOptimistic: (tempVehicle: Vehicle) => void; // Adição otimista
  updateVehicle: (id: string, vehicle: Vehicle) => void;
  updateVehicleOptimistic: (
    id: string,
    updates: Partial<Vehicle>,
    isPlateRelated?: boolean
  ) => void;
  removeVehicle: (id: string) => void;
  deleteVehicle: (vehicle: Vehicle) => Promise<void>; // API call + remove from list
  bulkDeleteVehicles: (vehicleIds: string[]) => Promise<void>; // Bulk delete
  setVehicleLoading: (id: string, loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const savedUser = await AsyncStorage.getItem("@user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const loggedUser = await apiService.login(credentials);
      await AsyncStorage.setItem("@user", JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
      await AsyncStorage.removeItem("@user");
      setUser(null);
      setVehicles([]); // Clear vehicles on logout
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vehicle management functions
  const replaceAllVehicles = (newVehicles: Vehicle[]) => {
    // Simple replacement for initial fetch - ignore optimistic updates
    setVehicles(newVehicles);
  };

  const smartSetVehicles = (newVehicles: Vehicle[]) => {
    setVehicles((prevVehicles) => {
      // Get vehicles that are currently being updated optimistically
      const updatingVehicles = prevVehicles.filter((v) => v._isUpdating);

      // If no vehicles are being updated, just replace all
      if (updatingVehicles.length === 0) {
        return newVehicles;
      }

      // Merge: keep optimistic vehicles, replace others with backend data
      const mergedVehicles = [...newVehicles];

      // Add or replace with optimistic vehicles
      updatingVehicles.forEach((updatingVehicle) => {
        const existingIndex = mergedVehicles.findIndex(
          (v) => v.id === updatingVehicle.id
        );
        if (existingIndex !== -1) {
          // Replace with optimistic version
          mergedVehicles[existingIndex] = updatingVehicle;
        } else {
          // Add optimistic vehicle that doesn't exist in backend yet
          mergedVehicles.unshift(updatingVehicle);
        }
      });

      return mergedVehicles;
    });
  };

  const addVehicle = (vehicle: Vehicle) => {
    setVehicles((prev) => {
      // Remove any existing vehicle with the same ID to avoid duplicates
      const filteredVehicles = prev.filter((v) => v.id !== vehicle.id);
      return [vehicle, ...filteredVehicles]; // Add to beginning for newest first
    });
    // Remove from loading when vehicle is successfully added
    setLoadingVehicles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(vehicle.id);
      return newSet;
    });
  };

  const addVehicleOptimistic = (tempVehicle: Vehicle) => {
    setVehicles((prev) => {
      // Check if vehicle already exists to avoid duplicates
      const existingIndex = prev.findIndex((v) => v.id === tempVehicle.id);
      if (existingIndex !== -1) {
        // Replace existing vehicle
        const updated = [...prev];
        updated[existingIndex] = tempVehicle;
        return updated;
      }
      // Add new vehicle to beginning
      return [tempVehicle, ...prev];
    });
    setLoadingVehicles((prev) => new Set(prev).add(tempVehicle.id));
  };

  const updateVehicle = (id: string, updatedVehicle: Vehicle) => {
    setVehicles((prev) => {
      const vehicleIndex = prev.findIndex((vehicle) => vehicle.id === id);
      if (vehicleIndex === -1) {
        // Vehicle not found, add it
        return [updatedVehicle, ...prev];
      }
      // Update existing vehicle
      const updated = [...prev];
      updated[vehicleIndex] = updatedVehicle;
      return updated;
    });
    // Remove from loading when vehicle is successfully updated
    setLoadingVehicles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const updateVehicleOptimistic = (
    id: string,
    updates: Partial<Vehicle>,
    isPlateRelated = false
  ) => {
    setVehicles((prev) => {
      const vehicleIndex = prev.findIndex((vehicle) => vehicle.id === id);
      if (vehicleIndex === -1) {
        return prev; // Vehicle not found
      }

      const updated = [...prev];
      const currentVehicle = updated[vehicleIndex];

      // Determine which fields are being updated
      const updatingFields = Object.keys(updates) as (keyof Vehicle)[];

      updated[vehicleIndex] = {
        ...currentVehicle,
        ...updates,
        _isUpdating: true,
        _updatingFields: updatingFields,
        _plateRelatedLoading: isPlateRelated,
      };

      return updated;
    });
  };

  const removeVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    setLoadingVehicles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const deleteVehicle = async (vehicle: Vehicle): Promise<void> => {
    try {
      console.log("🚀 Deletando veículo ID:", vehicle.id);

      // Set loading state
      setVehicleLoading(vehicle.id, true);

      removeVehicle(vehicle.id);
      // Call API to delete vehicle
      await apiService.deleteVehicle(vehicle);
      console.log("✅ API sucesso, removendo da lista");

      // Remove from local state - SIMPLES E DIRETO
    } catch (error) {
      console.error("❌ Erro no deleteVehicle:", error);
      setVehicleLoading(vehicle.id, false);
      throw error;
    }
  };

  const bulkDeleteVehicles = async (vehicleIds: string[]): Promise<void> => {
    try {
      // Encontrar os veículos pelos IDs
      const vehiclesToDelete = vehicles.filter((v) =>
        vehicleIds.includes(v.id)
      );

      if (vehiclesToDelete.length === 0) {
        throw new Error("Nenhum veículo encontrado para deletar");
      }

      // Set loading state for all vehicles
      vehicleIds.forEach((id) => setVehicleLoading(id, true));

      // Call API to bulk delete
      await apiService.bulkDeleteVehicles(vehiclesToDelete);

      // Remove all vehicles from local state after successful API call
      setVehicles((prev) => prev.filter((v) => !vehicleIds.includes(v.id)));
    } catch (error) {
      console.error("❌ Erro no bulkDeleteVehicles:", error);
      // Remove loading state on error
      vehicleIds.forEach((id) => setVehicleLoading(id, false));
      throw error;
    }
  };

  const setVehicleLoading = (id: string, loading: boolean) => {
    setLoadingVehicles((prev) => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const isAuthenticated = !!user && apiService.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
        vehicles,
        loadingVehicles,
        setVehicles: smartSetVehicles,
        replaceAllVehicles,
        addVehicle,
        addVehicleOptimistic,
        updateVehicle,
        updateVehicleOptimistic,
        removeVehicle,
        deleteVehicle,
        bulkDeleteVehicles,
        setVehicleLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
