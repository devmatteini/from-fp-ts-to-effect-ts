import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as E from "effect/Either"

/*
    Effect<A, E, R>
    - A -> type in case the computation succeeds
    - E -> errors in case the computation fails
    - R -> computation requirements
 */

const succeed = Effect.succeed(7) // Effect.Effect<number>

const fail = Effect.fail(3) // Effect.Effect<never, number>

const sync = Effect.sync(() => {
    console.log("hello from Effect.sync")
    return 4
}) // Effect.Effect<number>

const failSync = Effect.failSync(() => {
    console.log("hello from Effect.failSync")
    return 4
}) // Effect.Effect<never, number>

const eitherFromRandom = (random: number): E.Either<number, string> =>
    random > 0.5 ? E.right(random) : E.left("Number is less than 0.5")

// Either<E, A> and Option<A> are subtype of Effect so can be mixed together!
// https://www.effect.website/docs/data-types/either#interop-with-effect
// https://www.effect.website/docs/data-types/option#interop-with-effect
const x = F.pipe(
    Effect.sync(() => Math.random()), // Effect.Effect<number>
    Effect.flatMap(eitherFromRandom), // Effect.Effect<number, string>
)

// Run Effect
// NOTE: Since you can also run async operations inside Effect, you should always use Effect.runPromise
console.log(Effect.runSync(x))
