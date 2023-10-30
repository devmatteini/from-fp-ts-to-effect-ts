import * as F from "effect/Function"
import * as Effect from "effect/Effect"
import fetch from "node-fetch"
import { Todos } from "../domain/effect"
import { decode, runEffect } from "../utils/effect"

const getTodos = F.pipe(
    Effect.tryPromise({
        try: () => fetch("https://jsonplaceholder.typicode.com/users/1/todos"),
        catch: (e) => `Error fetching todos: ${e}`,
    }),
    Effect.flatMap((response) =>
        response.ok
            ? Effect.succeed(response)
            : Effect.fail(`Error fetch with status code ${response.status}`),
    ),
    Effect.flatMap((response) =>
        Effect.tryPromise({
            try: () => response.json(),
            catch: (e) => `Error parsing todos as json: ${e}`,
        }),
    ),
    Effect.flatMap(F.flow(decode(Todos))),
)

runEffect(getTodos).catch(() => {
    process.exit(1)
})
