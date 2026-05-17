import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { learningPathService, RutaAprendizajeResponse } from '../../services/learning-path.service';

export default function LearningPathScreen({ navigation }: any) {
  const [ruta, setRuta] = useState<RutaAprendizajeResponse | null>(null);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(false);
      learningPathService.getMiRuta().then((res) => {
        setRuta(res);
        setLoading(false);
      }).catch((err) => {
        console.log('Error fetching learning path:', err);
        setError(true);
        setLoading(false);
      });
    }, [])
  );

  if (loading) return (
    <View style={styles.centerContainer}>
      <Text style={{color:'white'}}>Cargando tu ruta personalizada...</Text>
    </View>
  );

  if (error || !ruta) return (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>Ruta no asignada</Text>
      <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>Aún no tienes una ruta de aprendizaje. Realiza el test diagnóstico para que podamos recomendarte algoritmos adaptados a tu nivel.</Text>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('DiagnosticTest')}
      >
        <Text style={styles.actionButtonText}>Hacer Test Diagnóstico</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tu Camino a Seguir</Text>
      <Text style={styles.subtitle}>Basado en tu perfil, esta es la secuencia recomendada:</Text>

      <View style={styles.timeline}>
        {ruta.algoritmos.map((algo, idx) => (
          <TouchableOpacity 
            key={algo.id} 
            style={styles.node}
            onPress={() => navigation.navigate('Library', { screen: 'AlgorithmDetail', params: { algoritmoId: algo.id } })}
          >
            <View style={styles.circle}>
              <Text style={styles.stepNum}>{idx + 1}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.algoName}>{algo.nombre}</Text>
              <Text style={styles.algoCat}>{algo.categoria}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { flex: 1, padding: 20, backgroundColor: '#0A0A0A' },
  title: { fontSize: 24, color: '#00D4FF', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 30 },
  timeline: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#333', marginLeft: 20 },
  node: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, position: 'relative' },
  circle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#00D4FF', position: 'absolute', left: -27, justifyContent: 'center', alignItems: 'center' },
  stepNum: { color: 'black', fontWeight: 'bold', fontSize: 12 },
  info: { marginLeft: 20, backgroundColor: '#1A1A1A', padding: 15, borderRadius: 8, flex: 1, borderWidth: 1, borderColor: '#333' },
  algoName: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  algoCat: { color: '#888', fontSize: 12 },
  actionButton: { backgroundColor: '#00D4FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  actionButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
