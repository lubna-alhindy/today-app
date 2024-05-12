import { relationship, select, text, timestamp } from "@keystone-6/core/fields";
import { ListConfig, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { CollectionSchema } from "../../collection";
import { KeystoneContext } from "@keystone-6/core/types";

// const isCollectionAdmin = async ({
//   listKey,
//   session,
//   context,
// }: {
//   listKey: any;
//   session: { data: { id: string; role: string } };
//   context: KeystoneContext<any>;
// }) => {
//   const userId = session.data.id;

//   const userCollection = await context.prisma.userCollection.findFirst({
//     where: {
//       user: {
//         id: userId,
//       },
//       collection: {
//         // id: collectionId,
//       },
//     },
//   });

//   if (!userCollection || userCollection.role !== "admin") {
//     return false;
//   }
//   return true;
// };

export const TaskSchema: ListConfig<any> = list({
  access: {
    operation: {
      query: allowAll,
      create: allowAll,
      // ({ listKey, session, context }) =>
      //   isCollectionAdmin({ listKey, session, context }),
      update: allowAll,
      delete: allowAll,
      //  ({ listKey, session, context }) =>
      //   isCollectionAdmin({ listKey, session, context }),
    },
  },

  hooks: {
    afterOperation: {
      create: async ({ item, inputData, context }) => {
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
      validation: { isRequired: true },
      ui: {
        displayMode: "input",
      },
    }),

    description: text({
      validation: { isRequired: true },
      ui: {
        displayMode: "textarea",
      },
    }),
    deadline: timestamp({
      validation: { isRequired: true },
    }),

    priority: select({
      validation: { isRequired: true },
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
      validation: { isRequired: true },
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
      validation: { isRequired: false },
    }),

    updatedAt: timestamp({
      validation: { isRequired: false },
    }),

    userTasks: relationship({
      ref: "UserTask.task",
      many: true,
    }),

    collection: relationship({
      ref: "Collection.tasks",
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
  ui: {
    description: "Task Page ",
  },
});
