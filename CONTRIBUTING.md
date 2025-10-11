# Contributing to Client Proposal Generator Tool

Thank you for considering contributing to the Client Proposal Generator Tool! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to info@gurkhatech.com.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**
- **Include browser and operating system details**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

- Fill in the pull request template
- Follow the coding standards
- Include appropriate test cases if applicable
- Update documentation as needed
- Ensure all tests pass

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/client-proposal-generator-tool.git
   cd client-proposal-generator-tool
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Open `index.html`** in your browser to test the application

## Development Workflow

1. Make your changes in your feature branch
2. Test your changes thoroughly by opening `index.html` in multiple browsers
3. Commit your changes with clear, descriptive commit messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

### Testing Your Changes

Since this is a client-side application, testing involves:

- Opening `index.html` in different browsers (Chrome, Firefox, Safari, Edge)
- Testing on different screen sizes (desktop, tablet, mobile)
- Verifying all features work as expected:
  - Service selection
  - Package selection
  - Proposal generation
  - PDF download
- Checking console for JavaScript errors

## Coding Standards

### JavaScript

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code style and formatting
- Use ES6+ features where appropriate
- Avoid global variables when possible

### HTML

- Use semantic HTML5 elements
- Maintain proper indentation (2 or 4 spaces consistently)
- Include appropriate ARIA labels for accessibility
- Ensure proper nesting of elements

### CSS

- Follow existing naming conventions
- Keep selectors specific but not overly complex
- Comment sections of related styles
- Ensure responsive design principles are followed

### Documentation

- Update README.md if you add new features
- Update documentation.md for technical changes
- Keep comments up to date with code changes
- Use clear and concise language

## Submitting Changes

1. **Commit your changes**:
   ```bash
   git commit -m "Brief description of changes"
   ```
   
   Write clear commit messages:
   - Use the present tense ("Add feature" not "Added feature")
   - Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
   - Reference issues and pull requests when applicable

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template with all relevant information
   - Link any related issues

4. **Wait for review**:
   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, your PR will be merged

## Reporting Bugs

Use GitHub Issues to report bugs. Include:

- **Browser and version**
- **Operating System**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Error messages** from the browser console

## Suggesting Enhancements

We welcome suggestions for enhancements! Please:

- Check existing issues first
- Provide clear use cases
- Explain the benefits
- Consider implementation complexity
- Be open to discussion

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Email us at info@gurkhatech.com
- Check existing documentation

## Recognition

Contributors will be recognized in our project documentation. Thank you for helping make this project better!

---

**By contributing to this project, you agree that your contributions will be licensed under the MIT License.**
