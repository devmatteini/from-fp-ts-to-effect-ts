import * as F from "fp-ts/function"
import * as E from "fp-ts/Either"

const r = E.right(7)

const l = E.left(3)

const eitherFromRandom = (random: number) =>
    random > 0.5 ? E.right(random) : E.left("Number is less than 0.5")

const x = F.pipe(
    // keep new line
    Math.random(),
    eitherFromRandom,
)

console.log(x)
