# From fp-ts to EffectTS

An exploration of [EffectTS](https://github.com/Effect-TS/) ecosystem from [fp-ts](https://github.com/gcanti/fp-ts) user
prospective.

## Usage

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
2. [Http](./src/2-http) - From TaskEither to Effect
3. [Services](./src/3-services) - Dependency injection
4. [Parallelism](./src/4-parallelism) - Parallelism with https requests
4. [Errors](./src/5-errors) - Errors, Defects and Interruptions

## EffectTS Resources

- https://github.com/pigoz/effect-crashcourse
- https://github.com/fp-ts/schema
- https://github.com/Effect-TS/data
- https://github.com/Effect-TS/io
- [Introduction to Effect, Michael Arnaldi, WorkerConf 2022 Dornbirn](https://www.youtube.com/watch?v=zrNr3JVUc8I)
- [EffectTS Discord](https://discord.gg/RVZKYxWfAJ)
