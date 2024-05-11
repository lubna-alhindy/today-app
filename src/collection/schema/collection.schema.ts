import { relationship, text, timestamp } from "@keystone-6/core/fields";
import { ListConfig, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

export const CollectionSchema: ListConfig<any> = list({
  access: allowAll,

  hooks: {
    afterOperation: {
      create: async ({ item, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }

        await context.prisma.collection.update({
          where: {
            id: item.id,
          },
          data: {
            createdAt: new Date(),
            createdBy: {
              connect: {
                id: userId,
              },
            },
            updatedAt: new Date(),
            updatedBy: {
              connect: {
                id: userId,
              },
            },
          },
        });
      },

      update: async ({ item, inputData, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }
        if (inputData.updatedAt) {
          return;
        }

        await context.prisma.collection.update({
          where: {
            id: item.id,
          },
          data: {
            updatedAt: new Date(),
            updatedBy: {
              connect: {
                id: userId,
              },
            },
          },
        });
      },
    },
  },

  fields: {
    name: text({
      validation: { isRequired: true },
    }),

    createdAt: timestamp({
      validation: { isRequired: false },
    }),

    updatedAt: timestamp({
      validation: { isRequired: false },
    }),

    userCollections: relationship({
      ref: "UserCollection.collection",
      many: true,
    }),

    tasks: relationship({
      ref: "Task.collection",
      many: true,
    }),

    createdBy: relationship({
      ref: "User",
      many: false,
    }),

    updatedBy: relationship({
      ref: "User",
      many: false,
    }),
  },

  ui: {
    labelField: "name",
    description: "Collection Page ",
    listView: {
      initialColumns: ["name", "createdAt", "updatedAt", "createdBy" ,'updatedBy'],
    },
  },
});
