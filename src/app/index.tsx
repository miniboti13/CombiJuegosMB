import { Link, useRouter } from 'expo-router';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Puntos de corte para adaptar según la pantalla
const IS_TABLET = SCREEN_WIDTH >= 768;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Insignia / Badge Superior */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MENTE & LÓGICA</Text>
        </View>

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Sopa de Letras</Text>
          <Text style={styles.subtitle}>
            Encuentra las palabras ocultas en el menor tiempo posible.
          </Text>
        </View>

        {/* Tablero Decorativo */}
        <View style={styles.previewContainer}>
          <View style={styles.previewRow}>
            {['S', 'O', 'P', 'A'].map((letter, i) => (
              <View
                key={i}
                style={[
                  styles.previewCell,
                  (i === 0 || i === 3) && styles.previewCellActive,
                ]}
              >
                <Text
                  style={[
                    styles.previewCellText,
                    (i === 0 || i === 3) && styles.previewCellTextActive,
                  ]}
                >
                  {letter}
                </Text>
              </View>
            ))}
          </View>
        </View>



        <Link href="/game" asChild>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>¡Jugar Ahora!</Text>
        </TouchableOpacity>
        </Link>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0.0 • Creado con React Native</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.08,
    paddingVertical: 24,
  },
  badge: {
    backgroundColor: '#e7f5ff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#1c7ed6',
    fontWeight: '700',
    fontSize: IS_TABLET ? 16 : 12,
    letterSpacing: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: IS_TABLET ? 40 : 28,
  },
  title: {
    fontSize: IS_TABLET ? 48 : 32,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: IS_TABLET ? 20 : 15,
    color: '#868e96',
    textAlign: 'center',
    maxWidth: IS_TABLET ? 500 : 280,
  },
  previewContainer: {
    backgroundColor: '#ffffff',
    padding: IS_TABLET ? 20 : 12,
    borderRadius: 16,
    marginBottom: IS_TABLET ? 50 : 36,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  previewRow: {
    flexDirection: 'row',
    gap: IS_TABLET ? 12 : 8,
  },
  previewCell: {
    width: IS_TABLET ? 56 : 42,
    height: IS_TABLET ? 56 : 42,
    borderRadius: 10,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCellActive: {
    backgroundColor: '#4c6ef5',
  },
  previewCellText: {
    fontSize: IS_TABLET ? 24 : 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  previewCellTextActive: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#228be6',
    width: '100%',
    maxWidth: IS_TABLET ? 400 : 280,
    height: IS_TABLET ? 64 : 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#228be6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: IS_TABLET ? 22 : 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: IS_TABLET ? 48 : 32,
  },
  footerText: {
    fontSize: IS_TABLET ? 14 : 12,
    color: '#adb5bd',
  },
});