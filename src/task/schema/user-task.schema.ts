import { relationship, timestamp } from "@keystone-6/core/fields";
import { ListConfig, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

export const UserTaskSchema: ListConfig<any> = list({
  access: allowAll,

  hooks: {
    afterOperation: {
      create: async ({ item, inputData, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }

        await context.prisma.userTask.update({
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
          },
        });
      },
    },
  },

  fields: {
    createdAt: timestamp({
      validation: { isRequired: false },
    }),

    user: relationship({
      ref: "User.userTasks",
      many: false,
    }),

    task: relationship({
      ref: "Task.userTasks",
      many: false,
    }),

    createdBy: relationship({
      ref: "User",
      many: false,
    }),
  },
});
