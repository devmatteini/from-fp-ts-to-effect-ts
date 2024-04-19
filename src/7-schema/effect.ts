import * as F from "effect/Function"
import * as E from "effect/Either"
import * as S from "@effect/schema/Schema"
import * as AST from "@effect/schema/AST"
import { formatError } from "@effect/schema/TreeFormatter"
import * as PR from "@effect/schema/ParseResult"
import * as O from "effect/Option"

// ********** Branded types **********
// https://github.com/Effect-TS/schema#branded-types

const UserId = F.pipe(S.number, S.brand("UserId"))
type UserId = S.Schema.To<typeof UserId>

// @ts-expect-error
const notAUserId: UserId = 10

const userId = F.pipe(
    S.decodeUnknownEither(UserId)(10),
    E.getOrElse((x) => {
        throw new Error(`Not a UserID: ${formatError(x)}`)
    }),
)
console.log("UserId from decode: ", userId)

// ********** Custom Types **********
// https://github.com/Effect-TS/schema#transformations

// NOTE: this type is already available in schema: S.Date
const DateFromString = S.transformOrFail(
    S.string,
    S.ValidDateFromSelf,
    (input) => {
        const result = Date.parse(input)
        return Number.isNaN(result)
            ? PR.fail(PR.type(S.ValidDateFromSelf.ast, input)) // PR.type means: an error that occurs when the actual value is not of the expected type, in this case is not 'S.DateFromSelf'
            : PR.succeed(new Date(result))
    },
    (date) => PR.succeed(date.toISOString()),
)
type DateFromString = S.Schema.To<typeof DateFromString>

// NOTE: without branded types you can directly create the underlying type, but it might not be valid
const ctor: DateFromString = new Date("2023-04-32")
console.log("DateFromString constructed manually: ", ctor)

// Always decode DateFromString to ensure it's actually valid
const dateFromString = F.pipe(
    S.decodeUnknownEither(DateFromString)("2023-04-07"),
    E.getOrElse((x) => {
        throw new Error(`Not a DateFromString: ${formatError(x)}`)
    }),
)
console.log("DateFromString from decode: ", dateFromString)

// ********** Annotations **********
// https://github.com/Effect-TS/schema#annotations

// https://www.emailregex.com/
const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const Email = F.pipe(
    S.string,
    S.nonEmpty(),
    S.pattern(emailRegex, {
        // Specify human-readable message for this step instead of the regex
        message: (x) => `Invalid email pattern '${x}'`,
        examples: ["info@example.com", "foo.bar@example.co.uk"],
    }),
    S.identifier("Email"),
)

const invalidEmail = F.pipe(
    S.decodeUnknownEither(Email)("any@email"),
    E.getOrElse((x) => {
        // TODO: make sure identifier and examples are logged
        throw new Error(`Parse Error: ${formatError(x)}`)
    }),
)
console.log("Email decode with annotation: ", invalidEmail)
