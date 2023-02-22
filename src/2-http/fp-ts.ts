import * as F from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import fetch from "node-fetch"
import { Todos } from "../domain/fp-ts"
import { decode, runTaskEither } from "../utils/fp-ts"

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
            TE.tryCatch(
                () => response.json(),
                (e) => `Error parsing todos as json: ${e}`,
            ),
        ),
        TE.chainEitherK(F.flow(decode(Todos))),
    )

runTaskEither(getTodos()).catch((e) => {
    process.exit(1)
})
