> [!IMPORTANT]  
> This project is currently abandoned, we might start working on it in the future again. 

Examples for common monorepo tasks:

Install a dependency in a specific app (or package)
```sh
pnpm i foobar -F <app-name>
# pnpm i foobar -F <package-name>
```
-F stands for filter
Dont cd into apps/bot and try to pnpm i there

Install a dependency in the repo root
```sh
pnpm i foobar -w
```

Build the entire repo
```sh
pnpm build:all
```

Generate and apply migrations
```sh
pnpm db:migrate
```

Lint the entire project
```sh
pnpm lint
```
