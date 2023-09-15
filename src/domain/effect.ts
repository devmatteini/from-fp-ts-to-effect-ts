import * as S from "@effect/schema/Schema"

export const Todo = S.struct({
    userId: S.number,
    id: S.number,
    title: S.string,
    completed: S.boolean,
})
export interface Todo extends S.Schema.To<typeof Todo> {}

export const Todos = S.array(Todo)
export interface Todos extends S.Schema.To<typeof Todos> {}

export const User = S.struct({
    id: S.number,
    name: S.string,
})
export interface User extends S.Schema.To<typeof User> {}
