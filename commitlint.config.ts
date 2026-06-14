import type { UserConfig } from '@commitlint/types'

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Add `internal` on top of the conventional types. It's for changes we want
    // in git history but NOT in the released changelog (e.g. follow-up fixes to
    // unreleased work). `changelogen` only renders its known types, so an
    // `internal:` commit is dropped from the changelog automatically.
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'internal',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
}

export default Configuration
