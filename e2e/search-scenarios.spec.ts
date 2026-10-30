import { expect, test } from '@playwright/test';

async function mockSearchEnvironment(page: any) {
  // Mock login api
  await page.route('**/api/auth/login', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          token: 'e2e-token-search',
          refreshToken: 'e2e-refresh-search',
          usuario: {
            id: 'usr-search',
            nombre: 'Estudiante BrainSort',
            correo: 'estudiante@brainsort.app',
            rol: 'Estudiante',
            tipo: 'usuario',
          },
        },
      }),
    });
  });

  // Mock biblioteca
  await page.route('**/api/biblioteca', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          categorias: ['Busqueda'],
          totalAlgoritmos: 2,
          algoritmos: [
            {
              id: 'linear-search',
              nombre: 'Linear Search',
              descripcion: 'Búsqueda secuencial elemento a elemento.',
              complejidadTiempo: 'O(n)',
              complejidadEspacio: 'O(1)',
              categoria: 'Busqueda',
              dificultad: 'Facil',
              tags: ['Busqueda'],
            },
            {
              id: 'binary-search',
              nombre: 'Binary Search',
              descripcion: 'Búsqueda sobre arreglos ordenados O(log n).',
              complejidadTiempo: 'O(log n)',
              complejidadEspacio: 'O(1)',
              categoria: 'Busqueda',
              dificultad: 'Medio',
              tags: ['Busqueda'],
            },
          ],
        },
      }),
    });
  });

  // Mock progress and profile
  await page.route('**/api/progreso/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          puntosTotales: 100,
          nivelActual: 1,
          rachaDias: 2,
          posicionRanking: 5,
          insignias: [],
          simulacionesCompletadas: 3,
        },
      }),
    });
  });

  await page.route('**/api/users/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { id: 'usr-search', nombre: 'Estudiante', correo: 'estudiante@brainsort.app' },
      }),
    });
  });

  await page.route('**/api/ruta-aprendizaje/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: 'r1', algoritmos: [] } }),
    });
  });

  // Mock detail Linear Search
  await page.route('**/api/algoritmos/linear-search', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'linear-search',
          nombre: 'Linear Search',
          descripcion: 'Búsqueda secuencial elemento por elemento.',
          complejidadTiempo: 'O(n)',
          complejidadEspacio: 'O(1)',
          categoria: 'Busqueda',
          dificultad: 'Facil',
          tags: ['Busqueda'],
          pseudocode: [
            { line: 1, text: 'Para i = 0 hasta n - 1', indent: 0 },
            { line: 2, text: '  Si arreglo[i] == objetivo: devolver i', indent: 1 },
            { line: 3, text: 'devolver -1', indent: 0 },
          ],
        },
      }),
    });
  });

  // Mock detail Binary Search
  await page.route('**/api/algoritmos/binary-search', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'binary-search',
          nombre: 'Binary Search',
          descripcion: 'Búsqueda descartando mitades.',
          complejidadTiempo: 'O(log n)',
          complejidadEspacio: 'O(1)',
          categoria: 'Busqueda',
          dificultad: 'Medio',
          tags: ['Busqueda'],
          pseudocode: [
            { line: 1, text: 'low = 0; high = n - 1', indent: 0 },
            { line: 2, text: 'Mientras low <= high', indent: 0 },
            { line: 3, text: '  mid = (low + high) / 2', indent: 1 },
            { line: 4, text: '  Si arreglo[mid] == objetivo: devolver mid', indent: 1 },
          ],
        },
      }),
    });
  });

  // Mock simulaciones API dinámico según objetivo enviado
  await page.route('**/api/simulaciones', async (route: any) => {
    const payload = route.request().postDataJSON();
    const isLinear = payload.algoritmoId === 'linear-search';
    const target = payload.objetivo ?? 25;
    const array = isLinear
      ? (payload.conjuntoDeDatos?.valores ?? [10, 25, 40, 55])
      : [...(payload.conjuntoDeDatos?.valores ?? [10, 20, 30, 40])].sort((a, b) => a - b);

    const foundIdx = array.indexOf(target);
    const isFound = foundIdx !== -1;

    let pasos: any[] = [];
    if (isLinear) {
      if (isFound) {
        for (let i = 0; i <= foundIdx; i++) {
          pasos.push({
            numeroPaso: i + 1,
            tipoOperacion: 'comparacion',
            indicesActivos: [i],
            estadoArray: array,
            lineaPseudocodigo: 2,
            contexto: {
              objetivo: target,
              puntero: i,
              comparaciones: i + 1,
              resultado: 'buscando',
            },
            marcadores: [{ index: i, label: `i=${i}`, role: 'activo', color: '#F5A623' }],
          });
        }
        pasos.push({
          numeroPaso: pasos.length + 1,
          tipoOperacion: 'final',
          indicesActivos: [foundIdx],
          estadoArray: array,
          lineaPseudocodigo: 2,
          contexto: {
            objetivo: target,
            puntero: foundIdx,
            comparaciones: foundIdx + 1,
            resultado: 'encontrado',
            indiceEncontrado: foundIdx,
          },
          marcadores: [{ index: foundIdx, label: `i=${foundIdx} (Encontrado)`, role: 'final', color: '#7ED321' }],
        });
      } else {
        pasos = [
          {
            numeroPaso: 1,
            tipoOperacion: 'comparacion',
            indicesActivos: [0],
            estadoArray: array,
            lineaPseudocodigo: 2,
            contexto: { objetivo: target, puntero: 0, comparaciones: 1, resultado: 'buscando' },
            marcadores: [{ index: 0, label: 'i=0', role: 'activo', color: '#F5A623' }],
          },
          {
            numeroPaso: 2,
            tipoOperacion: 'final',
            indicesActivos: [],
            estadoArray: array,
            lineaPseudocodigo: 3,
            contexto: { objetivo: target, comparaciones: array.length, resultado: 'noEncontrado' },
            marcadores: [],
          },
        ];
      }
    } else {
      // Binary Search mock
      pasos = [
        {
          numeroPaso: 1,
          tipoOperacion: 'comparacion',
          indicesActivos: [0, 1, 3],
          estadoArray: array,
          lineaPseudocodigo: 3,
          contexto: { objetivo: target, left: 0, right: 3, mid: 1, comparaciones: 1, resultado: isFound ? 'encontrado' : 'noEncontrado', indiceEncontrado: isFound ? 1 : undefined },
          marcadores: [
            { index: 0, label: 'L', role: 'rangoActual', color: '#00D4FF' },
            { index: 1, label: 'M', role: isFound ? 'final' : 'activo', color: isFound ? '#7ED321' : '#F5A623' },
            { index: 3, label: 'R', role: 'rangoActual', color: '#00D4FF' },
          ],
        },
      ];
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          simulacion: { velocidadReproduccion: 1.0, estadoActual: 'Pausa', pasoActual: 0 },
          pseudocode: [{ line: 1, text: 'Inicio', indent: 0 }],
          totalPasos: pasos.length,
          pasos,
        },
      }),
    });
  });
}

