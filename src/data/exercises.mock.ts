/**
 * exercises.mock.ts
 * BrainSort — Ejercicios de gamificación hardcodeados
 *
 * Datos temporales de ejercicios para usar sin depender de la API.
 * Basados en el seed del backend (prisma/seed.ts).
 */

import type { Ejercicio } from '../services/exercise.service';

export const MOCK_EXERCISES: Record<string, Ejercicio[]> = {
  'Bubble Sort': [
    {
      id: 'mock-bubble-1',
      pregunta: 'Dado el arreglo [5, 2, 8, 1], ¿cuál es el resultado después de la primera pasada completa de Bubble Sort?',
      dificultad: 'Facil',
      algoritmoId: 'bubble-sort',
    },
  ],
  'Selection Sort': [
    {
      id: 'mock-selection-1',
      pregunta: 'En Selection Sort, dado el arreglo [4, 7, 1, 3], ¿cuál es el primer intercambio que se realiza?',
      dificultad: 'Facil',
      algoritmoId: 'selection-sort',
    },
  ],
  'Insertion Sort': [
    {
      id: 'mock-insertion-1',
      pregunta: 'En Insertion Sort, dado el arreglo [3, 1, 4, 2], ¿cuál es el estado del arreglo después de insertar el segundo elemento?',
      dificultad: 'Facil',
      algoritmoId: 'insertion-sort',
    },
  ],
  'Merge Sort': [
    {
      id: 'mock-merge-1',
      pregunta: 'En Merge Sort, dado el arreglo [4, 3, 2, 1], ¿cuál es el resultado del primer merge después de dividir el arreglo en mitades?',
      dificultad: 'Medio',
      algoritmoId: 'merge-sort',
    },
  ],
};

export const MOCK_ANSWERS: Record<string, { correcta: string; feedbackPositivo: string; feedbackNegativo: string }> = {
  'mock-bubble-1': {
    correcta: '[2, 5, 1, 8]',
    feedbackPositivo: '¡Correcto! En la primera pasada, Bubble Sort compara pares adyacentes y deja el elemento más grande al final.',
    feedbackNegativo: 'Incorrecto. Recuerda que Bubble Sort compara pares adyacentes de izquierda a derecha y al final de la pasada el mayor queda al final.',
  },
  'mock-selection-1': {
    correcta: 'Intercambiar 4 con 1',
    feedbackPositivo: '¡Correcto! Selection Sort busca el mínimo de todo el arreglo y lo intercambia con la primera posición.',
    feedbackNegativo: 'Incorrecto. Selection Sort primero ubica el valor mínimo del arreglo y luego lo intercambia con el primer elemento.',
  },
  'mock-insertion-1': {
    correcta: '[1, 3, 4, 2]',
    feedbackPositivo: '¡Correcto! Insertion Sort toma el segundo elemento y lo inserta en la posición correcta dentro de la sublista ordenada.',
    feedbackNegativo: 'Incorrecto. Insertion Sort inserta cada elemento en orden dentro del subarreglo izquierdo ya ordenado.',
  },
  'mock-merge-1': {
    correcta: '[3, 4, 1, 2]',
    feedbackPositivo: '¡Correcto! Merge Sort divide recursivamente y luego combina las mitades ordenadas.',
    feedbackNegativo: 'Incorrecto. Merge Sort primero divide el arreglo en mitades recursivamente y luego las combina ordenadamente.',
  },
};
