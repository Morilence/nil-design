/** @type {import('@commitlint/types').UserConfig} */
export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert', 'build', 'ci'],
        ],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'scope-empty': [0, 'never'],
        'scope-case': [2, 'always', ['lower-case', 'camel-case', 'pascal-case']],
        'subject-case': [0, 'never'],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
    },
};
