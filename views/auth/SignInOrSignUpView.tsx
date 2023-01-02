import React, { useState } from "react"
import Image from "next/image"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"

import { getAuth } from "@/data/getAuth"
import { FirebaseAuthErrors } from "@/data/auth/FirebaseAuthErrors"

import logo from "@/public/xq_logo.png"
import { useRouter } from "next/router"
import { setters } from "@/data/fb"
import { FirebaseError } from "@firebase/util"
import { SignInSignUpJourney } from "@/analytics/journeys/SignInSignUpJourney"
import SplitScreenSignInOrUp from "@/components/layouts/SplitScreenSignInOrUp"

interface SignInOrSignUpProps {
  signUpMode: boolean
}

const HyliteIntroView = () => (
  <div className="py-15 via-primary-400 from-primary-400 h-full w-full flex flex-col bg-gradient-to-r to-primary-200 items-center px-32">
    <div className="overflow-hidden rounded-3xl mt-5">
      <Image className="h-40 object-cover" src={logo} alt="The Logo" />
    </div>
    <div className="text-l bg-primary-100 px-10 rounded-lg mt-20 shadow-lg py-10 text-gray-700">
      Welcome to XQ Language— tools for intermediate language learners.
    </div>
  </div>
)

export const SignInOrSignUpView = ({ signUpMode }: SignInOrSignUpProps) => {
  const router = useRouter()
  const query =
    typeof window === "undefined"
      ? `?${new URLSearchParams(
          router.query as Record<string, any>
        ).toString()}`
      : window.location.search
  const [signInError, setSignInError] = useState("")
  return (
    <SplitScreenSignInOrUp
      loggers={SignInSignUpJourney}
      error={signInError}
      mobileWelcomeMessage={{
        title: "Welcome To Hylite!",
        subtitle: "We're glad you're here.",
      }}
      alternativeCTA={
        signUpMode
          ? {
              text: "sign in to an existing account",
              href: `/sign_in${query}`,
            }
          : { text: "create an account", href: `/sign_up${query}` }
      }
      signInFn={(email, password) => {
        const auth = getAuth()
        const signInPromise = signUpMode
          ? createUserWithEmailAndPassword(auth, email, password).then(
              (user) => {
                setters.user(user.user.uid, { email: email })
              }
            )
          : signInWithEmailAndPassword(auth, email, password)
        signInPromise.catch((e: FirebaseError) => {
          const code = e.code
          setSignInError(FirebaseAuthErrors[code])
        })
      }}
      // forgotPasswordHref="#"
      splitScreenComponent={<HyliteIntroView />}
      signUpMode={signUpMode}
    />
  )
}
