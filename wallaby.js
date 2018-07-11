module.exports = function(wallaby) {
    return {
        files: [
            'src/**/*.ts',
            '!src/**/*.test.ts',
            'tsconfig.json',
            'package.json' // <--
        ],
        tests: [
            'test/**/*.test.ts'
        ],
        env: {
            type: 'node'
        },
        testFramework: 'jest',
        debug: false,

        compilers: {
            '**/*.ts?(x)': wallaby.compilers.typeScript({
                module: 'commonjs',
                jsx: 'React'
            })
        },

        setup: function (wallaby) {
            var jestConfig = require('./package.json').jest;
            delete jestConfig.transform; // <--
            wallaby.testFramework.configure(jestConfig);
        }
    };
}