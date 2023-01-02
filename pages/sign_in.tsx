import React from "react"
import type { NextPage } from "next"
import Head from "next/head"

import { AuthAction, withAuthUser, withAuthUserSSR } from "next-firebase-auth"
import { SignInOrSignUpView } from "@/views/auth/SignInOrSignUpView"

const LoginPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Sign in</title>
        <meta name="description" content="Login to XQ Language" />
      </Head>
      <main>
        <SignInOrSignUpView signUpMode={false} />
      </main>
    </div>
  )
}

export const getServerSideProps = withAuthUserSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthed: AuthAction.RENDER,
})()

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedAfterInit: AuthAction.RENDER,
})(LoginPage)
