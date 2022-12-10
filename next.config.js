/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs")
const CircularDependencyPlugin = require("circular-dependency-plugin")

const prodHost = "https://send.hylitepeople.com"

const config = {
  distDir: "/tmp/.next",
  reactStrictMode: false,
  // swcMinify: true,
  // typescript: { tsconfigPath: "tsconfig.next.json" },
}

module.exports = config
