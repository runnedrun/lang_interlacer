// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { prepareRegistrationJourney } from "@/prep/prepareRegistrationJourney"

export default async (req, res) => {
  await prepareRegistrationJourney()
  res.send(200)
}
