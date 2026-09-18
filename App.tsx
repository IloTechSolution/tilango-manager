import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tilango-manager</Text>
      <Text>Football manager sim — fiksi, offline, open-source.</Text>
      <Text style={styles.hint}>P0 scaffold OK. Scan QR via Expo Go untuk test di HP.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    marginTop: 8,
    fontStyle: 'italic',
  },
});
