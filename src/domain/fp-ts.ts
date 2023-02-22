import * as t from "io-ts"

export const Todo = t.type(
    {
        userId: t.number,
        id: t.number,
        title: t.string,
        completed: t.boolean,
    },
    "Todo",
)
export type Todo = t.TypeOf<typeof Todo>

export const Todos = t.array(Todo, "Todos")
export type Todos = t.TypeOf<typeof Todos>

export const User = t.type(
    {
        id: t.number,
        name: t.string,
    },
    "User",
)
export type User = t.TypeOf<typeof User>
