import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export function AnimatedSplashOverlay() {
  return null;
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Image
        source={require('../../assets/images/splash-icon.png')}
        style={styles.image}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: 76,
    height: 71,
  },
});
