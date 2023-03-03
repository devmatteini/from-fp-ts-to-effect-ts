import * as F from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import { capDelay, exponentialBackoff, limitRetries, Monoid, RetryStatus } from "retry-ts"
import { retrying } from "retry-ts/Task"
import { delayTE, runTaskEither } from "../utils/fp-ts"

const max2sec = 2000

const policy = capDelay(
    // keep new line
    max2sec,
    Monoid.concat(exponentialBackoff(200), limitRetries(5)),
)

const getTodos = delayTE(1000, { fail: true })
const logRetry = (status: RetryStatus) =>
    TE.rightIO(() => {
        const message = F.pipe(
            status.previousDelay,
            O.map((delay) => `Retrying in ${delay} milliseconds...`),
            O.getOrElse(() => "First run..."),
        )
        console.log(message)
    })

const withRetry = <Err, A>(te: TaskEither<Err, A>) =>
    retrying(
        // keep new line
        policy,
        (status) => F.pipe(logRetry(status), TE.apSecond(te)),
        E.isLeft,
    )

const getTodosWithRetry = withRetry(getTodos)

runTaskEither(getTodosWithRetry).catch(() => {
    process.exit(1)
})
