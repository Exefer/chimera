# Contributing to Chimera

This is a guide for contributors to Chimera.

## Introduction

### What is Chimera

Chimera is a free and open-source game launcher.
The development is currently in the early stages, so please bare with me and help me build this project.

### How to contribute

- Submit a PR

  - **Translation**: You can help to translate the app to new languages or improving the already available ones.
  - **Code**: Chimera is written in Svelte, Rust and TypeScript. You can help by improving the codebase or by adding new features.

- [Report a bug](https://github.com/Aryxst/chimera/issues/new)
- [Suggest a feature](https://github.com/Aryxst/chimera/issues/new)

### Code of Conduct

Please review the [Contributor Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

### Requirements

Before anything else, make sure you have the following installed:

- Node 20+
- Rust 1.82.0+
- Bun 1.2.0+

### Setup

1. Clone the repository

```sh
git clone https://github.com/Aryxst/chimera.git
```

2. Install the dependencies

```sh
bun install
```

3. Run the app on development mode

```sh
bun tauri dev
```

### Code Formatting

Not really to worry about because `lint-staged` will format the code for you before committing.

```sh
# Format all files
bun format

# Check formatting without making changes
bun format:check
```
