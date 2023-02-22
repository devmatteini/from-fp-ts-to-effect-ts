import { TaskEither } from "fp-ts/TaskEither"
import { Todo } from "../domain/effect"
import * as F from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import { runTaskEither } from "../utils/fp-ts"

type Deps = {
    loadTodo: () => TaskEither<string, Todo>
    saveTodo: (todo: Todo) => TaskEither<string, void>
}

const makeMarkAsCompleted = ({ loadTodo, saveTodo }: Deps) =>
    F.pipe(
        loadTodo(),
        TE.map((x) => ({ ...x, completed: true })),
        TE.chain(saveTodo),
    )

const doNotation = ({ loadTodo, saveTodo }: Deps) =>
    F.pipe(
        loadTodo(),
        TE.bindTo("loaded"),
        TE.bind("completedTodo", ({ loaded }) => TE.right({ ...loaded, completed: true })),
        TE.chain(({ completedTodo }) => saveTodo(completedTodo)),
    )

const markAsCompleted = makeMarkAsCompleted({
    loadTodo: () => TE.right({ id: 1, userId: 23, title: "ANY", completed: false }),
    saveTodo: (todo) =>
        TE.rightIO(() => {
            console.log("Marked as completed: ", todo)
        }),
})

runTaskEither(markAsCompleted).catch(() => {
    process.exit(1)
})
