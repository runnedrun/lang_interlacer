import { Button } from "@mui/material"
import Link from "next/link"

export default function LoginBar({
  loggedIn,
}: {
  readonly loggedIn?: boolean
}): JSX.Element {
  return loggedIn ? (
    <div className="w-full text-right my-2">
      <Button className="mx-2">Log Out</Button>
    </div>
  ) : (
    <div className="w-full text-right my-2">
      <Link href="/sign_in" passHref>
        <Button className="mx-2">Sign In</Button>
      </Link>
      <Link href="/sign_up" passHref>
        <Button className="mx-2" variant="contained">
          Sign Up
        </Button>
      </Link>
    </div>
  )
}
