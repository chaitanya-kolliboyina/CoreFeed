import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use a proxy to lazily instantiate PrismaClient.
// This prevents it from throwing initialization/validation errors during Next.js build-time.
let prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (!prismaInstance) {
      if (globalForPrisma.prisma) {
        prismaInstance = globalForPrisma.prisma;
      } else {
        const databaseUrl =
          process.env.DATABASE_URL ||
          'postgresql://dummy:dummy@localhost:5432/dummy';
        prismaInstance = new PrismaClient({
          log: ['query'],
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        });
        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prismaInstance;
        }
      }
    }
    return Reflect.get(prismaInstance, prop, receiver);
  },
});

export * from '@prisma/client';
