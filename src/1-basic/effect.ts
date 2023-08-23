import * as Effect from "@effect/io/Effect"
import * as F from "@effect/data/Function"
import * as E from "@effect/data/Either"

/*
    Effect<R, E, A>
    - R -> computation requirements
 *  - E -> errors in case the computation fails
 *  - A -> type in case the computation succeeds
 */

const succeed = Effect.succeed(7) // Effect.Effect<never, never, number>

const fail = Effect.fail(3) // Effect.Effect<never, number, never>

const sync = Effect.sync(() => {
    console.log("hello from Effect.sync")
    return 4
}) // Effect.Effect<never, never, number>

const failSync = Effect.failSync(() => {
    console.log("hello from Effect.failSync")
    return 4
}) // Effect.Effect<never, number, never>

const eitherFromRandom = (random: number): E.Either<string, number> =>
    random > 0.5 ? E.right(random) : E.left("Number is less than 0.5")

// Either<E, A> and Option<A> are subtype of Effect so can be mixed together!
// https://www.effect.website/docs/data-types/either#interop-with-effect
// https://www.effect.website/docs/data-types/option#interop-with-effect
const x = F.pipe(
    Effect.sync(() => Math.random()), // Effect.Effect<never, never, number>
    Effect.flatMap(eitherFromRandom), // Effect.Effect<never, string, number>
)

// Run Effect
// NOTE: Since you can also run async operations inside Effect, you should always use Effect.runPromise
console.log(Effect.runSync(x))
