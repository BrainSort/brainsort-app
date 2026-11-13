import React from 'react';
import { BadgeCard } from '../BadgeCard';
import { BadgeUnlockModal } from '../BadgeUnlockModal';

/**
 * Renderiza recursivamente un árbol de elementos funcionales de React
 * para inspección de props, testIDs y texto sin depender de DOM externo.
 */
function renderTree(node: any): any {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return null;
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(renderTree).filter((n) => n !== null);
  }
  if (typeof node.type === 'function') {
    const rendered = node.type(node.props || {});
    return renderTree(rendered);
  }
  const children =
    node.props && node.props.children !== undefined
      ? renderTree(node.props.children)
      : null;

  return {
    type: node.type,
    props: node.props || {},
    children: Array.isArray(children)
      ? children
      : children !== null
        ? [children]
        : [],
  };
}

function collectText(tree: any): string {
  if (!tree) return '';
  if (typeof tree === 'string') return tree;
  if (Array.isArray(tree)) {
    return tree
      .map(collectText)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return (tree.children || [])
    .map(collectText)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findByTestId(tree: any, testID: string): any | null {
  if (!tree || typeof tree === 'string') return null;
  if (Array.isArray(tree)) {
    for (const child of tree) {
      const found = findByTestId(child, testID);
      if (found) return found;
    }
    return null;
  }
  if (tree.props?.testID === testID) return tree;
  return findByTestId(tree.children, testID);
}

describe('BadgeCard & BadgeUnlockModal — Pruebas de Renderizado', () => {
  it('renderiza el estado DESBLOQUEADO mostrando nombre, categoría, descripción y fecha de obtención', () => {
    const tree = renderTree(
      <BadgeCard
        nombre="Maestro del Orden"
        imagen="/badges/sort-master.svg"
        descripcion="Completaste todos los algoritmos de Ordenamiento"
        categoria="Ordenamiento"
        desbloqueada={true}
        fechaObtencion="2026-05-10T12:00:00Z"
      />,
    );

    const unlockedCard = findByTestId(tree, 'badge-card-unlocked');
    const unlockedIcon = findByTestId(tree, 'badge-icon-unlocked');
    const textContent = collectText(tree);

    expect(unlockedCard).not.toBeNull();
    expect(unlockedIcon).not.toBeNull();
    expect(textContent).toContain('Maestro del Orden');
    expect(textContent).toContain('Ordenamiento');
    expect(textContent).toContain(
      'Completaste todos los algoritmos de Ordenamiento',
    );
    expect(textContent).toContain('Desbloqueada el');
  });

  it('renderiza el estado BLOQUEADO en gris con candado y la pista de cómo conseguirla', () => {
    const tree = renderTree(
      <BadgeCard
        nombre="Racha de 7"
        imagen="/badges/streak-7.svg"
        descripcion="Estudiaste 7 días consecutivos"
        criterioDesbloqueo="rachaDías >= 7"
        categoria="Constancia"
        desbloqueada={false}
      />,
    );

    const lockedCard = findByTestId(tree, 'badge-card-locked');
    const lockedIcon = findByTestId(tree, 'badge-icon-locked');
    const hintNode = findByTestId(tree, 'badge-locked-hint');
    const textContent = collectText(tree);

    expect(lockedCard).not.toBeNull();
    expect(lockedIcon).not.toBeNull();
    expect(hintNode).not.toBeNull();
    expect(textContent).toContain('🔒');
    expect(textContent).toContain('Pista: rachaDías >= 7');
  });

  it('despliega el modal conmemorativo cuando se desbloquea una insignia en la sesión activa', () => {
    const onCloseMock = jest.fn();

    const hiddenTree = renderTree(
      <BadgeUnlockModal visible={false} badges={[]} onClose={onCloseMock} />,
    );
    expect(hiddenTree).toBeNull();

    const activeTree = renderTree(
      <BadgeUnlockModal
        visible={true}
        badges={[
          {
            id: '1',
            nombre: 'Primer Paso',
            descripcion: 'Completaste tu primera simulación',
            imagen: '/badges/first-step.svg',
            categoria: 'Inicio',
          },
        ]}
        onClose={onCloseMock}
      />,
    );

    const modalNode = findByTestId(activeTree, 'badge-unlock-modal');
    const titleNode = findByTestId(activeTree, 'badge-unlock-title');
    const closeBtn = findByTestId(activeTree, 'badge-unlock-close-btn');
    const textContent = collectText(activeTree);

    expect(modalNode).not.toBeNull();
    expect(collectText(titleNode)).toContain('Primer Paso');
    expect(textContent).toContain('¡Logro Desbloqueado!');
    expect(textContent).toContain('Completaste tu primera simulación');

    // Simular cierre del modal conmemorativo
    closeBtn.props.onPress();
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
