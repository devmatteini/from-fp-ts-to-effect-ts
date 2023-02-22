import * as Effect from "@effect/io/Effect"
import * as Context from "@effect/data/Context"
import * as F from "@effect/data/Function"
import { Todo } from "../domain/fp-ts"
import { runEffect } from "../utils/effect"
import { User } from "../domain/effect"

interface LoadTodo {
    load: () => Effect.Effect<never, string, Todo>
}
const LoadTodo = Context.Tag<LoadTodo>()

interface SaveTodo {
    save: (todo: Todo) => Effect.Effect<never, string, void>
}
const SaveTodo = Context.Tag<SaveTodo>()

interface LoadUser {
    load: () => Effect.Effect<never, string, User>
}
const LoadUser = Context.Tag<LoadUser>()

const makeMarkAsCompleted = F.pipe(
    Effect.tuple(Effect.service(LoadTodo), Effect.service(SaveTodo), Effect.service(LoadUser)),
    Effect.flatMap(([loadTodo, saveTodo, loadUser]) =>
        F.pipe(
            Effect.struct({
                todo: loadTodo.load(),
                user: loadUser.load(),
            }),
            Effect.bindValue("completedTodo", ({ todo }) => markCompleted(todo)),
            Effect.bind("_", ({ completedTodo }) => saveTodo.save(completedTodo)),
            Effect.map(({ completedTodo, user }) => ({
                todo: completedTodo.title,
                userName: user.name,
            })),
        ),
    ),
)

/*  Like C# LINQ or similar to Rust "?" operator
    Effect uses JavaScript generators.
    
    MDN:
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*
*/
const generators = Effect.gen(function* ($) {
    //                        ~~~~~~~~~
    //                                ^ define generator function
    const loadTodo = yield* $(Effect.service(LoadTodo))
    //               ~~~~~~
    //                   ^ delegate to another generator
    const saveTodo = yield* $(Effect.service(SaveTodo))
    const loadUser = yield* $(Effect.service(LoadUser))

    const { user, todo } = yield* $(
        Effect.struct({
            todo: loadTodo.load(),
            user: loadUser.load(),
        }),
    )

    const completedTodo = markCompleted(todo)
    yield* $(saveTodo.save(completedTodo))

    return {
        todo: completedTodo.title,
        userName: user.name,
    }
})

const markCompleted = (todo: Todo) => ({ ...todo, completed: true })

const effect = F.pipe(
    makeMarkAsCompleted,
    Effect.provideService(LoadTodo, {
        load: () =>
            Effect.succeed({ id: 1, userId: 23, title: "Use more EffectTS", completed: false }),
    }),
    Effect.provideService(SaveTodo, {
        save: (todo) =>
            Effect.sync(() => {
                console.log(`Saved todo #${todo.id}`)
            }),
    }),
    Effect.provideService(LoadUser, {
        load: () => Effect.succeed({ id: 23, name: "Cosimo" }),
    }),
)

runEffect(effect).catch(() => {
    process.exit(1)
})
