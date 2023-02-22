import * as Effect from "@effect/io/Effect"
import * as Context from "@effect/data/Context"
import * as F from "@effect/data/Function"
import { Todo } from "../domain/fp-ts"
import { runEffect } from "../utils/effect"

interface LoadTodo {
    load: () => Effect.Effect<never, string, Todo>
}
const LoadTodo = Context.Tag<LoadTodo>()

interface SaveTodo {
    save: (todo: Todo) => Effect.Effect<never, string, void>
}
const SaveTodo = Context.Tag<SaveTodo>()

const makeMarkAsCompleted = F.pipe(
    Effect.tuple(Effect.service(LoadTodo), Effect.service(SaveTodo)),
    Effect.flatMap(([loadTodo, saveTodo]) =>
        F.pipe(
            // keep new line
            loadTodo.load(),
            Effect.map(markCompleted),
            Effect.flatMap(saveTodo.save),
        ),
    ),
)

// Like fp-ts bindTo+bind api
const doNotation = F.pipe(
    Effect.Do(),
    Effect.bind("loadTodo", () => Effect.service(LoadTodo)),
    Effect.bind("saveTodo", () => Effect.service(SaveTodo)),
    Effect.bind("loaded", ({ loadTodo }) => loadTodo.load()),
    Effect.bindValue("completedTodo", ({ loaded }) => markCompleted(loaded)),
    Effect.flatMap(({ completedTodo, saveTodo }) => saveTodo.save(completedTodo)),
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

    const loaded = yield* $(loadTodo.load())
    const completed = markCompleted(loaded)

    yield* $(saveTodo.save(completed))
})

const markCompleted = (todo: Todo) => ({ ...todo, completed: true })

const effect = F.pipe(
    makeMarkAsCompleted,
    Effect.provideService(LoadTodo, {
        load: () => Effect.succeed({ id: 1, userId: 23, title: "ANY", completed: false }),
    }),
    Effect.provideService(SaveTodo, {
        save: (todo) =>
            Effect.sync(() => {
                console.log("Marked as completed: ", todo)
            }),
    }),
)

runEffect(effect).catch(() => {
    process.exit(1)
})
