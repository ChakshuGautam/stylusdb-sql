# @stylusdb-sql/prisma-adapter

Prisma driver adapter for [StylusDB-SQL](https://github.com/ChakshuGautam/stylusdb-sql).

## Before you start

Before you start, make sure you have:

- Node >= 18
- [Prisma CLI](https://www.prisma.io/docs/concepts/components/prisma-cli) installed

## Install

You will need to install the `stylusdb-sql-prisma-adapter` driver adapter and the `stylus-db-prisma-client` which is currently unpackaged and can be found [here](./../../examples/prisma/client.js).

```
npm install stylusdb-sql-prisma-adapter
```

## DATABASE URL

Set the environment to your .env file in the local environment. You can get connection information on the TiDB Cloud console.

```env
// .env
DATABASE_URL="localhost:5432"
```

> NOTE
> 
> The adapter only supports Prisma Client. How to make it work with the Prisma Migrate CLI is still under investigation.

## Define Prisma schema

First, you need to create a Prisma schema file called schema.prisma and define the model. Here we use the user as an example.

```prisma
// schema.prisma
generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["driverAdapters"]
}

datasource db {
    provider = "postgresql"
    url      = "postgresql://127.0.0.1:5432/database?sslaccept=strict"
}

model Student {
    id         Int          @id @default(autoincrement())
    name       String
    age        String
    enrollment Enrollment[]
}

model Enrollment {
    id        Int     @id @default(autoincrement())
    studentId Int
    course    String
    student   Student @relation(fields: [studentId], references: [id])
}
```

## Query

Here is an example of query:

```js
// query.js
import { PrismaClient } from '@prisma/client';
import { PrismaStylusDBSQL } from 'stylusdb-sql-prisma-adapter';
import net from 'net';
import dotenv from 'dotenv';

// setup
dotenv.config();
const connectionString = `${process.env.DATABASE_URL}`;

const client = new Client(connectionString)
const adapter = new PrismaStylusDBSQL(client, {})
const prisma = new PrismaClient({ adapter })

async function main() {
    await client.connect();
    const rawQueryData = await prisma.$queryRaw`SELECT id from student`;
    console.log({ rawQueryData });
    const student = await prisma.student.create({
        data: {
            name: 'test',
            age: '28',
        },
    }).catch((e) => {
        console.log(e)
    });
    console.log(student);

    const students = await prisma.student.findMany();
    console.log(students);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

```

## Transaction
> Coming Soon

## Limitations

- Heavily under development.
