import * as E from "@effect/data/Either"
import { Either } from "@effect/data/Either"
import * as Effect from "@effect/io/Effect"
import * as S from "@effect/schema"
import { formatErrors } from "@effect/schema/formatter/Tree"

type Decoder<T> = (a: unknown) => Either<string, T>
export const decode =
    <T>(schema: S.Schema<T>): Decoder<T> =>
    (input) => {
        const decoded = S.decode<T>(schema)(input, {
            allErrors: true,
            isUnexpectedAllowed: true,
        })
        // FIXME: for some reason E.mapLeft does not work :(
        return S.isSuccess(decoded) ? E.right(decoded.right) : E.left(formatErrors(decoded.left))
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
