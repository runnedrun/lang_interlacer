import { Address } from "@/data/types/Store"

export const getPrettyAddress = (addressObj: Address) => {
  const addressKeysInOrder = ["street", "city", "state", "zip"]
  let addressFields = []
  addressKeysInOrder.forEach((key)=>{
    if (addressObj[key]) addressFields.push(addressObj[key])
  })
  return addressFields.join(", ")
}
