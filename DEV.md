# Development Guide

This guide covers how to set up, develop, and contribute to the `pref-editor-mcp-server` project.

## Prerequisites

- **Node.js**: Version 20.0.0 or higher (see `engines` in package.json)
- **npm**: Comes with Node.js
- **Git**: For version control

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/charlesmuchene/pref-editor-mcp-server.git
cd pref-editor-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Setup

Run the full verification suite to ensure everything works:

```bash
npm run verify
```

This runs: clean → lint → build → test → coverage

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Run in development mode with ts-node
npm run watch        # Watch mode for TypeScript compilation

# Building
npm run build        # Compile TypeScript to dist/
npm run clean        # Remove dist/ directory

# Testing
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Quality Checks
npm run lint         # Run ESLint
npm run verify       # Run all checks (recommended before commits)

# Production
npm start            # Run the compiled server
```

### Project Structure

```
├── src/
│   ├── index.ts          # Main entry point
│   ├── schema.ts         # Zod validation schemas
│   ├── utils.ts          # Utility functions
│   └── tools/
│       ├── common.ts     # Common MCP tools
│       └── prefs.ts      # Preference management tools
├── tests/                # Test files
├── .github/
│   ├── workflows/        # CI/CD workflows
│   ├── CODEOWNERS        # Code ownership
│   └── pull_request_template.md
└── dist/                 # Compiled output (generated)
```

## Before Opening a Pull Request

### 1. Code Quality Checks

Run the verification suite locally:

```bash
npm run verify
```

This ensures:

- ✅ No lint errors
- ✅ TypeScript compiles successfully
- ✅ All tests pass
- ✅ Test coverage ≥ 80%

### 2. PR Title Format

Your PR title **must** follow this format:

```
chore: Description of breaking changes
feat: Description of new features
fix: Description of bug fixes
```

**Examples:**

- `chore: Remove deprecated tools`
- `feat: Add new preference validation feature`
- `fix: Fix typo in tool description`

❌ **Invalid titles will fail CI:**

- `Add new feature` (missing prefix)
- `Major: Breaking change` (wrong case)
- `feat: Add feature` (wrong prefix)

### 3. Test Coverage

- All new code must have tests
- Maintain ≥ 80% coverage across lines, functions, branches, and statements
- Run `npm run test:coverage` to check coverage locally

### 4. Code Standards

- Follow existing code patterns
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Follow the existing import/export patterns

## After Opening a Pull Request

### 1. CI Checks Must Pass

The following automated checks will run:

- **PR Title Validation** - Ensures proper format
- **Linting** - Code style and quality checks
- **Build** - TypeScript compilation
- **Tests** - All test suites must pass
- **Coverage** - Must maintain ≥ 80% threshold

### 2. Ready for Review Process

1. **Wait for CI** - All checks must be green ✅
2. **Add "READY-FOR-REVIEW" label** - This notifies code owners
3. **Address feedback** - Respond to review comments
4. **Update as needed** - Push additional commits if required

### 3. Automatic Processes

When your PR is approved and merged:

- **Auto-versioning** - Version bumped based on your PR title prefix
- **Auto-tagging** - Git tag created (e.g., `v0.8.0`)
- **Auto-release** - GitHub release created with changelog
- **Branch cleanup** - Feature branch automatically deleted

## Troubleshooting

### Common Issues

**CI failing on PR title:**

```bash
# Fix your PR title format
chore: Your description here
feat: Your description here
fix: Your description here
```

**Lint errors:**

```bash
npm run lint           # See errors
npm run lint -- --fix  # Auto-fix some issues
```

**Test failures:**

```bash
npm test              # Run tests
npm run test:watch    # Debug in watch mode
```

**Coverage too low:**

```bash
npm run test:coverage # See coverage report
# Add tests for uncovered code
```

**Build errors:**

```bash
npm run build         # See TypeScript errors
# Fix type issues and imports
```

### Getting Help

1. **Check CI logs** - Click on failed checks for details
2. **Run locally** - Use `npm run verify` to reproduce issues
3. **Review existing code** - Follow established patterns
4. **Ask questions** - Comment on your PR if stuck

## Code Review Guidelines

### For Contributors

- Keep PRs focused and small when possible
- Write clear commit messages
- Add tests for new functionality
- Update documentation if needed
- Respond promptly to review feedback

### For Reviewers

- Check the automated PR comment for CI status
- Verify test coverage for new code
- Ensure code follows project conventions
- Test functionality if significant changes
- Provide constructive feedback

## Release Process

Releases are fully automated:

1. **Merge PR** with proper title prefix
2. **Auto-version** bumps version in package.json
3. **Auto-tag** creates git tag
4. **Auto-release** creates GitHub release
5. **Changelog** generated from commit history

No manual intervention required! 🚀

---

## Quick Reference

```bash
# Setup
git clone <repo> && cd <repo> && npm install

# Before PR
npm run verify

# PR title format
chore|feat|fix: Description

# After PR merged
# → Automatic versioning and release
```
