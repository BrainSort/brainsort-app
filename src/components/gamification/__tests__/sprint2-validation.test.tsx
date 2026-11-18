import React from 'react';
import { PredictionExercise } from '../PredictionExercise';
import { BadgeCard } from '../BadgeCard';
import { BadgeUnlockModal } from '../BadgeUnlockModal';
import { getTheme } from '../../../styles/theme';

jest.mock('react-native', () => {
  const actual = jest.requireActual('../../../../test/mocks/react-native');
  const mockComp = (name: string) => {
    const Comp = (props: any) => React.createElement(name, props, props.children);
    Comp.displayName = name;
    return Comp;
  };
  return {
    ...actual,
    TextInput: mockComp('TextInput'),
    Pressable: mockComp('Pressable'),
    ActivityIndicator: mockComp('ActivityIndicator'),
    useWindowDimensions: () => ({ width: 1024, height: 768 }),
  };
});

jest.mock('react-native-svg', () => {
  const actual = jest.requireActual('../../../../test/mocks/react-native-svg');
  const mockSvg = (name: string) => {
    const Comp = (props: any) => React.createElement(name, props, props.children);
    Comp.displayName = name;
    return Comp;
  };
  return {
    ...actual,
    Line: mockSvg('Line'),
  };
});

jest.mock('../../../context/ThemeContext', () => ({
  useThemeContext: () => ({
    mode: 'dark',
    theme: getTheme('dark'),
    setThemeMode: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('../../../visualization/GraphRenderer', () => ({
  GraphRenderer: ({ grafo }: any) =>
    React.createElement('GraphRendererMock', {
      testID: 'graph-renderer-mock',
      nodos: grafo?.nodos,
    }),
}));

type TreeNode =
  | string
  | {
      type: any;
      props: Record<string, any>;
      children: TreeNode[];
    };

/**
 * Lightweight zero-dependency React hook harness for Node Jest environment
 * (no @testing-library/react-native or jsdom required).
 */
function createHarness<P extends Record<string, any>>(
  Component: React.FC<P>,
  initialProps: P,
) {
  let currentProps = initialProps;
  const states: any[] = [];
  const refs: { current: any }[] = [];
  const memos: { deps: React.DependencyList | undefined; value: any }[] = [];
  const effects: {
    deps: React.DependencyList | undefined;
    fn: () => void | (() => void);
  }[] = [];
  let stateIdx = 0;
  let refIdx = 0;
  let memoIdx = 0;
  let effectIdx = 0;
  let tree: TreeNode | null = null;

  const expand = (node: any): TreeNode | null => {
    if (node === null || node === undefined || typeof node === 'boolean') {
      return null;
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node);
    }
    if (Array.isArray(node)) {
      const mapped = node.map(expand).filter((x): x is TreeNode => x !== null);
      return { type: 'Fragment', props: {}, children: mapped };
    }
    if (typeof node.type === 'function') {
      return expand(node.type(node.props || {}));
    }
    const rawChildren = node.props?.children;
    const expandedChildren = Array.isArray(rawChildren)
      ? rawChildren.map(expand).filter((x): x is TreeNode => x !== null)
      : rawChildren !== undefined
        ? [expand(rawChildren)].filter((x): x is TreeNode => x !== null)
        : [];
    return {
      type: node.type,
      props: node.props || {},
      children: expandedChildren,
    };
  };

  let dirty = false;
  const render = () => {
    dirty = false;
    stateIdx = 0;
    refIdx = 0;
    memoIdx = 0;
    effectIdx = 0;

    const spies = [
      jest.spyOn(React, 'useState').mockImplementation((init?: any) => {
        const idx = stateIdx++;
        if (!(idx in states)) {
          states[idx] = typeof init === 'function' ? init() : init;
        }
        const setter = (next: any) => {
          const val = typeof next === 'function' ? next(states[idx]) : next;
          if (!Object.is(val, states[idx])) {
            states[idx] = val;
            dirty = true;
          }
        };
        return [states[idx], setter];
      }),
      jest.spyOn(React, 'useRef').mockImplementation(((init?: any) => {
        const idx = refIdx++;
        if (!(idx in refs)) {
          refs[idx] = { current: init };
        }
        return refs[idx];
      }) as any),
      jest.spyOn(React, 'useMemo').mockImplementation((factory: () => any, deps?: React.DependencyList) => {
        const idx = memoIdx++;
        const prev = memos[idx];
        const changed =
          !prev ||
          !deps ||
          !prev.deps ||
          deps.length !== prev.deps.length ||
          deps.some((d, i) => !Object.is(d, prev.deps![i]));
        if (changed) {
          memos[idx] = { deps, value: factory() };
        }
        return memos[idx].value;
      }),
      jest.spyOn(React, 'useCallback').mockImplementation((fn: any) => fn),
      jest.spyOn(React, 'useEffect').mockImplementation((fn: () => any, deps?: React.DependencyList) => {
        const idx = effectIdx++;
        const prev = effects[idx];
        const changed =
          !prev ||
          !deps ||
          !prev.deps ||
          deps.length !== prev.deps.length ||
          deps.some((d, i) => !Object.is(d, prev.deps![i]));
        if (changed) {
          effects[idx] = { deps, fn };
          fn();
        }
      }),
    ];

    try {
      tree = expand(Component(currentProps));
    } finally {
      spies.forEach((s) => s.mockRestore());
    }
    if (dirty) {
      return render();
    }
    return tree;
  };

  render();

  return {
    getTree: () => tree,
    rerender: (nextProps?: P) => {
      if (nextProps) currentProps = nextProps;
      return render();
    },
    act: async (fn: () => void | Promise<void>) => {
      await fn();
      return render();
    },
  };
}

function collectText(node: TreeNode | null): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  const joiner = node.type === 'Text' ? '' : ' ';
  return node.children
    .map(collectText)
    .join(joiner)
    .replace(/\s+/g, ' ')
    .trim();
}

function findNode(
  node: TreeNode | null,
  predicate: (n: Exclude<TreeNode, string>) => boolean,
): Exclude<TreeNode, string> | null {
  if (!node || typeof node === 'string') return null;
  if (predicate(node)) return node;
  for (const child of node.children) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

describe('Sprint 2 — Validación Funcional (Req 01, 02, 04, 05)', () => {
  describe('Req 01: 4 Modalidades en PredictionExercise', () => {
    it('PrediccionTexto: escribe respuesta y envía payload de texto', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const harness = createHarness(PredictionExercise, {
        tipo: 'PrediccionTexto',
        pregunta: '¿Cuál es la complejidad promedio de Quick Sort?',
        progressCurrent: 1,
        progressTotal: 3,
        isSubmittingAnswer: false,
        lastResult: { correcto: true, puntosGanados: 20, rachaDias: 2 },
        onSubmit,
        onNext: jest.fn(),
      });

      const input = findNode(
        harness.getTree(),
        (n) => n.props?.placeholder === 'Tu respuesta...',
      );
      expect(input).not.toBeNull();

      await harness.act(() => {
        input!.props.onChangeText('O(n log n)');
      });

      const submitBtn = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'Comprobar',
      );
      expect(submitBtn).not.toBeNull();

      await harness.act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(onSubmit).toHaveBeenCalledWith('O(n log n)');
    });

    it('CompletarPseudocodigo: selecciona opción y envía la opción elegida', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const harness = createHarness(PredictionExercise, {
        tipo: 'CompletarPseudocodigo',
        pregunta: 'Completa la condición de intercambio',
        opciones: ['A[j] > A[j+1]', 'A[j] < A[0]'],
        contenido: { antes: 'if (', despues: ') swap()' },
        progressCurrent: 1,
        progressTotal: 3,
        isSubmittingAnswer: false,
        lastResult: { correcto: true, puntosGanados: 20, rachaDias: 2 },
        onSubmit,
        onNext: jest.fn(),
      });

      const optionNode = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'A[j] > A[j+1]',
      );
      expect(optionNode).not.toBeNull();

      await harness.act(() => {
        optionNode!.props.onPress();
      });

      const submitBtn = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'Comprobar',
      );
      await harness.act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(onSubmit).toHaveBeenCalledWith('A[j] > A[j+1]');
    });

    it('OrdenarBarras (intercambio): toca dos barras y envía el arreglo JSON resultante', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const harness = createHarness(PredictionExercise, {
        tipo: 'OrdenarBarras',
        pregunta: 'Ordena las barras intercambiando 30 y 10',
        contenido: { inicial: [30, 20, 10], objetivo: [10, 20, 30] },
        progressCurrent: 2,
        progressTotal: 3,
        isSubmittingAnswer: false,
        lastResult: { correcto: true, puntosGanados: 25, rachaDias: 3 },
        onSubmit,
        onNext: jest.fn(),
      });

      const bar30 = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n).includes('30') &&
          collectText(n).replace(/\s+/g, '').includes('[0]'),
      );
      expect(bar30).not.toBeNull();

      await harness.act(() => {
        bar30!.props.onPress();
      });

      const bar10 = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n).includes('10') &&
          collectText(n).replace(/\s+/g, '').includes('[2]'),
      );
      expect(bar10).not.toBeNull();

      await harness.act(() => {
        bar10!.props.onPress();
      });

      const submitBtn = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'Comprobar',
      );
      await harness.act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(onSubmit).toHaveBeenCalledWith(JSON.stringify([10, 20, 30]));
    });

    it('OrdenarBarras (modoSeleccion: true): toca una barra y envía su índice string', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const harness = createHarness(PredictionExercise, {
        tipo: 'OrdenarBarras',
        pregunta: 'Selecciona la barra mínima',
        contenido: {
          inicial: [40, 12, 28],
          objetivo: [40, 12, 28],
          modoSeleccion: true,
        } as any,
        progressCurrent: 2,
        progressTotal: 3,
        isSubmittingAnswer: false,
        lastResult: { correcto: true, puntosGanados: 25, rachaDias: 3 },
        onSubmit,
        onNext: jest.fn(),
      });

      const bar12 = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n).includes('12') &&
          collectText(n).replace(/\s+/g, '').includes('[1]'),
      );
      expect(bar12).not.toBeNull();

      await harness.act(() => {
        bar12!.props.onPress();
      });

      const submitBtn = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'Comprobar',
      );
      await harness.act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(onSubmit).toHaveBeenCalledWith('1');
    });

    it('SecuenciaGrafos: toca nodos en orden y envía el JSON array de la secuencia', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const harness = createHarness(PredictionExercise, {
        tipo: 'SecuenciaGrafos',
        pregunta: 'Indica el recorrido BFS desde A',
        contenido: {
          grafo: {
            nodos: ['A', 'B', 'C'],
            aristas: [
              ['A', 'B'],
              ['A', 'C'],
            ],
            dirigido: false,
          },
        },
        progressCurrent: 3,
        progressTotal: 3,
        isSubmittingAnswer: false,
        lastResult: { correcto: true, puntosGanados: 30, rachaDias: 4 },
        onSubmit,
        onNext: jest.fn(),
      });

      for (const nodeId of ['A', 'B', 'C']) {
        const chip = findNode(
          harness.getTree(),
          (n) => n.props?.accessibilityLabel === `Nodo ${nodeId}`,
        );
        expect(chip).not.toBeNull();
        await harness.act(() => {
          chip!.props.onPress();
        });
      }

      const submitBtn = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'Comprobar',
      );
      await harness.act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(onSubmit).toHaveBeenCalledWith(JSON.stringify(['A', 'B', 'C']));
    });
  });

  describe('Req 02: Retroalimentación', () => {
    it('muestra feedbackPositivo, +XP y Racha cuando la respuesta es correcta', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const harness = createHarness(PredictionExercise, {
        tipo: 'PrediccionTexto',
        pregunta: 'Complejidad de Binary Search',
        progressCurrent: 1,
        progressTotal: 2,
        isSubmittingAnswer: false,
        lastResult: {
          correcto: true,
          feedbackPositivo: '¡Excelente deducción algorítmica!',
          puntosGanados: 25,
          rachaDias: 5,
        },
        onSubmit,
        onNext: jest.fn(),
      });

      const input = findNode(
        harness.getTree(),
        (n) => n.props?.placeholder === 'Tu respuesta...',
      );
      await harness.act(() => {
        input!.props.onChangeText('O(log n)');
      });

      const submitBtn = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'Comprobar',
      );
      await harness.act(async () => {
        await submitBtn!.props.onPress();
      });

      const text = collectText(harness.getTree());
      expect(text).toContain('Correcto');
      expect(text).toContain('¡Excelente deducción algorítmica!');
      expect(text).toContain('+25 XP');
      expect(text).toContain('Racha: 5 días');
    });

    it('muestra feedbackNegativo y botón "Volver a intentar" cuando es incorrecta', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const harness = createHarness(PredictionExercise, {
        tipo: 'PrediccionTexto',
        pregunta: 'Complejidad de Bubble Sort',
        progressCurrent: 1,
        progressTotal: 2,
        isSubmittingAnswer: false,
        lastResult: {
          correcto: false,
          feedbackNegativo: 'Revisa los dos ciclos anidados.',
          puntosGanados: 0,
          rachaDias: 5,
        },
        onSubmit,
        onNext: jest.fn(),
      });

      const input = findNode(
        harness.getTree(),
        (n) => n.props?.placeholder === 'Tu respuesta...',
      );
      await harness.act(() => {
        input!.props.onChangeText('O(n)');
      });

      const submitBtn = findNode(
        harness.getTree(),
        (n) =>
          typeof n.props?.onPress === 'function' &&
          collectText(n) === 'Comprobar',
      );
      await harness.act(async () => {
        await submitBtn!.props.onPress();
      });

      const text = collectText(harness.getTree());
      expect(text).toContain('Intenta ajustar tu idea');
      expect(text).toContain('Revisa los dos ciclos anidados.');
      expect(text).toContain('Volver a intentar');
    });
  });

  describe('Req 04: BadgeUnlockModal', () => {
    it('renderiza el modal cuando visible={true} y ejecuta onClose al cerrarlo', () => {
      const onClose = jest.fn();
      const harness = createHarness(BadgeUnlockModal, {
        visible: true,
        badges: [
          {
            id: 'b-1',
            nombre: 'Explorador de Grafos',
            descripcion: 'Completaste BFS y DFS',
            imagen: '/badges/graph.svg',
            categoria: 'Grafos',
          },
        ],
        onClose,
      });

      const modal = findNode(
        harness.getTree(),
        (n) => n.props?.testID === 'badge-unlock-modal',
      );
      expect(modal).not.toBeNull();
      expect(collectText(harness.getTree())).toContain('Explorador de Grafos');

      const closeBtn = findNode(
        harness.getTree(),
        (n) => n.props?.testID === 'badge-unlock-close-btn',
      );
      expect(closeBtn).not.toBeNull();
      closeBtn!.props.onPress();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Req 05: BadgeCard', () => {
    it('muestra fecha de obtención en desbloqueada y criterio en bloqueada', () => {
      const unlocked = createHarness(BadgeCard, {
        nombre: 'Maestro de Árboles',
        imagen: '/badges/tree.svg',
        descripcion: 'Dominaste Segment Tree',
        desbloqueada: true,
        fechaObtencion: '2026-10-15T12:00:00Z',
      });
      expect(
        findNode(
          unlocked.getTree(),
          (n) => n.props?.testID === 'badge-card-unlocked',
        ),
      ).not.toBeNull();
      expect(collectText(unlocked.getTree())).toContain('Desbloqueada el');

      const locked = createHarness(BadgeCard, {
        nombre: 'Constancia 7',
        imagen: '/badges/streak.svg',
        criterioDesbloqueo: 'Mantén una racha de 7 días',
        desbloqueada: false,
      });
      expect(
        findNode(
          locked.getTree(),
          (n) => n.props?.testID === 'badge-card-locked',
        ),
      ).not.toBeNull();
      expect(collectText(locked.getTree())).toContain(
        'Pista: Mantén una racha de 7 días',
      );
    });
  });
});
