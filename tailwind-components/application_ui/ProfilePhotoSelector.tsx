import React from "react"
import { Button } from "./Button"

interface ProfilePhotoSelectorProps {
  name?: string
  buttonText?: string
  title?: string
  id?: string
  photoUrl?: string
  changeProfilePhoto: React.ChangeEventHandler<HTMLInputElement>
  removeProfilePhoto?: () => void
}

export const exampleProps: ProfilePhotoSelectorProps = {
  name: "uploadFile",
  buttonText: "Change",
  title: "Photo",
  id: "uploadFile",
  changeProfilePhoto: () => {},
  removeProfilePhoto: () => {},
}

export const ProfilePhotoSelector = ({
  name,
  buttonText,
  title,
  id,
  photoUrl,
  changeProfilePhoto,
  removeProfilePhoto,
}: ProfilePhotoSelectorProps) => {
  return (
    <div className="sm:col-span-6">
      <label
        htmlFor="photo"
        className="block text-sm font-medium text-gray-700"
      >
        {title}
      </label>
      <div className="mt-1 flex items-center">
        <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
          {photoUrl && (
            <img className={`object-cover h-12 w-12`} src={photoUrl}></img>
          )}
        </span>

        <label htmlFor={id}>
          <span className="focus:outline-none ml-5 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            {buttonText}
          </span>
          <input
            id={id}
            name={name}
            type="file"
            className="sr-only"
            onChange={changeProfilePhoto}
          />
        </label>

        <Button
          buttonAssets={{ text: "X" }}
          className="col-span-6 ml-2"
          onClick={removeProfilePhoto}
        />
      </div>
    </div>
  )
}
