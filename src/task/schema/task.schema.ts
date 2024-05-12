import { relationship, select, text, timestamp } from "@keystone-6/core/fields";
import { ListConfig, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import {
  FieldReadItemAccessArgs,
  KeystoneContext,
} from "@keystone-6/core/types";

const canRead = async (args: FieldReadItemAccessArgs<any>) => {
  const userCollection = await args.context.prisma.userCollection.findFirst({
    where: {
      user: {
        id: args.context.session?.data?.id,
      },
      collection: {
        id: args.item.collectionId,
      },
    },
  });
  if (!userCollection) {
    return false;
  }
  return true;
};

const canWrite = async (
  collectionId: string,
  userId: string,
  context: KeystoneContext<any>
) => {
  const userCollection = await context.prisma.userCollection.findFirst({
    where: {
      user: {
        id: userId,
      },
      collection: {
        id: collectionId,
      },
    },
  });
  if (!userCollection || userCollection.role === "watcher") {
    return false;
  }
  return true;
};

export const TaskSchema: ListConfig<any> = list({
  access: allowAll,

  hooks: {
    resolveInput: async ({ inputData, context }) => {
      const collectionId = inputData.collection.connect.id;
      const userId = context.session?.data?.id;
      if (!(await canWrite(collectionId, userId, context))) {
        throw new Error("Unauthorized");
      }
      return inputData;
    },

    beforeOperation: {
      delete: async ({ item, context }) => {
        const collectionId = item.collectionId;
        const userId = context.session?.data?.id;
        if (!(await canWrite(collectionId, userId, context))) {
          throw new Error("Unauthorized");
        }
      },
    },

    afterOperation: {
      create: async ({ item, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }

        await context.prisma.task.update({
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

        await context.prisma.task.update({
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
    title: text({
      access: { read: canRead },
      validation: { isRequired: true },
      ui: {
        displayMode: "input",
      },
    }),

    description: text({
      access: { read: canRead },
      validation: { isRequired: true },
      ui: {
        displayMode: "textarea",
      },
    }),
    deadline: timestamp({
      access: { read: canRead },
      validation: { isRequired: true },
    }),

    priority: select({
      access: { read: canRead },
      type: "enum",
      defaultValue: "medium",
      options: [
        { label: "low", value: "low" },
        { label: "medium", value: "medium" },
        { label: "high", value: "high" },
      ],
      ui: { displayMode: "segmented-control" },
    }),

    status: select({
      access: { read: canRead },
      type: "enum",
      defaultValue: "todo",
      options: [
        { label: "todo", value: "todo" },
        { label: "inprogress", value: "inprogress" },
        { label: "complete", value: "complete" },
      ],
      ui: { displayMode: "segmented-control" },
    }),

    createdAt: timestamp({
      access: { read: canRead },
      validation: { isRequired: false },
    }),

    updatedAt: timestamp({
      access: { read: canRead },
      validation: { isRequired: false },
    }),

    userTasks: relationship({
      access: { read: canRead },
      ref: "UserTask.task",
      many: true,
    }),

    collection: relationship({
      access: { read: canRead },
      ref: "Collection.tasks",
      many: false,
    }),

    createdBy: relationship({
      access: { read: canRead },
      ref: "User",
      many: false,
    }),

    updatedBy: relationship({
      access: { read: canRead },
      ref: "User",
      many: false,
    }),
  },
  ui: {
    description: "Task Page ",
  },
});
