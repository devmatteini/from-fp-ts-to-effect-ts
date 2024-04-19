import * as S from "@effect/schema/Schema"

export const Todo = S.Struct({
    userId: S.Number,
    id: S.Number,
    title: S.String,
    completed: S.Boolean,
})
export interface Todo extends S.Schema.Type<typeof Todo> {}

export const Todos = S.Array(Todo)
export interface Todos extends S.Schema.Type<typeof Todos> {}

export const User = S.Struct({
    id: S.Number,
    name: S.String,
})
export interface User extends S.Schema.Type<typeof User> {}
