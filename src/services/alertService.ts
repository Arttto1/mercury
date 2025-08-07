import { Alert, Platform } from "react-native";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
  icon?: string;
}

export interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: "success" | "error" | "warning" | "info";
}

export interface ActionSheetOption {
  text: string;
  onPress: () => void;
  icon?: string;
  style?: "default" | "cancel" | "destructive";
}

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number;
}

class AlertService {
  // Alert padrão com estilo personalizado
  showAlert(options: AlertOptions) {
    const { title, message, buttons = [], type = "info" } = options;

    // Remove emojis - usar apenas texto
    const getIcon = () => {
      switch (type) {
        case "success":
          return "";
        case "error":
          return "";
        case "warning":
          return "";
        case "info":
          return "";
        default:
          return "";
      }
    };

    const finalTitle = `${getIcon()}${title}`;

    // Se não há botões personalizados, adiciona botão padrão
    const finalButtons: AlertButton[] =
      buttons.length > 0 ? buttons : [{ text: "OK", style: "default" }];

    Alert.alert(
      finalTitle,
      message,
      finalButtons.map((button) => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style as any,
      }))
    );
  }

  // Alert de sucesso
  success(title: string, message?: string, onPress?: () => void) {
    this.showAlert({
      title,
      message,
      type: "success",
      buttons: [{ text: "OK", onPress, style: "default" }],
    });
  }

  // Alert de erro
  error(title: string, message?: string, onPress?: () => void) {
    this.showAlert({
      title,
      message,
      type: "error",
      buttons: [{ text: "OK", onPress, style: "default" }],
    });
  }

  // Alert de aviso
  warning(title: string, message?: string, onPress?: () => void) {
    this.showAlert({
      title,
      message,
      type: "warning",
      buttons: [{ text: "OK", onPress, style: "default" }],
    });
  }

  // Alert de informação
  info(title: string, message?: string, onPress?: () => void) {
    this.showAlert({
      title,
      message,
      type: "info",
      buttons: [{ text: "OK", onPress, style: "default" }],
    });
  }

  // Alert de confirmação
  confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = "Confirmar",
    cancelText: string = "Cancelar"
  ) {
    this.showAlert({
      title,
      message,
      type: "warning",
      buttons: [
        { text: cancelText, onPress: onCancel || (() => {}), style: "cancel" },
        { text: confirmText, onPress: onConfirm, style: "default" },
      ],
    });
  }

  // Alert de confirmação destrutiva (deletar, etc)
  confirmDestructive(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = "Deletar",
    cancelText: string = "Cancelar"
  ) {
    this.showAlert({
      title,
      message,
      type: "error",
      buttons: [
        { text: cancelText, onPress: onCancel || (() => {}), style: "cancel" },
        { text: confirmText, onPress: onConfirm, style: "destructive" },
      ],
    });
  }

  // ActionSheet para seleção de imagem
  showImagePicker(
    onCamera: () => void,
    onGallery: () => void,
    onCancel?: () => void
  ) {
    const options: ActionSheetOption[] = [
      {
        text: "Tirar Foto",
        onPress: onCamera,
        icon: "camera",
      },
      {
        text: "Escolher da Galeria",
        onPress: onGallery,
        icon: "image",
      },
      {
        text: "Cancelar",
        onPress: onCancel || (() => {}),
        style: "cancel",
      },
    ];

    this.showActionSheet({
      title: "Selecionar Imagem",
      message: "Escolha uma opção:",
      options,
    });
  }

  // ActionSheet genérico
  showActionSheet(options: ActionSheetOptions) {
    const { title, message, options: actionOptions } = options;

    const buttons = actionOptions.map((option) => ({
      text: option.text,
      onPress: option.onPress,
      style: option.style || "default",
    }));

    Alert.alert(title || "Selecione uma opção", message, buttons);
  }

  // Alert de loading (simulado com mensagem)
  showLoading(message: string = "Carregando...") {
    // No React Native puro, não temos um loading nativo
    // Mas podemos mostrar uma mensagem informativa
    this.info("Processando", message);
  }

  // Alert para input de texto (simulado)
  prompt(
    title: string,
    message: string,
    onSubmit: (text: string) => void,
    onCancel?: () => void,
    placeholder: string = "",
    defaultValue: string = ""
  ) {
    // React Native não tem prompt nativo no Alert
    // Podemos simular ou sugerir uso de um modal customizado
    if (Platform.OS === "ios") {
      Alert.prompt(
        title,
        message,
        [
          {
            text: "Cancelar",
            onPress: onCancel || (() => {}),
            style: "cancel",
          },
          { text: "OK", onPress: (value?: string) => onSubmit(value || "") },
        ],
        "plain-text",
        defaultValue,
        "default"
      );
    } else {
      // No Android, mostra um alert informando que precisa de input manual
      this.info(
        title,
        `${message}\n\nPor favor, use o campo de entrada disponível na tela.`
      );
    }
  }

  // Shortcuts para ações comuns
  vehicleCreated(onPress?: () => void) {
    this.success(
      "Veículo Criado!",
      "O veículo foi adicionado com sucesso à sua lista.",
      onPress
    );
  }

  vehicleUpdated(onPress?: () => void) {
    this.success(
      "Veículo Atualizado!",
      "As informações do veículo foram salvas com sucesso.",
      onPress
    );
  }

  vehicleDeleted(onPress?: () => void) {
    this.success(
      "Veículo Removido!",
      "O veículo foi removido da sua lista.",
      onPress
    );
  }

  confirmDeleteVehicle(
    vehicleName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) {
    this.confirmDestructive(
      "Deletar Veículo",
      `Tem certeza que deseja remover "${vehicleName}"? Esta ação não pode ser desfeita.`,
      onConfirm,
      onCancel || (() => {}),
      "Deletar",
      "Cancelar"
    );
  }

  networkError(onRetry?: () => void) {
    const buttons: AlertButton[] = [{ text: "OK", style: "cancel" }];

    if (onRetry) {
      buttons.push({ text: "Tentar Novamente", onPress: onRetry });
    }

    this.showAlert({
      title: "Erro de Conexão",
      message:
        "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
      type: "error",
      buttons,
    });
  }

  invalidCredentials(onPress?: () => void) {
    this.error(
      "Credenciais Inválidas",
      "Usuário ou senha incorretos. Tente novamente.",
      onPress
    );
  }

  photoSaved(onPress?: () => void) {
    this.success(
      "Foto Salva!",
      "A imagem foi adicionada ao veículo com sucesso.",
      onPress
    );
  }

  photoError(onPress?: () => void) {
    this.error(
      "Erro na Foto",
      "Não foi possível processar a imagem. Tente novamente.",
      onPress
    );
  }

  permissionDenied(permission: string, onSettings?: () => void) {
    const buttons: AlertButton[] = [{ text: "OK", style: "cancel" }];

    if (onSettings) {
      buttons.push({ text: "Configurações", onPress: onSettings });
    }

    this.showAlert({
      title: "Permissão Necessária",
      message: `Para usar esta funcionalidade, é necessário permitir o acesso ${permission}. Você pode alterar isso nas configurações do app.`,
      type: "warning",
      buttons,
    });
  }
}

export const alertService = new AlertService();
