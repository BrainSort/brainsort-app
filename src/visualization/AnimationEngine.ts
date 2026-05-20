/**
 * AnimationEngine.ts
 * BrainSort — Motor de selección de renderizador de animación
 *
 * Determina si un algoritmo debe usar:
 *   - BarChart (algoritmos de ordenamiento: Bubble Sort, Insertion Sort, etc.)
 *   - LinearStructureCanvas (estructuras lineales: Stack, Queue, Linked List)
 */

export const AnimationEngine = {
  /**
   * Devuelve el tipo de visualizador según la categoría del algoritmo.
   * @param categoria CategoriaAlgoritmo del backend
   */
  getRendererType(categoria: string | undefined, algorithmName?: string): 'bar' | 'linear' | 'tree' {
    if (categoria === 'EstructurasArboles') return 'tree';
    if (algorithmName === 'Heap Sort' || algorithmName === 'Priority Queue') return 'tree';
    if (categoria === 'EstructurasLineales') return 'linear';
    return 'bar';
  },

  /**
   * Verifica si el algoritmo es una estructura lineal.
   */
  isLinearStructure(categoria: string | undefined): boolean {
    return categoria === 'EstructurasLineales';
  },

  isTreeStructure(categoria: string | undefined, algorithmName?: string): boolean {
    return categoria === 'EstructurasArboles' || algorithmName === 'Heap Sort' || algorithmName === 'Priority Queue';
  },

  /**
   * Devuelve la leyenda de operaciones apropiada para el tipo de algoritmo.
   */
  getLegend(categoria: string | undefined): Array<{ color: string; label: string }> {
    if (categoria === 'EstructurasArboles') {
      return [
        { color: '#555', label: 'Pendiente' },
        { color: '#F5A623', label: 'Visitando' },
        { color: '#00D4FF', label: 'Construyendo' },
        { color: '#2ECC71', label: 'Listo' },
      ];
    }
    if (categoria === 'EstructurasLineales') {
      return [
        { color: '#00D4FF', label: 'Insertar' },
        { color: '#F5A623', label: 'Inspeccionar' },
        { color: '#E74C3C', label: 'Extraer' },
        { color: '#2ECC71', label: 'Finalizado' },
      ];
    }
    // Ordenamiento (default)
    return [
      { color: '#555', label: 'Inactivo' },
      { color: '#F5A623', label: 'Comparando' },
      { color: '#E74C3C', label: 'Intercambiando' },
      { color: '#2ECC71', label: 'Finalizado' },
    ];
  },
};
