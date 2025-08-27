# Contributing to pref-editor-mcp-server

Thank you for your interest in contributing! This project is an MCP server for editing Android preferences, and we welcome contributions from the community.

## Quick Start

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Verify setup**: `npm run verify`
4. **Make your changes** following our guidelines
5. **Submit a pull request** with proper title format

For detailed development instructions, see [DEV.md](./DEV.md).

## Pull Request Requirements

### PR Title Format (Required)

Your PR title must follow this format (case-insensitive):

- `BREAKING: Description` - Breaking changes (major version)
- `feat: Description` - New features (minor version)
- `fix: Description` - Bug fixes (patch version)

### Code Quality

- All tests must pass: `npm test`
- Maintain ≥80% test coverage: `npm run test:coverage`
- No lint errors: `npm run lint`
- TypeScript must compile: `npm run build`

Run `npm run verify` to check all requirements locally.

## Development Guidelines

- Follow existing code patterns and TypeScript conventions
- Add tests for new functionality
- Include JSDoc comments for public APIs
- Keep PRs focused and reasonably sized
- Update documentation when needed

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment for all contributors

## License

By contributing to this project, you agree that your contributions will be licensed under the **Apache License 2.0**. See [LICENSE](./LICENSE) for the full license text.

All contributions are subject to the same license terms as the project itself.

## Getting Help

- Check [DEV.md](./DEV.md) for detailed development setup
- Review existing code and tests for patterns
- Open an issue for questions or discussion
- Comment on your PR if you need assistance

## Automated Processes

This project uses automated workflows:

- **CI checks** run on all PRs (title validation, tests, linting)
- **Auto-versioning** based on PR title prefix
- **Auto-releases** when PRs are merged
- **Branch cleanup** after merge

See [DEV.md](./DEV.md) for complete details on the development workflow.
