import * as Data from "@effect/data/Data"
import * as Equal from "@effect/data/Equal"
import * as Hash from "@effect/data/Hash"
import * as Optic from "@fp-ts/optic"

const cloneTrait = Symbol()

test("Data", () => {
  const opt = Optic.id<Data.Data<{ a: number; b: number }>>()
  const v = Data.struct({ a: 1, b: 2 })
  const v2 = Optic.replace(opt.at("a"))(1)(v)

  Object.defineProperty(v, cloneTrait, {
    enumerable: false,
    value(a: any) {
      return Object.setPrototypeOf(a, Object.getPrototypeOf(this))
      // return Data.struct(a)
    }
  })

  expect(Equal.equals(v, v)).toEqual(true)
  // try prototype solution
  expect(Equal.equals(v, v[cloneTrait](v2))).toEqual(true)

  // expect(Equal.equals(v, v2)).toEqual(true)
})

// FIX THE ISSUE WITH `Object.setPrototypeOf` in Data.Class
export function FixedDataClass<A extends Record<string, any>>() {
  return class FixedDataClass {
    constructor(a: A) {
      Object.assign(this, a)
    }
    [Hash.symbol]() {
      return Hash.structure(this)
    }
    [Equal.symbol](that: any) {
      const selfKeys = Object.keys(this)
      const thatKeys = Object.keys(that)
      if (selfKeys.length !== thatKeys.length) {
        return false
      }
      for (const key of selfKeys) {
        if (!(key in that && Equal.equals(this[key], that[key]))) {
          return false
        }
      }
      return true
    }
  }
}

export const Class = <A extends Record<string, any>>() => {
  class TMP extends FixedDataClass<A>() {
    constructor(a: A) {
      super(a)
    }
    [cloneTrait](a: any) {
      // return new (this.constructor as any)(a)
      return Object.setPrototypeOf(a, Object.getPrototypeOf(this))
    }
  }
  return TMP as any as new(args: Omit<A, keyof Equal.Equal>) => Data.Data<A>
}

test("Class", () => {
  class ABC extends Class<{ readonly a: number; readonly b: number }>() {
    constructor(a: { readonly a: number; readonly b: number }) {
      super(a)
    }
  }
  const opt = Optic.id<{ a: number; b: number }>()
  const v = new ABC({ a: 1, b: 2 })
  const v2 = Optic.replace(opt.at("a"))(1)(v)
  const v3 = Optic.replace(opt.at("a"))(1)(v2)

  expect(Equal.equals(v, v)).toEqual(true)

  expect(Equal.equals(v, v[cloneTrait](v2))).toEqual(true)
  expect(Equal.equals(v2, v2[cloneTrait](v3))).toEqual(true)
  expect(v[cloneTrait](v2) instanceof ABC).toEqual(true)
  expect(v2[cloneTrait](v3) instanceof ABC).toEqual(true)
  expect(Object.getPrototypeOf(v) === Object.getPrototypeOf(v2)).toEqual(true)
  expect(Object.getPrototypeOf(v2) === Object.getPrototypeOf(v3)).toEqual(true)

  // expect(Equal.equals(v, v2)).toEqual(true)
  // expect(v2 instanceof ABC).toEqual(true)
})
