import { relationship, select, text, timestamp } from "@keystone-6/core/fields";
import { ListConfig, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

export const UserCollectionSchema: ListConfig<any> = list({
  access: allowAll,

  hooks: {
    afterOperation: {
      create: async ({ item, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }

        await context.prisma.userCollection.update({
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

        await context.prisma.userCollection.update({
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
    role: select({
      type: "enum",
      defaultValue: "developer",
      validation: { isRequired: true },
      options: [
        { label: "admin", value: "admin" },
        { label: "developer", value: "developer" },
        { label: "watcher", value: "watcher" },
      ],
      ui: { displayMode: "segmented-control" },
    }),

    status: select({
      type: "enum",
      defaultValue: "pending",
      validation: { isRequired: true },
      options: [
        { label: "pending", value: "pending" },
        { label: "accepted", value: "accepted" },
        { label: "rejected", value: "rejected" },
      ],
      ui: { displayMode: "radio" },
    }),

    createdAt: timestamp({
      validation: { isRequired: false },
    }),

    updatedAt: timestamp({
      validation: { isRequired: false },
    }),

    user: relationship({
      ref: "User.userCollections",
      many: false,
    }),

    collection: relationship({
      ref: "Collection.userCollections",
      many: false,
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
});
