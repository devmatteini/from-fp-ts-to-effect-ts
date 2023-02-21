import * as F from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import * as A from "fp-ts/Array"
import * as E from "fp-ts/Either"
import * as t from "io-ts"
import fetch from "node-fetch"
import { decode, runTaskEither } from "../utils/fp-ts"

const traverseE = A.traverse(E.Applicative)

const Todo = t.type(
    {
        userId: t.number,
        id: t.number,
        title: t.string,
        completed: t.boolean,
    },
    "Todo",
)
type Todo = t.TypeOf<typeof Todo>

const getTodos = () =>
    F.pipe(
        TE.tryCatch(
            () => fetch("https://jsonplaceholder.typicode.com/users/1/todos"),
            (e) => `Error fetching todos: ${e}`,
        ),
        TE.chain(
            TE.fromPredicate(
                (response) => response.ok,
                (response) => `Error fetch with status code ${response.status}`,
            ),
        ),
        TE.chain((response) =>
            F.pipe(
                TE.tryCatch(
                    () => response.json(),
                    (e) => `Error parsing todos as json: ${e}`,
                ),
                TE.chainEitherK(
                    E.fromPredicate(
                        (json): json is unknown[] => Array.isArray(json),
                        (x) => `Not an array but ${typeof x}`,
                    ),
                ),
            ),
        ),
        TE.chainEitherK(F.flow(traverseE(decode(Todo)))),
    )

runTaskEither(getTodos()).catch((e) => {
    process.exit(1)
})
