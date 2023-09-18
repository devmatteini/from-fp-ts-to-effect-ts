import * as Effect from "@effect/io/Effect"
import * as Context from "@effect/data/Context"
import * as Layer from "@effect/io/Layer"
import * as F from "@effect/data/Function"

type MyObject = {
    id: string
    version: number
}

// repository.ts
type Repository = { client: any }
const Repository = Context.Tag<Repository>()

const RepositoryLive: Layer.Layer<never, never, Repository> = Layer.effect(
    Repository,
    F.pipe(
        Effect.logInfo("Connecting to repository..."),
        Effect.flatMap(() => Effect.sleep("500 millis")),
        Effect.flatMap(() => Effect.succeed({ client: {} })),
    ),
)

const load = (_: Repository, id: string): Effect.Effect<never, never, MyObject> =>
    F.pipe(
        Effect.logInfo(`Loaded object ${id}`),
        Effect.zipRight(Effect.succeed({ id, version: 1 })),
    )

const save = (_: Repository, obj: MyObject): Effect.Effect<never, never, void> =>
    Effect.logInfo(`Saved object ${obj.id} v${obj.version}`)

// handler.ts
type HandlerDeps = {
    load: (id: string) => Effect.Effect<never, never, MyObject>
    save: (obj: MyObject) => Effect.Effect<never, never, void>
}

const HandlerDeps = Context.Tag<HandlerDeps>()

const handler = (id: string): Effect.Effect<HandlerDeps, never, void> =>
    F.pipe(
        HandlerDeps,
        Effect.flatMap(({ load, save }) =>
            F.pipe(
                load(id),
                Effect.map((obj) => ({ ...obj, version: obj.version + 1 })),
                Effect.flatMap(save),
            ),
        ),
    )

const HandlerLive = Layer.effect(
    HandlerDeps,
    F.pipe(
        Repository,
        Effect.map(
            (repository): HandlerDeps => ({
                load: (id) => load(repository, id),
                save: (obj) => save(repository, obj),
            }),
        ),
    ),
)

// main.ts
const main = () =>
    F.pipe(
        handler("1234"),
        Effect.tap(() => Effect.logInfo("done")),
        Effect.provideLayer(Layer.provide(RepositoryLive, HandlerLive)),
        Effect.runPromise,
    )

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
