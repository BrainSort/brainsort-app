import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SimulationContent } from '../SimulationScreen';
import * as useAlgorithmModule from '../../../hooks/useAlgorithm';
import * as useSimulationModule from '../../../hooks/useSimulation';
import * as useSimulationEngineModule from '../../../hooks/useSimulationEngine';
import * as useDatasetModule from '../../../hooks/useDataset';
import * as useAnimationControllerModule from '../../../hooks/useAnimationController';

const mockUseAlgorithm = jest.spyOn(useAlgorithmModule, 'useAlgorithm');
const mockUseSimulation = jest.spyOn(useSimulationModule, 'useSimulation');
const mockUseSimulationEngine = jest.spyOn(useSimulationEngineModule, 'useSimulationEngine');
const mockUseDataset = jest.spyOn(useDatasetModule, 'useDataset');
const mockUseAnimationController = jest.spyOn(useAnimationControllerModule, 'useAnimationController');

// Navigation mock
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ setOptions: jest.fn(), goBack: jest.fn(), navigate: jest.fn() }),
}));

// Mock the BarChart
jest.mock('../../../visualization/components/BarChart', () => {
  const { View } = require('react-native');
  return {
    BarChart: () => <View testID="mock-barchart" />
  };
});

// Mock Safe Area
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    SafeAreaConsumer: jest.fn().mockImplementation(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn().mockReturnValue(inset),
  };
});

describe('SimulationContent', () => {
  const mockAlgorithm = {
    id: '1',
    nombre: 'Bubble Sort',
    categoria: 'Ordenamiento',
    pseudocode: [],
  };

  const mockSimulationProps = {
    steps: [{ type: 'compare', indices: [0, 1] }],
    currentStep: { displayNumber: 1, totalSteps: 10, progress: 10, step: {} },
    isPlaying: false,
    speed: 1.0,
    isCompleted: false,
    hasSteps: true,
    pseudocode: [],
    play: jest.fn(),
    pause: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    setSpeed: jest.fn(),
    resetSimulation: jest.fn(),
    togglePlayPause: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAlgorithm.mockReturnValue({ algoritmo: mockAlgorithm, isLoading: false, error: null } as any);
    mockUseSimulation.mockReturnValue(mockSimulationProps as any);
    mockUseSimulationEngine.mockReturnValue({ executeAlgorithm: jest.fn().mockResolvedValue([]), isExecuting: false } as any);
    mockUseDataset.mockReturnValue({ generateDefault: jest.fn().mockReturnValue([5, 2, 8]), validateDataset: jest.fn().mockReturnValue({ valid: true, values: [1,2,3] }) } as any);
    mockUseAnimationController.mockReturnValue(undefined as any);
  });

  it('renders correctly and shows algorithm name', () => {
    const { getByText } = render(
      <SimulationContent algoritmoId="1" onRequestBack={jest.fn()} />
    );
    expect(getByText('Bubble Sort')).toBeTruthy();
  });

  it('calls play when Play button is pressed', () => {
    const { getByTestId } = render(
      <SimulationContent algoritmoId="1" onRequestBack={jest.fn()} />
    );
    const playBtn = getByTestId('btn-play-pause');
    fireEvent.press(playBtn);
    expect(mockSimulationProps.play).toHaveBeenCalled();
  });

  it('calls resetSimulation when Reset button is pressed', () => {
    const props = { ...mockSimulationProps, isCompleted: true };
    mockUseSimulation.mockReturnValue(props as any);
    const { getByTestId } = render(
      <SimulationContent algoritmoId="1" onRequestBack={jest.fn()} />
    );
    const replayBtn = getByTestId('btn-reset');
    fireEvent.press(replayBtn);
    expect(props.resetSimulation).toHaveBeenCalled();
  });

  it('changes speed when SpeedSlider is used', () => {
    const { getByTestId } = render(
      <SimulationContent algoritmoId="1" onRequestBack={jest.fn()} />
    );
    const speedBtn = getByTestId('speed-1.5');
    fireEvent.press(speedBtn);
    expect(mockSimulationProps.setSpeed).toHaveBeenCalledWith(1.5);
  });
});
