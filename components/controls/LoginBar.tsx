import { Button } from "@mui/material"
import Link from "next/link"
import { useAuthUser } from "next-firebase-auth"

export function LoginBar(): JSX.Element {
  const AuthUser = useAuthUser()
  return AuthUser.id ? (
    <div className="w-full text-right my-2">
      <Link href="/api/logout" passHref>
        <Button className="mx-2">Log Out</Button>
      </Link>
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