test.describe('Búsqueda Lineal y Binaria - Escenarios de Aceptación', () => {
  test.beforeEach(async ({ page }) => {
    await mockSearchEnvironment(page);
    await page.goto('/');

    // Login
    await page.getByTestId('input-correo').fill('estudiante@brainsort.app');
    await page.getByTestId('input-contrasena').fill('Password123');
    await page.getByTestId('btn-login').click();
    await expect(page.getByLabel('Biblioteca', { exact: false }).first()).toBeVisible();
  });

  test('Escenario 1: Búsqueda exitosa con Búsqueda Lineal', async ({ page }) => {
    // 1. Entrar a Linear Search
    await page.locator('text=Linear Search').filter({ visible: true }).first().click();
    await page.locator('text=Iniciar Simulación').filter({ visible: true }).first().click();

    // 2. Verificar que carga el canvas de búsqueda interactiva
    await expect(page.getByTestId('search-array-canvas')).toBeVisible();
    await expect(page.getByTestId('search-complexity-panel')).toBeVisible();

    // 3. Verificar input de target
    const targetInput = page.getByTestId('input-target-value');
    await expect(targetInput).toBeVisible();

    // 4. Ingresar target existente y aplicar
    await targetInput.fill('25');
    await page.getByTestId('input-custom-data').fill('10, 25, 40, 55');
    await page.getByTestId('btn-apply-data').click();

    // 5. Avanzar pasos hasta el final
    await page.getByTestId('btn-next-step').click();
    await page.getByTestId('btn-next-step').click();

    // 6. Verificar notificación de éxito
    const banner = page.getByTestId('search-result-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('encontrado');
    await expect(banner).toContainText('índice 1');
  });

  test('Escenario 2: Búsqueda Binaria con auto-ordenamiento', async ({ page }) => {
    // 1. Entrar a Binary Search
    await page.locator('text=Binary Search').filter({ visible: true }).first().click();
    await page.locator('text=Iniciar Simulación').filter({ visible: true }).first().click();

    await expect(page.getByTestId('search-array-canvas')).toBeVisible();

    // 2. Ingresar datos desordenados
    await page.getByTestId('input-custom-data').fill('50, 10, 40, 20');
    // Verificar advertencia de orden y botón auto-ordenar
    const autoSortBtn = page.getByTestId('btn-auto-sort');
    await expect(autoSortBtn).toBeVisible();

    // 3. Hacer clic en ordenar
    await autoSortBtn.click();
    // El input de datos debe haberse ordenado
    await expect(page.getByTestId('input-custom-data')).toHaveValue('10, 20, 40, 50');
  });

  test('Escenario 3: Búsqueda no exitosa (Elemento inexistente)', async ({ page }) => {
    await page.locator('text=Linear Search').filter({ visible: true }).first().click();
    await page.locator('text=Iniciar Simulación').filter({ visible: true }).first().click();

    // Target que no existe en el arreglo
    await page.getByTestId('input-target-value').fill('99');
    await page.getByTestId('input-custom-data').fill('10, 20, 30');
    await page.getByTestId('btn-apply-data').click();

    // Avanzar hasta el final
    await page.getByTestId('btn-next-step').click();
    await page.getByTestId('btn-next-step').click();

    // Verificar notificación de elemento no encontrado sin bloqueos
    const banner = page.getByTestId('search-result-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('no encontrado');
  });
});
