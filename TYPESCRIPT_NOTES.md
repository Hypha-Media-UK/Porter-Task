# TypeScript Configuration Notes

## Build System

This project uses Vite for building. For local development with TypeScript type checking, you can use:

```bash
npm run build:check
```

For production builds, especially on Netlify, we skip the TypeScript type checking step and use only:

```bash
vite build
```

## TypeScript Issues with Netlify

We've observed that Netlify's build environment may have compatibility issues with the TypeScript checker (`vue-tsc`) used in this project. Specifically, the error:

```
Search string not found: "/supportedTSExtensions = .*(?=;)/"
```

This occurs when the TypeScript compiler is trying to find a particular configuration pattern that might be missing or incompatible with the Netlify build environment.

## Resolution

Instead of trying to fix the TypeScript configuration for Netlify, we've chosen to bypass TypeScript checking during the build process on Netlify. This is a common approach for deployment pipelines where:

1. TypeScript checking is done locally during development
2. TypeScript checking is done in a separate CI pipeline step
3. The production build simply transpiles TypeScript without type checking

Since Vite already handles the transpilation of TypeScript to JavaScript, we can safely skip the type checking step for the production build.

## Alternative Approaches

If TypeScript checking during the build is critical, consider:

1. Using a GitHub Action to run TypeScript checking before deploying
2. Downgrading the TypeScript or vue-tsc versions to ones known to work with Netlify
3. Using a custom build image on Netlify

## Maintaining Type Safety

To ensure type safety:

1. Always run `npm run build:check` locally before committing code
2. Consider setting up pre-commit hooks to run TypeScript checks
3. Add TypeScript checking to your CI pipeline if available
