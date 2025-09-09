module.exports = {
  branches: ['main', 'next'],
  plugins: [
    '@semantic-release/commit-analyzer',

    ['@semantic-release/release-notes-generator'],

    ['@semantic-release/npm', { npmPublish: true }],

    ['@semantic-release/github', {
      assets: ['dist/*.tgz'],
    }],

    ['@semantic-release/git', {
      assets: ['package.json'],
      // eslint-disable-next-line no-template-curly-in-string
      message: 'chore(release): ${nextRelease.version} [skip ci]',
    }],
  ],
}
