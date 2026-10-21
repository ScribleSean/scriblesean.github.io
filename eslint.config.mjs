import nextConfig from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextConfig,
  // Agent worktrees live under .claude/ and carry their own build output.
  { ignores: [".claude/**"] },
];

export default config;
