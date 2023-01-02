import { withLogger } from "@/analytics/withLogger"
import React, { useEffect } from "react"
import { useState, ReactNode } from "react"
import { JourneyExtraMethods } from "@/analytics/buildLoggersForJourney"
import { FormGroup, TextField } from "@mui/material"
import { buildErrorOrLabelText } from "@/page_helpers/mui/buildErrorOrLabelText"
import { KeyError } from "@/data/firebaseObsBuilders/fbWriter"

interface SignInProvider {
  iconComponent?: ReactNode
  text: string
  onClick: Function
}
interface ImageDescriptor {
  src: string
  alt?: string
}

export type SignInSignUpLoggers = {
  landOnSignInSignUp: () => void
  startEmail: () => void
  startPassword: () => void
  startConfirmPassword: () => void
  submitLoginInformation: () => void
} & JourneyExtraMethods<{ signUpMode: any }>

export interface SplitScreenSignInOrUpProps {
  alternativeCTA?: {
    text: string
    href: string
  }
  logoImage?: ImageDescriptor
  additionalAuthProviders?: SignInProvider[]
  forgotPasswordHref?: string
  signInFn: (email: string, password: string, rememberMe: boolean) => void
  splitScreenComponent: React.ReactNode
  signUpMode?: boolean
  mobileWelcomeMessage?: { title: string; subtitle: string }
  error?: string
  loggers?: SignInSignUpLoggers
}

export const exampleProps: SplitScreenSignInOrUpProps = {
  alternativeCTA: {
    text: "start your 14-day free trial",
    href: "#",
  },
  logoImage: {
    src: "https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg",
    alt: "workflow",
  },
  forgotPasswordHref: "#",
  signInFn: () => {},
  splitScreenComponent: (
    <img
      className="absolute inset-0 h-full w-full object-cover"
      src="https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
    />
  ),
  additionalAuthProviders: [
    {
      text: "Sign in with Facebook",
      iconComponent: (
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
            clipRule="evenodd"
          />
        </svg>
      ),
      onClick: () => {},
    },
  ],
}

export const SplitScreenSignInOrUp = ({
  alternativeCTA,
  logoImage,
  additionalAuthProviders = [],
  forgotPasswordHref,
  signInFn,
  splitScreenComponent,
  signUpMode,
  mobileWelcomeMessage,
  error,
  loggers,
}: SplitScreenSignInOrUpProps) => {
  loggers.attachJourneyData({ signUpMode })
  loggers?.landOnSignInSignUp()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState<KeyError>(
    null
  )

  console.log("coinofr", confirmPasswordError)

  const [triedToSubmit, setTriedToSubmit] = useState<boolean>()

  useEffect(() => {
    if (!signUpMode) return
    const shouldShowError =
      (triedToSubmit && !confirmPassword) ||
      (confirmPassword && confirmPassword !== password)

    shouldShowError
      ? setConfirmPasswordError({ message: "Passwords do not match" })
      : setConfirmPasswordError(null)
  }, [confirmPassword, password, triedToSubmit])

  const validateCredentialsBeforeSignUpOrIn = () => {
    setTriedToSubmit(true)
    if (confirmPasswordError) return
    if ((!confirmPassword && signUpMode) || !password || !username) return

    loggers?.submitLoginInformation()

    signInFn(username, password, rememberMe)
  }

  const additionalAuthProvidersComponent = additionalAuthProviders.length ? (
    <div>
      <div>
        <p className="text-sm font-medium text-gray-700">
          {signUpMode ? "Sign up with" : "Sign in with"}
        </p>
        <div className="mt-1 grid grid-cols-3 gap-3">
          {additionalAuthProviders.map((provider) => (
            <div key={provider.text}>
              <a
                onClick={() => provider.onClick()}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">{provider.text}</span>
                {provider.iconComponent}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
    </div>
  ) : (
    ""
  )

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col justify-around py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        {mobileWelcomeMessage && (
          <div className="mt-5 text-center lg:hidden">
            <div className="text-4xl font-bold">
              {mobileWelcomeMessage.title}
            </div>
            <div className="text-2xl font-bold mt-5">
              {mobileWelcomeMessage.subtitle}
            </div>
          </div>
        )}
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            {logoImage && (
              <img
                className="h-12 w-auto"
                src={logoImage.src}
                alt={logoImage.alt}
              />
            )}
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {signUpMode
                ? "Sign up for an account"
                : "Sign in to your account"}
            </h2>
            {alternativeCTA && (
              <p className="mt-2 text-sm text-gray-600">
                Or{" "}
                <a
                  href={alternativeCTA.href}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {alternativeCTA.text}
                </a>
              </p>
            )}
          </div>

          <div className="mt-8">
            {additionalAuthProvidersComponent}
            {error && (
              <div className="text-red-500 font-bold text-base">{error}</div>
            )}
            <div className="mt-6">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  validateCredentialsBeforeSignUpOrIn()
                  e.preventDefault()
                  return false
                }}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <TextField
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      onChange={withLogger(loggers?.startEmail, (e) =>
                        setUsername(e.target.value)
                      )}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <TextField
                    onChange={(e) => {
                      withLogger(
                        loggers?.startPassword,
                        setPassword
                      )(e.target.value)
                    }}
                    type="password"
                    autoComplete="password"
                    id="password"
                    className="w-full"
                  ></TextField>
                </div>
                <div className="space-y-1">
                  {signUpMode && (
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm password
                      </label>
                      <TextField
                        onChange={(e) => {
                          withLogger(
                            loggers?.startConfirmPassword,
                            setConfirmPassword
                          )(e.target.value)
                        }}
                        error={!!confirmPasswordError}
                        id="confirm-password"
                        type="password"
                        autoComplete="password"
                        className="w-full"
                      ></TextField>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      onClick={() => setRememberMe(!rememberMe)}
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Remember me
                    </label>
                  </div>

                  {forgotPasswordHref && !signUpMode && (
                    <div className="text-sm">
                      <a
                        href={forgotPasswordHref}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Forgot your password?
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-400 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
                  >
                    {signUpMode ? "Sign up" : "Sign in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        {splitScreenComponent}
      </div>
    </div>
  )
}

export default SplitScreenSignInOrUp
