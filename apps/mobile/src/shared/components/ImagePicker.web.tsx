const ImagePicker = {
  requestMediaLibraryPermissionsAsync: async () => ({
    granted: false,
    canAskAgain: false,
    expires: "never",
    status: "denied",
  }),
  launchImageLibraryAsync: async () => ({
    canceled: true,
    assets: [],
  }),
  MediaTypeOptions: {
    Images: "images",
  },
};

export default ImagePicker;
