import { getAuth, signOut } from "@firebase/auth"
import { Button } from "@mui/material"
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth"
import Link from "next/link"

const LoginBarComponent = (): JSX.Element => {
  const userId = useAuthUser().id
  return userId ? (
    <div className="w-full text-right my-2">
      <Button className="mx-2" onClick={() => signOut(getAuth())}>
        Log Out
      </Button>
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

export const LoginBar = withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(LoginBarComponent)
