import moment from "moment"
import { AnyGenericModel } from "../baseTypes/Model"

export const raiseNewItems = <ModelType extends AnyGenericModel>(
  items: ModelType[]
) => {
  const recentlyCreated = items.filter(
    (company) =>
      Date.now() - company.createdAt?.toMillis() <
      moment.duration(10, "minutes").asMilliseconds()
  )

  return recentlyCreated.concat(
    items.filter(
      (item) =>
        !recentlyCreated.find((timeSorted) => timeSorted.uid === item.uid)
    )
  )
}
