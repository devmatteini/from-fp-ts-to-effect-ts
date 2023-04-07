import * as F from "@effect/data/Function"
import * as E from "@effect/data/Either"
import * as S from "@effect/schema/Schema"
import * as AST from "@effect/schema/AST"
import { formatErrors } from "@effect/schema/TreeFormatter"
import * as PR from "@effect/schema/ParseResult"
import * as O from "@effect/data/Option"

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

// NOTE: this type is already available in schema: S.DateFromString
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
    S.parseEither(Email)("any@email"),
    E.getOrElse((x) => {
        // We can retrive the 'identifier' annotation to enrich the error message.
        // This is like using io-ts <Type>.name, but require a bit more work
        const identifier = F.pipe(
            AST.getAnnotation<string>(AST.IdentifierAnnotationId)(Email.ast),
            O.getOrElse(F.constant("unknown schema")),
        )
        const examples = F.pipe(
            AST.getAnnotation<string[]>(AST.ExamplesAnnotationId)(Email.ast),
            O.match(F.constant(""), (x) => x.join(", ")),
            (x) => `Examples: ${x}`,
        )
        throw new Error(`Parse ${identifier}: ${formatErrors(x.errors)} (${examples})`)
    }),
)
console.log("Email decode with annotation: ", invalidEmail)
