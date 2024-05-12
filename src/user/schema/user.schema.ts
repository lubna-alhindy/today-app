import {
  text,
  select,
  password,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { ListConfig, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

import { passwordRegex } from "../../_shared";

const isAdmin = ({ session }: { session: { data: { role: string } } }) =>
  Boolean(session?.data?.role === "admin");

export const UserSchema: ListConfig<any> = list({
  access: {
    operation: {
      query: allowAll,
      create: ({ session }) => isAdmin({ session }),
      update: allowAll,
      delete: ({ session }) => isAdmin({ session }),
    },
  },

  hooks: {
    afterOperation: {
      create: async ({ item, context }) => {
        await context.prisma.user.update({
          where: {
            id: item.id,
          },
          data: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      },

      update: async ({ item, inputData, context }) => {
        if (inputData.updatedAt) {
          return;
        }

        await context.prisma.user.update({
          where: {
            id: item.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });
      },
    },
  },

  fields: {
    role: select({
      type: "enum",
      defaultValue: "user",
      validation: { isRequired: true },
      options: [
        { label: "admin", value: "admin" },
        { label: "user", value: "user" },
      ],
      ui:{
        displayMode: 'radio'
      }
    }),

    name: text({
      validation: { isRequired: true },
      ui: {
        displayMode: "input",
      },
    }),

    email: text({
      validation: { isRequired: true },
      isIndexed: "unique",
      ui: {
        displayMode: "input",
      },
    }),

    password: password({
      validation: {
        isRequired: true,
        length: {
          min: 8,
          max: 64,
        },
        match: {
          regex: passwordRegex,
          explanation:
            "password should be between [8 64] chars, and should contain numbers, (small/capital) letters",
        },
      },
    }),

    createdAt: timestamp({
      validation: { isRequired: false },
    }),

    updatedAt: timestamp({
      validation: { isRequired: false },
    }),

    userCollections: relationship({
      ref: "UserCollection.user",
      many: true,
    }),

    userTasks: relationship({
      ref: "UserTask.user",
      many: true,
    }),
  },
  ui: {
    description: "User Page ",
  },
});
