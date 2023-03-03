import * as Effect from "@effect/io/Effect"
import * as F from "@effect/data/Function"
import * as E from "@effect/data/Either"

/*
    Effect<R, E, A>
    - R -> computation requirements
 *  - E -> errors in case the computation fails
 *  - A -> type in case the computation succeeds
 */

const s = Effect.succeed(7) // Effect.Effect<never, never, number>

const f = Effect.fail(3) // Effect.Effect<never, number, never>

const ss = Effect.sync(() => {
    console.log("hello from Effect.sync")
    return 4
}) // Effect.Effect<never, never, number>

const sf = Effect.failSync(() => {
    console.log("hello from Effect.failSync")
    return 4
}) // Effect.Effect<never, number, never>

const eitherFromRandom = (random: number): E.Either<string, number> =>
    random > 0.5 ? E.right(random) : E.left("Number is less than 0.5")

const x = F.pipe(
    Effect.sync(() => Math.random()), // Effect.Effect<never, never, number>
    Effect.map(eitherFromRandom), // Effect.Effect<never, never, Either<string, number>>
    Effect.flatMap(Effect.fromEither), // Effect.Effect<never, string, number>
    // or Effect.absolve
)

// Run Effect (can also run it as Promise)
console.log(Effect.runSync(x))
