import * as F from "@effect/data/Function"
import * as ROA from "@effect/data/ReadonlyArray"
import * as Effect from "@effect/io/Effect"
import * as Duration from "@effect/data/Duration"
import { Todo } from "../domain/effect"
import { runEffect } from "../utils/effect"

const getTodos = (url: string) =>
    F.pipe(
        Effect.sync(() => {
            console.log(`Fetching ${url} at ${new Date().toLocaleTimeString()}`)
        }),
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
    Effect.collectAllPar,
    Effect.withParallelism(2),
    Effect.map(F.flow(ROA.fromIterable, ROA.flatten)),
)

runEffect(getUsersTodos).catch(() => {
    process.exit(1)
})
