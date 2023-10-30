import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Data from "effect/Data"
import * as Equal from "effect/Equal"
import * as Cause from "effect/Cause"
import { runEffect } from "../utils/effect"

interface TransientError extends Data.Case {
    _tag: "TransientError"
    message: string
}
const TransientError = Data.tagged<TransientError>("TransientError")

interface FatalError extends Data.Case {
    _tag: "FatalError"
    message: string
}
const FatalError = Data.tagged<FatalError>("FatalError")

// --- Failures ---
// Expected and recoverable errors. This is the E type parameter in Effect<R, E, A>

const someError = F.pipe(
    Effect.fail(TransientError({ message: "http timeout" })),
    Effect.flatMap(() => Effect.fail(FatalError({ message: "malformed json" }))),
    Effect.map(() => "done"),
)

const canCompareErrorByValue = Equal.equals(
    TransientError({ message: "timeout" }),
    TransientError({ message: "timeout" }),
)

const handleError = F.pipe(
    someError,
    Effect.catchTag("TransientError", () => Effect.succeed("http ok now")),
)
/*
Other alternatives:
- Effect.catchTags -> like catchTag but can specify N errors
- Effect.catch -> if your error tagged union has key different from _tag
- Effect.catchAll -> handle all errors at once
*/

// --- Defects ---
// Unexpected and unrecoverable errors. This are not part of Effect<R, E, A>
// The Effect runtime keeps track of this errors in structure called Cause that you can inspect
// --- Interruption ---
// Interrupt the execution of a Fiber

Cause.empty // Cause of an Effect that succeeds
Cause.fail // Cause of an Effect that errors with fail (failure)
Cause.die // Cause of an Effect that errors with die (defect)
Cause.interrupt // Cause of an Effect that errors with interrupt

const defect = F.pipe(
    Effect.succeed("Everything fine here"),
    Effect.flatMap(() => Effect.die("Houston, we have a problem")),
)

const catchAllCauseLog = Effect.catchAllCause(defect, (cause) =>
    Effect.logError("Something went wrong", cause),
)

runEffect(catchAllCauseLog)
