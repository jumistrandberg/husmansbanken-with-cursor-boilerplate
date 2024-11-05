## Project overview

project-root/
├── prisma/
│ └── schema.prisma
├── src/
│ ├── routes/
│ │ └── recipes.ts
│ └── index.ts
├── package.json
├── tsconfig.json
└── README.md

## API Endpoint

GET /recipes: Fetches all recipes from the database.

### Install dependencies

```bash
npm install
```

## Prisma

```bash
npx prisma migrate dev --name dev
npx prisma generate
npm run seed
```

### Run the app

```bash
npm run dev
```

## Prisma Studio

```bash
npx prisma studio
```

## testing workflow

v2
