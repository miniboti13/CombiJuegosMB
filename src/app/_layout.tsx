import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Oculta la barra de navegación por defecto de Expo
      }}
    />
  );
}