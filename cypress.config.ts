import { defineConfig } from 'cypress';
import { createRequire } from 'module';
import './env.config';

const require = createRequire(import.meta.url);

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  reporter: 'cypress-mochawesome-reporter',
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: true,
    screenshotOnRunFailure: true,
    experimentalMemoryManagement: true,
    retries: {
      runMode: 3,
      openMode: 0,
    },
    watchForFileChanges: false,
    specPattern: './tests/*.cy.{ts,tsx}',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
    chromeWebSecurity: false,
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
  fixturesFolder: false,
  defaultCommandTimeout: 8000,
  pageLoadTimeout: 60000,
  requestTimeout: 15000,
  taskTimeout: 60000,
  numTestsKeptInMemory: 1,
  trashAssetsBeforeRuns: false,
  waitForAnimations: true,
  experimentalWebKitSupport: true,
  env: {
    useLambdaTest: process.env.USE_LAMBDATEST ?? false,
  },
});
