import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
import * as F from "effect/Function"

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

const load = (id: string): Effect.Effect<Repository, never, MyObject> =>
    F.pipe(
        Repository,
        Effect.flatMap(() =>
            F.pipe(
                Effect.logInfo(`Loaded object ${id}`),
                Effect.zipRight(Effect.succeed({ id, version: 1 })),
            ),
        ),
    )

const save = (obj: MyObject): Effect.Effect<Repository, never, void> =>
    F.pipe(
        Repository,
        Effect.flatMap(() => Effect.logInfo(`Saved object ${obj.id} v${obj.version}`)),
    )

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
        Effect.context<Repository>(),
        Effect.map(
            (context): HandlerDeps => ({
                load: (id) => Effect.provide(load(id), context),
                save: (obj) => Effect.provide(save(obj), context),
            }),
        ),
    ),
)

// main.ts
const main = () =>
    F.pipe(
        handler("1234"),
        Effect.tap(() => Effect.logInfo("done")),
        Effect.provide(Layer.provide(RepositoryLive, HandlerLive)),
        Effect.runPromise,
    )

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
