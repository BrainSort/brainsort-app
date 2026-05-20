import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { diagnosticsService, PreguntaDiagnostico } from '../../services/diagnostics.service';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';

export default function DiagnosticTestScreen({ navigation }: { navigation: { goBack: () => void; navigate: (name: string, params?: object) => void } }) {
  const [preguntas, setPreguntas] = useState<PreguntaDiagnostico[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);

  useEffect(() => {
    diagnosticsService.getPreguntas().then(setPreguntas).catch(console.error);
  }, []);

  const handleResponder = (opcionIdx: number) => {
    const nuevasRespuestas = [...respuestas, opcionIdx];
    setRespuestas(nuevasRespuestas);

    if (currentIdx < preguntas.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Terminado
      diagnosticsService.evaluar(nuevasRespuestas).then((res) => {
        // Redirigir a la ruta de aprendizaje
        navigation.navigate('MainTabs', { screen: 'Ruta' });
      }).catch(console.error);
    }
  };

  if (!preguntas.length) {
    return (
      <SafeAreaWrapper>
        <Header title="Test Diagnóstico" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.body}>
          <Text style={styles.loadingText}>
            Cargando test diagnóstico... (o no hay preguntas disponibles)
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  const pregunta = preguntas[currentIdx];

  return (
    <SafeAreaWrapper>
      <Header title="Test Diagnóstico" showBackButton onBackPress={() => navigation.goBack()} />
      <View style={styles.body}>
      <Text style={styles.title}>Evaluación Inicial</Text>
      <Text style={styles.progress}>Pregunta {currentIdx + 1} de {preguntas.length}</Text>
      
      <Text style={styles.question}>{pregunta.pregunta}</Text>

      {pregunta.opciones.map((opcion, idx) => (
        <TouchableOpacity key={idx} style={styles.option} onPress={() => handleResponder(idx)}>
          <Text style={styles.optionText}>{opcion}</Text>
        </TouchableOpacity>
      ))}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 20, backgroundColor: '#0A0A0A', justifyContent: 'center' },
  loadingText: { color: 'white', textAlign: 'center' },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  progress: { fontSize: 14, color: '#888', marginBottom: 30, textAlign: 'center' },
  question: { fontSize: 18, color: 'white', marginBottom: 30, textAlign: 'center' },
  option: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  optionText: { color: 'white', textAlign: 'center' }
});
