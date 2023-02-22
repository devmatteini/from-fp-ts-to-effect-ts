import * as F from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as S from "@fp-ts/schema"
import fetch from "node-fetch"
import { decode, fromPredicate, runEffect } from "../utils/effect"

const Todo = S.struct({
    userId: S.number,
    id: S.number,
    title: S.string,
    completed: S.boolean,
})
type Todo = S.Infer<typeof Todo>

const Todos = S.array(Todo)

const getTodos = F.pipe(
    Effect.tryCatchPromise(
        () => fetch("https://jsonplaceholder.typicode.com/users/1/todos"),
        (e) => `Error fetching todos: ${e}`,
    ),
    Effect.flatMap(
        fromPredicate(
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
