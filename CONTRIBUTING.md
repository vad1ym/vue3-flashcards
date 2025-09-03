# Contributing to Vue3 Flashcards

Thank you for your interest in contributing to Vue3 Flashcards! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20.19+, 22.12+
- Yarn or npm
- Git

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vue3-flashcards.git
   cd vue3-flashcards
   ```

3. **Install dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

4. **Start development server**:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. **Start documentation server**:
   ```bash
   yarn docs:dev
   # or
   npm run docs:dev
   ```

## Project Structure

```
vue3-flashcards/
├── src/                 # Source code
│   ├── FlashCard.vue   # Main FlashCards component
│   └── index.ts        # Entry point
├── example/            # Interactive examples
├── docs/              # VitePress documentation
├── dist/              # Built files
└── types/             # TypeScript definitions
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use ESLint configuration provided in the project
- Run linting before submitting: `yarn lint`

### Commit Messages

We follow [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

Examples:
- `feat: add dragThreshold prop to prevent false swipes`
- `fix: resolve animation timing issue on mobile`
- `docs: update FlipCard API reference`

### Testing

Before submitting a PR:

1. **Test your changes** with the development server
2. **Run the build** to ensure no build errors:
   ```bash
   yarn build
   ```
3. **Test with examples** to verify functionality works as expected

## Making Changes

### Adding New Features

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Implement your feature**:
   - Add/modify source code in `src/`
   - Update TypeScript types if needed
   - Add example usage if applicable

3. **Update documentation**:
   - Update relevant API docs in `docs/api/`
   - Add examples to `docs/examples.md` if needed
   - Update getting started guide if necessary

4. **Test thoroughly**:
   - Test in development mode
   - Test build process
   - Verify examples still work

### Bug Fixes

1. **Create a fix branch**:
   ```bash
   git checkout -b fix/issue-description
   ```

2. **Fix the issue**:
   - Identify root cause
   - Implement minimal fix
   - Test the fix thoroughly

3. **Update docs if needed**:
   - Update troubleshooting section if applicable
   - Fix any related documentation

## Submitting Changes

### Pull Request Process

1. **Push your branch** to your fork:
   ```bash
   git push origin your-branch-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference any related issues
   - Screenshots for UI changes

3. **PR Requirements**:
   - All checks must pass
   - Code must follow project style guidelines
   - Documentation must be updated for API changes
   - Examples should be updated if functionality changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Testing
- [ ] Tested locally
- [ ] Build passes
- [ ] Examples work correctly

## Related Issues
Fixes #(issue number)
```

## Documentation

### Updating Documentation

Documentation is built with VitePress and located in `docs/`:

- **API Reference**: `docs/api/` - Component props, slots, events
- **Examples**: `docs/examples.md` - Interactive demos
- **Guides**: `docs/guide/` - Getting started and configuration

### Documentation Guidelines

- Keep examples simple and focused
- Include TypeScript examples where relevant
- Update both API docs and guides for breaking changes
- Test documentation examples locally

## Issue Reporting

### Bug Reports

Please include:
- Vue3 Flashcards version
- Vue.js version
- Browser and version
- Minimal reproduction example
- Steps to reproduce
- Expected vs actual behavior

### Feature Requests

Please include:
- Clear use case description
- Proposed API (if applicable)
- Examples of similar features in other libraries
- Willingness to implement the feature

## Questions and Support

- **GitHub Discussions**: For general questions and community support
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: [Vue3 Flashcards Community](https://discord.gg/vue3-flashcards) (if available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
