const config = {
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  testEnvironment: 'jsdom',
  testTimeout: 35000,
}

module.exports = config
