import { SearchVisualEngine } from '../SearchVisualEngine';
import { SearchColors } from '../searchPalette';

describe('SearchVisualEngine', () => {
  it('debe generar frame vacío si step es null o arreglo vacío', () => {
    const frame = SearchVisualEngine.buildFrame(null);
    expect(frame.cells).toEqual([]);
    expect(frame.resultado).toBe('idle');
    expect(frame.comparaciones).toBe(0);
  });

  it('debe construir celdas para búsqueda lineal en paso intermedio', () => {
    const mockStep: any = {
      numeroPaso: 2,
      tipoOperacion: 'comparacion',
      indicesActivos: [1],
      estadoArray: [10, 20, 30],
      lineaPseudocodigo: 2,
      contexto: {
        objetivo: 30,
        puntero: 1,
        comparaciones: 2,
        resultado: 'buscando',
      },
      marcadores: [{ index: 1, label: 'i=1', role: 'activo', color: '#F5A623' }],
    };

    const frame = SearchVisualEngine.buildFrame(mockStep, 'Linear Search');
    expect(frame.resultado).toBe('buscando');
    expect(frame.comparaciones).toBe(2);
    expect(frame.cells[0].state).toBe('visitado'); // i=1 > 0, celda 0 ya fue visitada
    expect(frame.cells[1].state).toBe('evaluando');
    expect(frame.cells[2].state).toBe('idle');
  });

  it('debe marcar celda como encontrada con color verde y resultado exitoso', () => {
    const mockStep: any = {
      numeroPaso: 3,
      tipoOperacion: 'final',
      indicesActivos: [2],
      estadoArray: [10, 20, 30],
      lineaPseudocodigo: 3,
      contexto: {
        objetivo: 30,
        puntero: 2,
        comparaciones: 3,
        resultado: 'encontrado',
        indiceEncontrado: 2,
      },
      marcadores: [{ index: 2, label: 'i=2 (Encontrado)', role: 'final', color: '#7ED321' }],
    };

    const frame = SearchVisualEngine.buildFrame(mockStep, 'Linear Search');
    expect(frame.resultado).toBe('encontrado');
    expect(frame.indiceEncontrado).toBe(2);
    expect(frame.cells[2].state).toBe('encontrado');
    expect(frame.cells[2].color).toBe(SearchColors.encontrado);
  });

  it('debe marcar celdas descartadas correctamente en búsqueda binaria', () => {
    const mockStep: any = {
      numeroPaso: 2,
      tipoOperacion: 'comparacion',
      indicesActivos: [3, 4, 6],
      estadoArray: [10, 20, 30, 40, 50, 60, 70],
      lineaPseudocodigo: 3,
      contexto: {
        objetivo: 60,
        left: 4,
        right: 6,
        mid: 5,
        comparaciones: 2,
        resultado: 'buscando',
      },
      marcadores: [
        { index: 0, label: '', role: 'descartado', color: '#1A2333' },
        { index: 1, label: '', role: 'descartado', color: '#1A2333' },
        { index: 2, label: '', role: 'descartado', color: '#1A2333' },
        { index: 3, label: '', role: 'descartado', color: '#1A2333' },
        { index: 4, label: 'L', role: 'rangoActual', color: '#00D4FF' },
        { index: 5, label: 'M', role: 'activo', color: '#F5A623' },
        { index: 6, label: 'R', role: 'rangoActual', color: '#00D4FF' },
      ],
    };

    const frame = SearchVisualEngine.buildFrame(mockStep, 'Binary Search');
    expect(frame.cells[0].state).toBe('descartado');
    expect(frame.cells[0].isDimmed).toBe(true);
    expect(frame.cells[3].state).toBe('descartado');
    expect(frame.cells[5].state).toBe('mid');
    expect(frame.cells[5].color).toBe(SearchColors.mid);
    expect(frame.pointers.length).toBeGreaterThanOrEqual(3);
  });

  it('debe manejar resultado noEncontrado al agotar búsqueda sin éxito', () => {
    const mockStep: any = {
      numeroPaso: 5,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [10, 20, 30],
      lineaPseudocodigo: 6,
      contexto: {
        objetivo: 99,
        left: 3,
        right: 2,
        comparaciones: 2,
        resultado: 'noEncontrado',
      },
      marcadores: [],
    };

    const frame = SearchVisualEngine.buildFrame(mockStep, 'Binary Search');
    expect(frame.resultado).toBe('noEncontrado');
    expect(frame.isCompleted).toBe(true);
    expect(frame.indiceEncontrado).toBeUndefined();
  });
});
