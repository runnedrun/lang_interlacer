import isEmail from "isemail"

export const validateEmailList = (value: string[]) => {
  const validEmails = value.map((_) => isEmail.validate(_)).filter(Boolean)
  return validEmails.length === value.length
    ? undefined
    : { message: "Invalid email" }
}
