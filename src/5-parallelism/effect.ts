import * as F from "effect/Function"
import * as ROA from "effect/ReadonlyArray"
import * as Effect from "effect/Effect"
import * as Duration from "effect/Duration"
import { Todo } from "../domain/effect"
import { runEffect } from "../utils/effect"

const getTodos = (url: string) =>
    F.pipe(
        Effect.logInfo(`Fetching ${url}`),
        Effect.flatMap(() => Effect.delay(Duration.seconds(3))(Effect.succeed("delay done"))),
        Effect.map((): Todo[] => [{ id: 999, title: url, completed: false, userId: 999 }]),
    )

const getUsersTodos = F.pipe(
    [
        "https://jsonplaceholder.typicode.com/users/1/todos",
        "https://jsonplaceholder.typicode.com/users/2/todos",
        "https://jsonplaceholder.typicode.com/users/3/todos",
        "https://jsonplaceholder.typicode.com/users/4/todos",
        "https://jsonplaceholder.typicode.com/users/5/todos",
        "https://jsonplaceholder.typicode.com/users/6/todos",
    ],
    ROA.map(getTodos),
    // Effect.allWith is data-last variant of `Effect.all`
    Effect.allWith({ concurrency: "inherit" }),
    // With concurrency "inherit" you can control how much concurrency you want from the top level program
    Effect.map(ROA.flatten),
    Effect.withConcurrency(2),
    // NOTE: If you don't call `withConcurrency`, by default it will be "unbounded"
)

runEffect(getUsersTodos).catch(() => {
    process.exit(1)
})
