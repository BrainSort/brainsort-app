/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^d3-scale$': '<rootDir>/test/mocks/d3-scale.ts',
    '^d3-interpolate$': '<rootDir>/test/mocks/d3-interpolate.ts',
    '^react-native$': '<rootDir>/test/mocks/react-native.ts',
    '^react-native-svg$': '<rootDir>/test/mocks/react-native-svg.ts',
  },
};
