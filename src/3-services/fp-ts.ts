import { TaskEither } from "fp-ts/TaskEither"
import { Todo } from "../domain/effect"
import * as F from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import { runTaskEither } from "../utils/fp-ts"
import { User } from "../domain/fp-ts"
import { sequenceS } from "fp-ts/Apply"

const sequenceTE = sequenceS(TE.ApplyPar)

type Deps = {
    loadUser: () => TaskEither<string, User>
    loadTodo: () => TaskEither<string, Todo>
    saveTodo: (todo: Todo) => TaskEither<string, void>
}

const makeMarkAsCompleted = ({ loadTodo, saveTodo, loadUser }: Deps) =>
    F.pipe(
        sequenceTE({
            todo: loadTodo(),
            user: loadUser(),
        }),
        TE.bind("completedTodo", ({ todo }) => TE.right({ ...todo, completed: true })),
        TE.bind("_", ({ completedTodo }) => saveTodo(completedTodo)),
        TE.map(({ completedTodo, user }) => ({ todo: completedTodo.title, userName: user.name })),
    )

const markAsCompleted = makeMarkAsCompleted({
    loadTodo: () => TE.right({ id: 1, userId: 23, title: "Try EffectTS", completed: false }),
    saveTodo: (todo) =>
        TE.rightIO(() => {
            console.log(`Saved todo #${todo.id}`)
        }),
    loadUser: () => TE.right({ id: 23, name: "Cosimo" }),
})

runTaskEither(markAsCompleted).catch(() => {
    process.exit(1)
})
