# From fp-ts to EffectTS

An exploration of [EffectTS](https://github.com/Effect-TS/) ecosystem from [fp-ts](https://github.com/gcanti/fp-ts) user
prospective.

> [!NOTE]
> This repository is up-to-date with [Effect 3.0](https://effect.website/blog/effect-3.0) stable release

## Usage

Node v18 or higher

```shell
npm install
npm typecheck
```

Run fp-ts v2 module:

```shell
npx tsx src/1-basic/fp-ts.ts
```

Run EffectTS module:

```shell
npx tsx src/1-basic/effect.ts
```

## Modules

1. [Basic](./src/1-basic) - How Effect works
2. [Services](./src/2-services) - Dependency injection
3. [Errors](./src/3-errors) - Errors, Defects and Interruptions
4. [Http](./src/4-http) - From TaskEither to Effect
5. [Parallelism](./src/5-parallelism) - Parallelism of TaskEither/Effect
6. [Retries](./src/6-retries) - Retries of TaskEither/Effect
7. [Schema](./src/7-schema) - From io-ts to Schema

## EffectTS Resources

- https://www.effect.website/docs/introduction (official docs, best place to start!)
- [Production-Grade TypeScript by Johannes Schickling (Effect Days 2024)](https://youtu.be/PxIBWjiv3og?si=BzEcvjtv6idG6D3L)
- https://cosimomatteini.com/blog/build-applications-with-effect
- https://github.com/antoine-coulon/effect-introduction
- https://github.com/pigoz/effect-crashcourse
- [Effect for Beginners by Ethan Niser](https://youtu.be/fTN8BX5qj6s?si=fTQV4gU8Aq9bnvmY)
- [Introduction to Effect, Michael Arnaldi, WorkerConf 2022 Dornbirn](https://www.youtube.com/watch?v=zrNr3JVUc8I)
- [EffectTS Discord](https://discord.gg/RVZKYxWfAJ)

Effect source code:

- https://github.com/Effect-TS/effect
