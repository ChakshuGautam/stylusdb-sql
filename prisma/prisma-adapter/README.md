# @tidbcloud/prisma-adapter

Prisma driver adapter for [TiDB Cloud Serverless Driver](https://github.com/tidbcloud/serverless-js). For more details, see [TiDB Cloud Serverless Driver Prisma Tutorial
](https://docs.pingcap.com/tidbcloud/serverless-driver-prisma-example).

## Before you start

Before you start, make sure you have:

- A TiDB Cloud account
- Node >= 18
- [Prisma CLI](https://www.prisma.io/docs/concepts/components/prisma-cli) installed

## Install

You will need to install the `@tidbcloud/prisma-adapter` driver adapter and the `@tidbcloud/serverless` serverless driver.

```
npm install @tidbcloud/prisma-adapter @tidbcloud/serverless
```

## DATABASE URL

Set the environment to your .env file in the local environment. You can get connection information on the TiDB Cloud console.

```env
// .env
DATABASE_URL="mysql://username:password@host:4000/database?sslaccept=strict"
```

> NOTE
> 
> The adapter only supports Prisma Client. Prisma migration and introspection still go through the traditional TCP way. If you only need Prisma Client, you can set the DATABASE_URL as the `mysql://username:password@host/database` format which port and ssl parameters are not needed).

## Define Prisma schema

First, you need to create a Prisma schema file called schema.prisma and define the model. Here we use the user as an example.

```prisma
// schema.prisma
generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["driverAdapters"]
}

datasource db {
    provider     = "mysql"
    url          = env("DATABASE_URL")
}

// define model according to your database table
model user {
    id    Int     @id @default(autoincrement())
    email String? @unique(map: "uniq_email") @db.VarChar(255)
    name  String? @db.VarChar(255)
}
```

## Query

Here is an example of query:

```js
// query.js
import { connect } from '@tidbcloud/serverless';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// setup
dotenv.config();
const connectionString = `${process.env.DATABASE_URL}`;

// init prisma client
const connection = connect({ url: connectionString });
const adapter = new PrismaTiDBCloud(connection);
const prisma = new PrismaClient({ adapter });

// insert
const user = await prisma.user.create({
    data: {
        email: 'test@prisma.io',
        name: 'test',
    },
})
console.log(user)

// query after insert
console.log(await prisma.user.findMany())
```

## Transaction

Here is an example of transaction:

```js
// query.js
import { connect } from '@tidbcloud/serverless';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// setup
dotenv.config();
const connectionString = `${process.env.DATABASE_URL}`;

// init prisma client
const connection = connect({ url: connectionString });
const adapter = new PrismaTiDBCloud(connection);
const prisma = new PrismaClient({ adapter });

const createUser1 = prisma.user.create({
  data: {
    email: 'yuhang.shi@pingcap.com',
    name: 'Shi Yuhang',
  },
})

const createUser2 = prisma.user.create({
  data: {
    email: 'yuhang.shi@pingcap.com',
    name: 'Shi Yuhang2',
  },
})

const createUser3 = prisma.user.create({
  data: {
    email: 'yuhang2.shi@pingcap.com',
    name: 'Shi Yuhang2',
  },
})
try {
  await prisma.$transaction([createUser1, createUser2]) // Operations fail together
} catch (e) {
  console.log(e)
  await prisma.$transaction([createUser1, createUser3]) // Operations succeed together
}
```

## Choose a version

| Adapter | Prisma/Prisma Client | serverless driver |
|---------|----------------------|-------------------|
| v5.4.x  | v5.4.x               | ^v0.0.6           |
| v5.5.x  | v5.5.x               | ^v0.0.7           |
| v5.6.x  | v5.6.x               | ^v0.0.7           |
| v5.7.x  | v5.7.x               | ^v0.0.7           |

Here is the step to step guide for how to choose the version:
1. Choose the Prisma version: Choose the one as you need.
2. Choose the adapter version: If you are using Prisma vx.y.z, you should choose the same version of adapter. If there is no adapter version for your Prisma version, you can choose the latest adapter version in vx.y. Open an issue once you find the adapter version is not compatible with Prisma version.
3. Choose the serverless driver version: You can always use the latest version according to the table above.

## Limitations

- [Set isolation level](https://www.prisma.io/docs/concepts/components/prisma-client/transactions#transaction-isolation-level) is not supported yet.
