import { isEqual, isEqualWith, isFunction, isObject, transform } from "lodash"
import {
  distinctUntilChanged,
  MonoTypeOperatorFunction,
  Observable,
} from "rxjs"

function difference(object, base) {
  function changes(object, base) {
    return transform(object, function (result, value, key) {
      if (!isEqual(value, base[key])) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value
      }
    })
  }
  return changes(object, base)
}

export const distinctUntilChangedWithoutFns = <Input extends any>(
  inputObs: Observable<Input>
) =>
  inputObs.pipe(
    distinctUntilChanged(
      (prev, current) => {
        const diff = difference(current, prev)
        return false
      }
      // isEqualWith(prev, current, (val1, val2) => {
      //   console.log("comparing", val1, val2)
      //   if (isFunction(val1) && isFunction(val2)) {
      //     console.log("is function")
      //     return true
      //   } else {
      //     return isEqual(val1, val2)
      //   }
      // })
    )
  ) as Observable<Input>
