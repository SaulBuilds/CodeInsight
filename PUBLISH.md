# Publishing CodeInsight AI to npm

This document outlines the steps for publishing the CodeInsight AI CLI tool to npm.

## Prerequisites

1. You need to have an npm account. If you don't have one, you can create it at [npmjs.com](https://www.npmjs.com/signup).
2. You need to be logged in to npm via the command line. Run `npm login` and follow the prompts to log in.

## Publishing Steps

1. **Prepare the package**:
   - Make sure all files are up-to-date and committed to your repository.
   - Ensure the version in `package.json` is correct. If you're publishing an update, increment the version number following semantic versioning guidelines (major.minor.patch).

2. **Test the package locally**:
   - Install dependencies by running `npm install` in the CLI directory.
   - Test the CLI by running `node index.js --help` to ensure it works as expected.

3. **Package files**:
   - The `.npmignore` file is already set up to include only the necessary files in the package.
   - Run `npm pack` to create a tarball of the package without publishing it. This is useful for verifying what will be published.

4. **Publish the package**:
   - Run `npm publish` to publish the package to the npm registry.
   - If this is your first time publishing this package, it will be created in the registry.
   - If you're updating an existing package, the new version will be published.

5. **Verify the publication**:
   - Check the npm website to confirm your package has been published correctly.
   - You can also try installing it globally using `npm install -g codeinsight-ai` and run `codeinsight --help` to verify it works.

## Troubleshooting

- **Name conflicts**: If the name `codeinsight-ai` is already taken, you might need to choose a different name or publish it as a scoped package (e.g., `@yourusername/codeinsight-ai`).
- **Permission issues**: Make sure you have the necessary permissions to publish to the npm registry. If you're publishing to an organization, you need to be a member with publishing rights.
- **Publishing errors**: If you encounter errors during publishing, check npm's error messages. Common issues include:
  - Version already exists (you need to increment the version number)
  - Authentication problems (you need to login again)
  - Package name conflicts (choose a different name)

## Managing the Package

After publishing, you can:
- **Deprecate**: Use `npm deprecate codeinsight-ai "reason"` if you want to mark a version as deprecated.
- **Unpublish**: Use `npm unpublish codeinsight-ai` to remove the package from the registry (only possible within the first 72 hours after publishing).
- **Update README**: You can update the README on npm without publishing a new version by using `npm version patch` and then `npm publish`.

For more information, refer to the [npm documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish).