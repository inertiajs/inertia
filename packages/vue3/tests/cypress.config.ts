import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "cypress/integration/*.{js,jsx,ts,tsx}",
    "baseUrl": "http://localhost:13715",
    "video": false,
    "screenshotOnRunFailure": false,
    "retries": {
      "runMode": 4,
      "openMode": 2
    }
  },
});
