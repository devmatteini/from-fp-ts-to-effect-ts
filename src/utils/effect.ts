import * as E from "@effect/data/Either"
import { Either } from "@effect/data/Either"
import * as Effect from "@effect/io/Effect"
import * as S from "@fp-ts/schema"
import { formatErrors } from "@fp-ts/schema/formatter/Tree"

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

export const fromPredicate =
    <E, A>(predicate: (a: A) => boolean, onFalse: (a: A) => E) =>
    (a: A): Effect.Effect<never, E, A> =>
        predicate(a) ? Effect.succeed(a) : Effect.fail(onFalse(a))

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
