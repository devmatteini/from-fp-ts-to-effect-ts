import * as F from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import * as A from "fp-ts/Array"
import { runTaskEither } from "../utils/fp-ts"
import { batchTraverse } from "fp-ts-contrib/batchTraverse"
import { Todo } from "../domain/fp-ts"
import { delay } from "../utils/promise"

// https://gcanti.github.io/fp-ts-contrib/modules/batchTraverse.ts.html
const arrayTraverseTE = A.traverse(TE.ApplicativePar)
type TraverseTE = typeof arrayTraverseTE
const batchTraverseTE = batchTraverse(TE.Monad)

const batchTE =
    (batchSize: number): TraverseTE =>
    (f) =>
    (array) =>
        F.pipe(array, A.chunksOf(batchSize), (chunks) => batchTraverseTE(chunks, f))

const getTodos = (url: string) => {
    console.log(`Fetching ${url} at ${new Date().toLocaleTimeString()}`)
    return F.pipe(
        TE.tryCatch(
            () => delay(3_000),
            () => `delay error`,
        ),
        TE.map((): Todo[] => [{ id: 999, title: url, completed: false, userId: 999 }]),
    )
}

const batch2 = batchTE(2)

const getUsersTodos = () =>
    F.pipe(
        [
            "https://jsonplaceholder.typicode.com/users/1/todos",
            "https://jsonplaceholder.typicode.com/users/2/todos",
            "https://jsonplaceholder.typicode.com/users/3/todos",
            "https://jsonplaceholder.typicode.com/users/4/todos",
            "https://jsonplaceholder.typicode.com/users/5/todos",
            "https://jsonplaceholder.typicode.com/users/6/todos",
        ],
        batch2(getTodos),
        TE.map(A.flatten),
    )

runTaskEither(getUsersTodos()).catch(() => {
    process.exit(1)
})
