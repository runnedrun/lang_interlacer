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
      <Button component={Link} className="mx-2">
        Sign In
      </Button>
      <Button component={Link} className="mx-2" variant="contained">
        Sign Up
      </Button>
    </div>
  )
}
