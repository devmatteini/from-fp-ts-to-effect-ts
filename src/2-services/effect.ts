import * as Effect from "@effect/io/Effect"
import * as Context from "@effect/data/Context"
import * as F from "@effect/data/Function"
import { Todo } from "../domain/fp-ts"
import { runEffect } from "../utils/effect"
import { User } from "../domain/effect"

interface TodoRepo {
    load: () => Effect.Effect<never, string, Todo>
    save: (todo: Todo) => Effect.Effect<never, string, void>
}
const TodoRepo = Context.Tag<TodoRepo>()

interface UserRepo {
    load: () => Effect.Effect<never, string, User>
}
const UserRepo = Context.Tag<UserRepo>()

const makeMarkAsCompleted = F.pipe(
    Effect.all(Effect.service(TodoRepo), Effect.service(UserRepo)),
    Effect.flatMap(([todoRepo, userRepo]) =>
        F.pipe(
            Effect.allPar({
                todo: todoRepo.load(),
                user: userRepo.load(),
            }),
            Effect.bindValue("completedTodo", ({ todo }) => markCompleted(todo)),
            Effect.bind("_", ({ completedTodo }) => todoRepo.save(completedTodo)),
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
    const todoRepo = yield* $(Effect.service(TodoRepo))
    //               ~~~~~~
    //                   ^ delegate to another generator
    const userRepo = yield* $(Effect.service(UserRepo))

    const { user, todo } = yield* $(
        Effect.allPar({
            todo: todoRepo.load(),
            user: userRepo.load(),
        }),
    )

    const completedTodo = markCompleted(todo)
    yield* $(todoRepo.save(completedTodo))

    return {
        todo: completedTodo.title,
        userName: user.name,
    }
})

const markCompleted = (todo: Todo) => ({ ...todo, completed: true })

const effect = F.pipe(
    makeMarkAsCompleted,
    Effect.provideService(TodoRepo, {
        load: () =>
            Effect.succeed({ id: 1, userId: 23, title: "Use more EffectTS", completed: false }),
        save: (todo) =>
            Effect.sync(() => {
                console.log(`Saved todo #${todo.id}`)
            }),
    }),
    Effect.provideService(UserRepo, {
        load: () => Effect.succeed({ id: 23, name: "Cosimo" }),
    }),
)

runEffect(effect).catch(() => {
    process.exit(1)
})
