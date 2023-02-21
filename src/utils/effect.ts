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

export const runEffect = <E, A>(e: Effect.Effect<never, E, A>) =>
    Effect.runPromise(e)
        .then((x) => console.log(JSON.stringify(x, null, 2)))
        .catch((e) => {
            console.error("Error!!!\n", e)
            throw e
        })
