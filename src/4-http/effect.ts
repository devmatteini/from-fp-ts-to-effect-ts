import * as F from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import fetch from "node-fetch"
import { Todos } from "../domain/effect"
import { decode, runEffect } from "../utils/effect"
import * as E from "@effect/data/Either"

const getTodos = F.pipe(
    Effect.tryCatchPromise(
        () => fetch("https://jsonplaceholder.typicode.com/users/1/todos"),
        (e) => `Error fetching todos: ${e}`,
    ),
    Effect.flatMap(
        E.liftPredicate(
            (response) => response.ok,
            (response) => `Error fetch with status code ${response.status}`,
        ),
    ),
    Effect.flatMap((response) =>
        Effect.tryCatchPromise(
            () => response.json(),
            (e) => `Error parsing todos as json: ${e}`,
        ),
    ),
    Effect.map(F.flow(decode(Todos))),
    Effect.absolve,
)

runEffect(getTodos).catch(() => {
    process.exit(1)
})
