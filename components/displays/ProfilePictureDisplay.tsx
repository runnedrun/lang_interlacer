import React from "react"
import { UserIcon } from "@heroicons/react/solid"
import { DisplayComponentProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"

export const ProfilePictureDisplay = ({
  value,
}: DisplayComponentProps<any, string>) => {
  return (
    <div className=" p-2">
      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
        {value ? (
          <img
            className={`object-cover w-11 h-11`}
            src={value}
            alt="User profile picture"
          />
        ) : (
          <UserIcon />
        )}
      </div>
    </div>
  )
}
