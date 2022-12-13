/** @type {import('next').NextConfig} */

const config = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/new_doc",
        permanent: false,
      },
    ]
  },
  reactStrictMode: false,
  // swcMinify: true,
  // typescript: { tsconfigPath: "tsconfig.next.json" },
}

module.exports = config
