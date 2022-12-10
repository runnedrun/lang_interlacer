import { Model } from "../baseTypes/Model"
import { Optional } from "../baseTypes/ValueTypes"

export type PublicUser = Model<
  "publicUser",
  {
    nickname?: Optional<string>
    profilePictureHref?: Optional<string>
  }
>

export const PublicUserKeys: (keyof PublicUser)[] = [
  "nickname",
  "profilePictureHref",
]

// export const PublicUserKeys = keys<PublicUser>()
