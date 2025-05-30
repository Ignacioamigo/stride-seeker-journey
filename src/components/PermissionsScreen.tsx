
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Shield, Activity } from 'lucide-react';
import { useNavigation } from '@react-navigation/native';

const PermissionsScreen: React.FC = () => {
  const [permissionStep, setPermissionStep] = useState<'initial' | 'when-in-use' | 'always' | 'completed'>('initial');
  const navigation = useNavigation();

  const requestWhenInUsePermission = async () => {
    try {
      // Simular solicitud de permiso "When in Use"
      setPermissionStep('when-in-use');
      
      // En una app real, aquí usarías react-native-permissions
      setTimeout(() => {
        setPermissionStep('always');
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los permisos de ubicación');
    }
  };

  const requestAlwaysPermission = async () => {
    try {
      // Simular solicitud de permiso "Always"
      setPermissionStep('completed');
      
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los permisos de ubicación continua');
    }
  };

  const skipPermissions = () => {
    Alert.alert(
      'Funcionalidad limitada',
      'Sin permisos de ubicación, no podrás usar el tracking GPS.',
      [
        { text: 'Entendido', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (permissionStep === 'completed') {
    return (
      <View className="flex-1 bg-gray-50 p-4 justify-center">
        <Card className="mx-4">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-green-600">¡Listo!</CardTitle>
            <CardDescription>
              Ya puedes usar el tracking GPS completo
            </CardDescription>
          </CardHeader>
        </Card>
      </View>
    );
  }

  if (permissionStep === 'always') {
    return (
      <View className="flex-1 bg-gray-50 p-4">
        <View className="flex-1 justify-center">
          <Card className="mx-4">
            <CardHeader>
              <Activity className="w-12 h-12 text-runapp-purple mx-auto mb-4" />
              <CardTitle className="text-center text-xl">Tracking en segundo plano</CardTitle>
              <CardDescription className="text-center">
                Para registrar tu entrenamiento completo, necesitamos acceso continuo a tu ubicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <View className="bg-blue-50 p-4 rounded-lg">
                <Text className="text-sm text-blue-800 font-medium mb-2">¿Por qué "Siempre"?</Text>
                <Text className="text-sm text-blue-700">
                  • Continúa el tracking si bloqueas la pantalla{'\n'}
                  • Registra tu ruta completa sin interrupciones{'\n'}
                  • Calcula estadísticas precisas de pace y distancia
                </Text>
              </View>
              
              <Button 
                onPress={requestAlwaysPermission}
                className="bg-runapp-purple"
              >
                Permitir acceso continuo
              </Button>
              
              <Button 
                variant="outline" 
                onPress={skipPermissions}
              >
                Usar sin tracking en segundo plano
              </Button>
            </CardContent>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-1 justify-center">
        <Card className="mx-4">
          <CardHeader>
            <MapPin className="w-12 h-12 text-runapp-purple mx-auto mb-4" />
            <CardTitle className="text-center text-xl">Permisos de ubicación</CardTitle>
            <CardDescription className="text-center">
              AI Running Coach necesita acceso a tu ubicación para funcionar correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="space-y-3">
              <View className="flex-row items-center space-x-3">
                <View className="w-2 h-2 bg-runapp-purple rounded-full" />
                <Text className="text-sm text-gray-700">Calcular distancia recorrida</Text>
              </View>
              <View className="flex-row items-center space-x-3">
                <View className="w-2 h-2 bg-runapp-purple rounded-full" />
                <Text className="text-sm text-gray-700">Mostrar tu ruta en tiempo real</Text>
              </View>
              <View className="flex-row items-center space-x-3">
                <View className="w-2 h-2 bg-runapp-purple rounded-full" />
                <Text className="text-sm text-gray-700">Generar estadísticas de pace</Text>
              </View>
            </View>
            
            <View className="bg-yellow-50 p-3 rounded-lg">
              <Text className="text-xs text-yellow-800">
                🔒 Tu ubicación se procesa localmente y solo se guarda cuando inicias un entrenamiento.
              </Text>
            </View>
            
            <Button 
              onPress={requestWhenInUsePermission}
              className="bg-runapp-purple"
            >
              Permitir acceso a ubicación
            </Button>
            
            <Button 
              variant="outline" 
              onPress={skipPermissions}
            >
              Continuar sin GPS
            </Button>
          </CardContent>
        </Card>
      </View>
    </View>
  );
};

export default PermissionsScreen;
