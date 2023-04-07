import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"
import * as F from "fp-ts/function"
import * as E from "fp-ts/Either"

// ********** Branded types **********

interface UserIdBrand {
    readonly UserId: unique symbol
}

const UserId = t.brand(t.number, (x): x is t.Branded<number, UserIdBrand> => t.Int.is(x), "UserId")
type UserId = t.TypeOf<typeof UserId>

// @ts-expect-error
const notAUserId: UserId = 10

const userId = F.pipe(
    UserId.decode(10),
    E.getOrElseW((x) => {
        const errors = PathReporter.report(E.left(x)).join("\n  ")
        throw new Error(`Not a UserID: ${errors}`)
    }),
)
console.log("UserId from decode: ", userId)

// ********** Custom Types **********

const DateFromString = new t.Type<Date, string, unknown>(
    "DateFromString",
    (input): input is Date => input instanceof Date,
    (input, ctx) =>
        F.pipe(
            t.string.validate(input, ctx),
            E.chain((s) => {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
                const result = Date.parse(s)
                return Number.isNaN(result)
                    ? t.failure(input, ctx, `Invalid ISO 8601 datetime: ${s}`)
                    : t.success(new Date(s))
            }),
        ),
    (date) => date.toISOString(),
)
type DateFromString = t.TypeOf<typeof DateFromString>

// NOTE: without branded types you can directly create the underlying type, but it might not be valid
const ctor: DateFromString = new Date("2023-04-32")
console.log("DateFromString constructed manually: ", ctor)

// Always use DateFromString.decode to ensure it's actually valid
const dateFromString = F.pipe(
    DateFromString.decode("2023-04-07"),
    E.getOrElseW((x) => {
        const errors = PathReporter.report(E.left(x)).join("\n  ")
        throw new Error(`Not a DateFromString: ${errors}`)
    }),
)
console.log("DateFromString from decode: ", dateFromString)
