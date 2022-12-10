import { Model } from "../baseTypes/Model"
import { Optional } from "../baseTypes/ValueTypes"

export const PrivateUserKeys: (keyof PrivateUser)[] = [
  "firstName",
  "lastName",
  "email",
]

export type PrivateUser = Model<
  "privateUser",
  {
    firstName?: Optional<string>
    lastName?: Optional<string>
    email: Optional<string>
  }
>
