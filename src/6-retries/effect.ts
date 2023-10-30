import * as F from "effect/Function"
import * as Effect from "effect/Effect"
import * as Duration from "effect/Duration"
import * as Schedule from "effect/Schedule"
import { runEffect } from "../utils/effect"

const retryPolicy = F.pipe(
    // keep new line
    Schedule.recurs(4),
    Schedule.compose(Schedule.exponential(Duration.millis(200), 2.0)),
    Schedule.mapEffect((x) => Effect.log(`Retrying in ${Duration.toMillis(x)} milliseconds...`)),
)

const getTodos = F.pipe(
    // keep new line
    Effect.fail("getTodos failed"),
    Effect.delay(Duration.seconds(1)),
)

const withRetry = F.pipe(
    // keep new line
    getTodos,
    Effect.retry(retryPolicy),
)

runEffect(withRetry).catch(() => {
    process.exit(1)
})
