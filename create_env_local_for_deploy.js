const dotenv = require("dotenv")
const {
  promises: { writeFile },
  write,
} = require("fs")

const run = async () => {
  // dotenv.config({ path: ".local_github_secrets_file.env" })
  const configFile = process.env.PROD_ENV_FILE

  const replaced = configFile
    .replace(/(?<!\\)\\n/g, "\n")
    .replace(/\\\\n/g, "\\n")
    .replace(/\\"/g, '"')
    .replace(/\\s/g, " ")

  await writeFile(".env.local", replaced)

  await writeFile(
    "gcap_key.json",
    JSON.stringify(JSON.parse(process.env.GCP_SA_KEY))
  )
}

run()
