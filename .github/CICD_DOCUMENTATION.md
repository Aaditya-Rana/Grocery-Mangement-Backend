# GitHub Actions CI/CD Documentation

This repository uses GitHub Actions for Continuous Integration and Continuous Deployment. Below is an overview of all workflows and how to use them.

## 📋 Workflows Overview

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `developement` branches
- Pull requests to `main` or `developement` branches

**Jobs:**

#### Lint Job
- Runs ESLint to check code quality
- Validates code formatting with Prettier
- Ensures code adheres to project standards

#### Unit Tests Job
- Runs all unit tests with coverage
- Uploads coverage reports to Codecov (optional)
- Generates coverage reports in the `coverage/` directory

#### E2E Tests Job
- Spins up a MongoDB service container
- Runs end-to-end tests against a real database
- Tests complete API workflows

#### Build Job
- Compiles TypeScript to JavaScript
- Validates that the application builds successfully
- Uploads build artifacts for 7 days

**Status Badge:**
Add this to your README.md:
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
```

---

### 2. Dependency Check Workflow (`dependency-check.yml`)

**Triggers:**
- Scheduled: Every Monday at 9:00 AM UTC
- Manual trigger via workflow_dispatch

**Jobs:**

#### Dependency Review
- Reviews dependencies in pull requests
- Identifies security vulnerabilities
- Checks for license compliance

#### Security Audit
- Runs `npm audit` to find security issues
- Lists outdated packages
- Continues even if issues are found (for visibility)

---

### 3. Release Workflow (`release.yml`)

**Triggers:**
- Push of version tags (e.g., `v1.0.0`, `v2.1.3`)

**Jobs:**

#### Release Job
- Runs full test suite
- Builds the application
- Creates a release archive
- Generates release notes from git commits
- Creates a GitHub Release with artifacts

**How to Create a Release:**
```bash
# Tag your commit with a version
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

---

## 🔧 Configuration

### Environment Variables

The CI workflows use the following environment variables:

#### E2E Tests
- `MONGODB_URI`: MongoDB connection string (set to `mongodb://localhost:27017/grocery-test` in CI)
- `JWT_SECRET`: Secret key for JWT tokens (set to `test-secret-key-for-ci` in CI)
- `PORT`: Application port (set to `3000` in CI)

### Secrets

To enable all features, add these secrets to your GitHub repository:

1. **CODECOV_TOKEN** (Optional)
   - Go to [codecov.io](https://codecov.io) and sign up
   - Add your repository
   - Copy the token
   - Add it to GitHub: Settings → Secrets and variables → Actions → New repository secret

2. **GITHUB_TOKEN** (Automatic)
   - Automatically provided by GitHub Actions
   - No setup required

---

## 📊 Code Coverage

### Setting Up Codecov (Optional)

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Copy the upload token
4. Add it as `CODECOV_TOKEN` in GitHub repository secrets
5. Add the coverage badge to your README:

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

### Viewing Coverage Locally

```bash
# Run tests with coverage
npm run test:cov

# Open coverage report
open coverage/lcov-report/index.html
```

---

## 🚀 Best Practices

### Branch Protection Rules

Recommended settings for `main` branch:

1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select required status checks:
     - `Lint`
     - `Unit Tests`
     - `E2E Tests`
     - `Build`
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

### Commit Messages

Follow conventional commits for better release notes:

```
feat: add user authentication
fix: resolve database connection issue
docs: update API documentation
test: add unit tests for auth service
chore: update dependencies
```

---

## 🐛 Troubleshooting

### CI Failing on Lint

```bash
# Fix linting issues locally
npm run lint

# Check formatting
npm run format -- --check

# Auto-fix formatting
npm run format
```

### CI Failing on Tests

```bash
# Run tests locally
npm test

# Run E2E tests locally (requires MongoDB)
npm run test:e2e

# Run with coverage
npm run test:cov
```

### MongoDB Connection Issues in E2E Tests

The CI uses a MongoDB service container. If tests fail:
1. Check that your tests use the correct connection string
2. Ensure tests clean up after themselves
3. Verify the health check is passing

---

## 📈 Monitoring

### Viewing Workflow Runs

1. Go to the "Actions" tab in your GitHub repository
2. Click on a workflow to see its runs
3. Click on a specific run to see job details
4. Click on a job to see step-by-step logs

### Notifications

Configure notifications in GitHub Settings → Notifications:
- Email notifications for failed workflows
- Slack/Discord webhooks for team notifications

---

## 🔄 Updating Workflows

When modifying workflows:

1. Test changes in a feature branch first
2. Create a pull request to review changes
3. Ensure all checks pass before merging
4. Document any new requirements or secrets

---

## 📝 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [MongoDB in GitHub Actions](https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers)

---

## 🎯 Quick Commands

```bash
# Run all checks locally (like CI does)
npm run lint && npm run format -- --check && npm run test:cov && npm run build

# Fix common issues
npm run lint && npm run format

# Create a new release
git tag v1.0.0 && git push origin v1.0.0
```
