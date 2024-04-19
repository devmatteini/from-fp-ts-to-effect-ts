import * as E from "effect/Either"
import * as F from "effect/Function"
import { Either } from "effect/Either"
import * as Effect from "effect/Effect"
import * as S from "@effect/schema/Schema"
import { formatErrorSync } from "@effect/schema/TreeFormatter"

type Decoder<T> = (a: unknown) => Either<T, string>
export const decode =
    <T>(schema: S.Schema<T>): Decoder<T> =>
    (input) => {
        const parser = S.decodeUnknownEither(schema)
        const parsed = parser(input, {
            errors: "all",
            onExcessProperty: "ignore",
        })
        return F.pipe(
            parsed,
            E.mapLeft((x) => formatErrorSync(x)),
        )
    }

export const runEffect = <A, E>(e: Effect.Effect<A, E>) =>
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
