import * as Data from "@effect/data/Data"
import * as Equal from "@effect/data/Equal"
import * as Hash from "@effect/data/Hash"
import * as Optic from "@fp-ts/optic"

test("Data", () => {
  const opt = Optic.id<Data.Data<{ a: number; b: number }>>()
  const v = Data.struct({ a: 1, b: 2 })
  const v2 = Optic.replace(opt.at("a"))(1)(v)

  expect(Equal.equals(v, v)).toEqual(true)
  expect(Equal.equals(v, v2)).toEqual(true)
})

// FIX THE ISSUE WITH `Object.setPrototypeOf` in Data.Class
export function Class<A extends Record<string, any>>() {
  return class Class {
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
  } as new(args: Omit<A, keyof Equal.Equal>) => Data.Data<A>
}

test("Class without Trait", () => {
  class ABC extends Class<{ readonly a: number; readonly b: number }>() {}
  const opt = Optic.id<{ a: number; b: number }>()
  const v = new ABC({ a: 1, b: 2 })
  const v2 = Optic.replace(opt.at("a"))(1)(v)
  const v3 = Optic.replace(opt.at("a"))(1)(v2)

  expect(Equal.equals(v, v)).toEqual(true)

  expect(Equal.equals(v, v2)).toEqual(true)
  expect(Equal.equals(v2, v3)).toEqual(true)
  expect(v2 instanceof ABC).toEqual(true)
  expect(v3 instanceof ABC).toEqual(true)
  expect(Object.getPrototypeOf(v) === Object.getPrototypeOf(v2)).toEqual(true)
  expect(Object.getPrototypeOf(v2) === Object.getPrototypeOf(v3)).toEqual(true)

  // expect(Equal.equals(v, v2)).toEqual(true)
  // expect(v2 instanceof ABC).toEqual(true)
})

test("Class with Trait", () => {
  class ABCWithTrait extends Class<{ readonly a: number; readonly b: number }>() {
    [Optic.cloneTrait](a: any) {
      return new (this.constructor as any)(a)
      // return Object.setPrototypeOf(a, Object.getPrototypeOf(this))
    }
  }
  const opt = Optic.id<{ a: number; b: number }>()
  const v = new ABCWithTrait({ a: 1, b: 2 })
  const v2 = Optic.replace(opt.at("a"))(1)(v)
  const v3 = Optic.replace(opt.at("a"))(1)(v2)

  expect(Equal.equals(v, v)).toEqual(true)

  expect(Equal.equals(v, v2)).toEqual(true)
  expect(Equal.equals(v2, v3)).toEqual(true)
  expect(v2 instanceof ABCWithTrait).toEqual(true)
  expect(v3 instanceof ABCWithTrait).toEqual(true)
  expect(Object.getPrototypeOf(v) === Object.getPrototypeOf(v2)).toEqual(true)
  expect(Object.getPrototypeOf(v2) === Object.getPrototypeOf(v3)).toEqual(true)
})
