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
