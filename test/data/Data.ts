import * as Data from "@effect/data/Data"
import * as Equal from "@effect/data/Equal"
import * as Optic from "@fp-ts/optic"

test("Data", () => {
  const opt = Optic.id<Data.Data<{ a: number; b: number }>>()
  const v = Data.struct({ a: 1, b: 2 })
  const v2 = Optic.replace(opt.at("a"))(1)(v)

  expect(Equal.equals(v, v)).toEqual(true)
  expect(Equal.equals(v, v2)).toEqual(true)
})

test("Class", () => {
  class ABC {
    constructor(readonly a: number, readonly b: number) {}
  }
  const opt = Optic.id<{ a: number; b: number }>()
  const v = new ABC(1, 2)
  const v2 = Optic.replace(opt.at("a"))(1)(v)

  expect(Equal.equals(v, v)).toEqual(true)
  expect(Equal.equals(v, v2)).toEqual(true)
  expect(v2 instanceof ABC).toEqual(true)
})
