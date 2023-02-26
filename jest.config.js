module.exports = {
  projects: [
    {
      displayName: {
        name: "Unit Tests",
        color: "green",
      },
      testEnvironment: "node",
      roots: ["<rootDir>/src"],
      testMatch: ["**/*.test.ts"],
      transform: {
        "^.+\\.ts?$": "ts-jest",
      },
      moduleNameMapper: {
        "@mocks/(.*)": "<rootDir>/mocks/$1",
        "@utils/(.*)": "<rootDir>/lib/utils/$1",
      },
    },
  ],
};
