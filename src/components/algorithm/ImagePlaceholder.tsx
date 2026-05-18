/**
 * ImagePlaceholder.tsx
 * BrainSort — Placeholder de imagen con soporte para lazy loading
 *
 * task_breakdown.md T-FE-064
 *
 * Características:
 *   - Placeholder visual mientras no hay imagen
 *   - Estructura lista para lazy loading cuando se agreguen imágenes
 *   - Placeholder con ícono de categoría
 *   - Transición suave si se carga imagen en el futuro
 *
 * Referencia: library-simulation.spec.md §2 HU-01 (lazy loading)
 *             02-frontend-app.md §1 components/algorithm/
 */

import React, { useState, useCallback } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { DarkSurfaces, Accent } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ImagePlaceholderProps {
  /** URL de la imagen (para uso futuro) */
  imageUrl?: string;
  /** Ícono o emoji a mostrar en el placeholder */
  icon?: string;
  /** Altura del contenedor */
  height?: number;
  /** Estilos personalizados */
  style?: ViewStyle;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkSurfaces.surfaceSubtle,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(74, 156, 249, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74, 156, 249, 0.2)',
    borderRadius: BorderRadius.md,
  },
  iconText: {
    fontSize: 32,
    color: Accent[500],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Placeholder de imagen con soporte para lazy loading.
 * Renderiza un placeholder visual hasta que se cargue la imagen.
 * Estructurado para futuras imágenes sin afectar el MVP.
 *
 * @example
 * <ImagePlaceholder
 *   imageUrl="https://example.com/bubble-sort.png"
 *   icon="⇅"
 *   height={120}
 * />
 *
 * @example
 * // Placeholder sin imagen (MVP)
 * <ImagePlaceholder icon="⇅" height={100} />
 */
export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  imageUrl,
  icon = '◈',
  height = 100,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // En MVP, mostrar siempre placeholder (imageUrl es undefined)
  const showImage = imageUrl && !hasError && !isLoading;

  return (
    <View
      style={[
        styles.container,
        { height },
        style,
      ]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Imagen del algoritmo"
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onLoad={handleImageLoad}
          onError={handleImageError}
          accessibilityLabel="Imagen cargada del algoritmo"
        />
      ) : (
        <View style={[styles.placeholder, isLoading && styles.skeleton]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      )}
    </View>
  );
};

export default ImagePlaceholder;
