import type { Config } from '@jest/types';

const config : Config.InitialOptions = {
    verbose: true,
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/.mocks/fileMock.js",
        "\\.css$": "identity-obj-proxy",
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
};

export default config;
