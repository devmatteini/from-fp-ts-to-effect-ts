import * as E from "@effect/data/Either"
import * as F from "@effect/data/Function"
import { Either } from "@effect/data/Either"
import * as Effect from "@effect/io/Effect"
import * as S from "@effect/schema/Schema"
import { formatErrors } from "@effect/schema/TreeFormatter"

type Decoder<T> = (a: unknown) => Either<string, T>
export const decode =
    <T>(schema: S.Schema<T>): Decoder<T> =>
    (input) => {
        const parser = S.parseEither(schema)
        const parsed = parser(input, {
            errors: "all",
            onExcessProperty: "ignore",
        })
        return F.pipe(
            parsed,
            E.mapLeft((x) => formatErrors(x.errors)),
        )
    }

export const runEffect = <E, A>(e: Effect.Effect<never, E, A>) =>
    Effect.runPromise(e)
        .then((x) => {
            if (x === null || x === undefined) return
            if (typeof x === "object") {
                console.log(JSON.stringify(x, null, 2))
                return
            }
            console.log(x)
        })
        .catch((e) => {
            console.error("Error!!!\n", e)
            throw e
        })
