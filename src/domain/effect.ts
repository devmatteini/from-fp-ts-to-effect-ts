import * as S from "@fp-ts/schema"

export const Todo = S.struct({
    userId: S.number,
    id: S.number,
    title: S.string,
    completed: S.boolean,
})
export type Todo = S.Infer<typeof Todo>

export const Todos = S.array(Todo)
export type Todos = S.Infer<typeof Todos>

export const User = S.struct({
    id: S.number,
    name: S.string,
})
export type User = S.Infer<typeof User>
