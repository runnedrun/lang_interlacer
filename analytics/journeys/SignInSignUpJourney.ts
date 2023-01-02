import { buildLoggersForJourney } from "../buildLoggersForJourney"

export const SignInSignUpJourney = buildLoggersForJourney(
  "SignInOrSignUp",
  { signUpMode: undefined },
  {
    landOnSignInSignUp: { once: true },
    startEmail: { once: true },
    startPassword: { once: true },
    startConfirmPassword: { once: true },
    submitLoginInformation: {},
  }
)
