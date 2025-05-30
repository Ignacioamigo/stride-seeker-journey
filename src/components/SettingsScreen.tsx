
import React from 'react';
import { View, Text, ScrollView, Linking, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, FileText, Info } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const SettingsScreen: React.FC = () => {
  const openPrivacyPolicy = () => {
    const url = 'https://airunningcoach.com/privacy';
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    });
  };

  const openTermsOfService = () => {
    const url = 'https://airunningcoach.com/terms';
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    });
  };

  const showAcknowledgements = () => {
    Alert.alert(
      'Reconocimientos',
      'Esta app utiliza:\n\n• React Native Geolocation Service\n• Supabase\n• Lucide React Icons\n\nGracias a todos los desarrolladores de código abierto.',
      [{ text: 'Cerrar' }]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 pb-20">
      <ScrollView className="flex-1">
        <View className="bg-runapp-purple text-white p-4">
          <Text className="text-xl font-bold text-white">Configuración</Text>
        </View>

        <View className="p-4 space-y-4">
          {/* Privacidad y Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex-row items-center">
                <Shield className="w-5 h-5 text-runapp-purple mr-2" />
                Privacidad y Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <View>
                <Text className="text-sm text-gray-600 mb-2">
                  Tu privacidad es importante para nosotros. Revisa cómo manejamos tus datos.
                </Text>
                
                <Button 
                  variant="outline" 
                  onPress={openPrivacyPolicy}
                  className="flex-row items-center justify-between"
                >
                  <Text>Política de Privacidad</Text>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </View>
              
              <Separator />
              
              <Button 
                variant="outline" 
                onPress={openTermsOfService}
                className="flex-row items-center justify-between"
              >
                <Text>Términos de Servicio</Text>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Información de la App */}
          <Card>
            <CardHeader>
              <CardTitle className="flex-row items-center">
                <Info className="w-5 h-5 text-runapp-purple mr-2" />
                Información de la App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Versión</Text>
                <Text className="font-medium">1.0.0</Text>
              </View>
              
              <Separator />
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Build</Text>
                <Text className="font-medium">1</Text>
              </View>
              
              <Separator />
              
              <Button 
                variant="outline" 
                onPress={showAcknowledgements}
                className="flex-row items-center justify-between"
              >
                <Text>Reconocimientos</Text>
                <FileText className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Información de GPS */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-sm text-gray-600">
                Esta app utiliza tu ubicación únicamente durante los entrenamientos para:
                {'\n\n'}• Calcular distancia recorrida
                {'\n'}• Generar estadísticas de pace
                {'\n'}• Mostrar tu progreso en tiempo real
                {'\n\n'}Los datos de ubicación se procesan localmente y se almacenan de forma segura en nuestros servidores.
              </Text>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
      
      <BottomNav />
    </View>
  );
};

export default SettingsScreen;
