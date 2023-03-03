import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import * as F from "fp-ts/function"
import { TaskEither } from "fp-ts/TaskEither"
import * as TE from "fp-ts/TaskEither"
import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"
import { delay } from "./promise"

type Decoder<T> = (a: unknown) => Either<string, T>
export const decode = <T>(type: t.Type<T, unknown>): Decoder<T> =>
    F.flow(
        // keep new line
        type.decode,
        E.mapLeft((x) => {
            const errors = PathReporter.report(E.left(x)).join("\n  ")
            return `Unable to decode ${type.name}:\n  ${errors}`
        }),
    )

type DelayOptions = {
    fail?: boolean
}
export const delayTE = (timeout: number, options?: DelayOptions) =>
    TE.tryCatch(
        () => delay(timeout, options?.fail),
        (e) => `Failed delayTE: ${e}`,
    )

export const runTaskEither = async (te: TaskEither<unknown, unknown>) => {
    const result = await te()

    if (E.isRight(result)) {
        const x = result.right

        if (x === null || x === undefined) return
        if (typeof x === "object") {
            console.log(JSON.stringify(x, null, 2))
            return
        }
        console.log(x)
    } else {
        console.error("Error!!!\n", result.left)
        throw result.left
    }
}
