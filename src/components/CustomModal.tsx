import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export interface CustomModalButton {
  text: string;
  onPress: () => void;
  style?: "primary" | "secondary" | "destructive";
}

export interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  buttons?: CustomModalButton[];
  showCloseButton?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = "info",
  buttons = [],
  showCloseButton = true,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          iconName: "checkmark-circle" as const,
          iconColor: "#4CAF50",
          borderColor: "#4CAF50",
          backgroundColor: "#E8F5E8",
        };
      case "error":
        return {
          iconName: "close-circle" as const,
          iconColor: "#F44336",
          borderColor: "#F44336",
          backgroundColor: "#FFEBEE",
        };
      case "warning":
        return {
          iconName: "warning" as const,
          iconColor: "#FF9800",
          borderColor: "#FF9800",
          backgroundColor: "#FFF3E0",
        };
      case "info":
      default:
        return {
          iconName: "information-circle" as const,
          iconColor: "#810CD2",
          borderColor: "#810CD2",
          backgroundColor: "#F3E5F5",
        };
    }
  };

  const typeStyles = getTypeStyles();

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case "primary":
        return [styles.button, styles.primaryButton];
      case "destructive":
        return [styles.button, styles.destructiveButton];
      case "secondary":
      default:
        return [styles.button, styles.secondaryButton];
    }
  };

  const getButtonTextStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case "primary":
        return [styles.buttonText, styles.primaryButtonText];
      case "destructive":
        return [styles.buttonText, styles.destructiveButtonText];
      case "secondary":
      default:
        return [styles.buttonText, styles.secondaryButtonText];
    }
  };

  const defaultButtons: CustomModalButton[] =
    buttons.length === 0
      ? [{ text: "OK", onPress: onClose, style: "primary" }]
      : buttons;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ scale: scaleValue }],
                  borderTopColor: typeStyles.borderColor,
                  backgroundColor: typeStyles.backgroundColor,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={typeStyles.iconName}
                    size={32}
                    color={typeStyles.iconColor}
                  />
                </View>
                {showCloseButton && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.title, { color: typeStyles.iconColor }]}>
                  {title}
                </Text>
                {message && <Text style={styles.message}>{message}</Text>}
              </View>

              {/* Buttons */}
              {defaultButtons.length > 0 && (
                <View style={styles.buttonContainer}>
                  {defaultButtons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={getButtonStyle(button.style)}
                      onPress={() => {
                        button.onPress();
                        onClose();
                      }}
                    >
                      <Text style={getButtonTextStyle(button.style)}>
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    borderTopWidth: 4,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    padding: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#810CD2",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#810CD2",
  },
  destructiveButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "white",
  },
  secondaryButtonText: {
    color: "#810CD2",
  },
  destructiveButtonText: {
    color: "white",
  },
});
