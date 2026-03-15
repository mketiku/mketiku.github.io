# Agent Instructions - mketiku.github.io

This is the personal website and portfolio for Michael Ketiku, built using **Astro**.

## Project Stack
- **Framework**: [Astro](https://astro.build/)
- **Styling**: Vanilla CSS / Astro Components
- **Deployment**: GitHub Pages (Static)

## Development Workflow
- **Development Server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Commit Conventions
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

## Structure
- `src/pages/`: Contains the routes for the website.
- `src/components/`: Reusable Astro components.
- `src/layouts/`: Global page layouts.
- `public/`: Static assets (images, etc.).
- `.github/workflows/`: CI/CD pipelines.
- `.editorconfig`: Editor configuration for consistent coding styles.
