import * as Optic from "@fp-ts/optic"
import * as Data from "effect/Data"
import * as Equal from "effect/Equal"

test("Data", () => {
  const opt = Optic.id<Data.Data<{ a: number; b: number }>>()
  const v = Data.struct({ a: 1, b: 2 })
  const v2 = Optic.replace(opt.at("a"))(1)(v)

  expect(Equal.equals(v, v)).toEqual(true)
  expect(Equal.equals(v, v2)).toEqual(true)
})

describe("Random Class", () => {
  test("basics", () => {
    class ABC {
      constructor(readonly a: number, readonly b: number) {}
    }
    const opt = Optic.id<ABC>()
    const v = new ABC(1, 2)
    const v2 = Optic.replace(opt.at("a"))(1)(v)
    const v3 = Optic.replace(opt.at("a"))(1)(v2)

    expect(Equal.equals(v, v)).toEqual(true)
    expect(Equal.equals(v, v2)).toEqual(false)
    expect(Equal.equals(v2, v3)).toEqual(false)
    expect(v2 instanceof ABC).toEqual(true)
    expect(v3 instanceof ABC).toEqual(true)
    expect(Object.getPrototypeOf(v) === Object.getPrototypeOf(v2)).toEqual(true)
    expect(Object.getPrototypeOf(v2) === Object.getPrototypeOf(v3)).toEqual(true)
  })

  test("some private", () => {
    class ABC {
      [Optic.cloneTrait](a: any) {
        const cl = new ABC(a.a, a.b)
        cl.#test = this.#test
        return cl // Object.assign(Object.create(this), a)
      }
      #test: number
      constructor(readonly a: number, readonly b: number) {
        this.#test = 1
      }

      set test(v: number) {
        this.#test = v
      }

      get test() {
        return this.#test
      }
    }
    const opt = Optic.id<ABC>()
    const v = new ABC(1, 2)
    v.test = 2

    const v2 = Optic.replace(opt.at("a"))(1)(v)
    expect(v.test).toBe(2)
    expect(v2.test).toBe(2)
    expect(v2 instanceof ABC).toEqual(true)
    expect(Object.getPrototypeOf(v) === Object.getPrototypeOf(v2)).toEqual(true)
  })
})

test("Class without Trait", () => {
  class ABC extends Data.Class<{ readonly a: number; readonly b: number }> {}
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
  class ABCWithTrait extends Data.Class<{ readonly a: number; readonly b: number }> {
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