export default {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@ryzera/pos-schema$': '<rootDir>/../../../packages/pos-schema/src/index.ts',
        '^@ryzera/pos-database$': '<rootDir>/../../../packages/pos-database/src/generated/prisma/index.js',
    },
};