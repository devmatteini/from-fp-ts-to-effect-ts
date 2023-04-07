import * as S from "@effect/schema/Schema"

export const Todo = S.struct({
    userId: S.number,
    id: S.number,
    title: S.string,
    completed: S.boolean,
})
export type Todo = S.To<typeof Todo>

export const Todos = S.array(Todo)
export type Todos = S.To<typeof Todos>

export const User = S.struct({
    id: S.number,
    name: S.string,
})
export type User = S.To<typeof User>
