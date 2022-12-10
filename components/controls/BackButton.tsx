import { ArrowLeft } from "@mui/icons-material"
import Link from "next/link"
import React from "react"

export type UrlObject = { path: string; query: Record<string, string> }

export const BackButton = ({ href }: { href: string | UrlObject }) => (
  <Link href={href} passHref>
    <div className="py- flex w-28 cursor-pointer items-center rounded-sm bg-red-400 px-2 py-1 text-white hover:bg-red-500">
      <span>
        <ArrowLeft className="h-5 w-5" />
      </span>
      <span className="ml-2">Back</span>
    </div>
  </Link>
)
