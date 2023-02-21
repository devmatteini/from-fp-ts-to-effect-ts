import * as F from "@effect/data/Function"
import * as E from "@effect/data/Either"
import * as ROA from "@effect/data/ReadonlyArray"
import * as Effect from "@effect/io/Effect"
import * as S from "@fp-ts/schema"
import fetch from "node-fetch"
import { decode, runEffect } from "../utils/effect"

const traverseE = ROA.traverse(E.Applicative)

const Todo = S.struct({
    userId: S.number,
    id: S.number,
    title: S.string,
    completed: S.boolean,
})
type Todo = S.Infer<typeof Todo>

const getTodos = F.pipe(
    Effect.tryCatchPromise(
        () => fetch("https://jsonplaceholder.typicode.com/users/1/todos"),
        (e) => `Error fetching todos: ${e}`,
    ),
    Effect.flatMap((response) =>
        response.ok
            ? Effect.succeed(response)
            : Effect.fail(`Error fetch with status code ${response.status}`),
    ),
    Effect.flatMap((response) =>
        F.pipe(
            Effect.tryCatchPromise(
                () => response.json(),
                (e) => `Error parsing todos as json: ${e}`,
            ),
            Effect.flatMap((json) =>
                Array.isArray(json)
                    ? Effect.succeed(json)
                    : Effect.fail(`Not an array but ${typeof json}`),
            ),
        ),
    ),
    Effect.map(F.flow(traverseE(decode(Todo)))),
    Effect.absolve,
)

runEffect(getTodos).catch(() => {
    process.exit(1)
})
