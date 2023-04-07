import * as F from "@effect/data/Function"
import * as E from "@effect/data/Either"
import * as S from "@effect/schema/Schema"
import { formatErrors } from "@effect/schema/TreeFormatter"
import * as PR from "@effect/schema/ParseResult"
import { PathReporter } from "io-ts/PathReporter"

// ********** Branded types **********
// https://github.com/Effect-TS/schema#branded-types

const UserId = F.pipe(S.number, S.brand("UserId"))
type UserId = S.To<typeof UserId>

// @ts-expect-error
const notAUserId: UserId = 10

const userId = F.pipe(
    S.parseEither(UserId)(10),
    E.getOrElse((x) => {
        throw new Error(`Not a UserID: ${formatErrors(x.errors)}`)
    }),
)
console.log("UserId from decode: ", userId)

// ********** Custom Types **********
// https://github.com/Effect-TS/schema#transformations

const DateFromString = S.transformResult(
    S.string,
    S.date,
    (input) => {
        const result = Date.parse(input)
        return Number.isNaN(result)
            ? PR.failure(PR.type(S.date.ast, input)) // PR.type means: an error that occurs when the actual value is not of the expected type, in this case is not 'S.date'
            : PR.success(new Date(result))
    },
    (date) => PR.success(date.toISOString()),
)
type DateFromString = S.To<typeof DateFromString>

// NOTE: without branded types you can directly create the underlying type, but it might not be valid
const ctor: DateFromString = new Date("2023-04-32")
console.log("DateFromString constructed manually: ", ctor)

// Always use DateFromString.decode to ensure it's actually valid
const dateFromString = F.pipe(
    S.parseEither(DateFromString)("2023-04-07"),
    E.getOrElse((x) => {
        throw new Error(`Not a DateFromString: ${formatErrors(x.errors)}`)
    }),
)
console.log("DateFromString from decode: ", dateFromString)
