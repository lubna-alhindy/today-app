"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default
});
module.exports = __toCommonJS(keystone_exports);
var import_core7 = require("@keystone-6/core");

// src/_extension/extend-graphql-schema.ts
var import_core = require("@keystone-6/core");
var extendGraphqlSchema = import_core.graphql.extend((base) => {
  return {
    mutation: {
      joinCollection: import_core.graphql.field({
        type: base.object("UserCollection"),
        args: {
          collectionId: import_core.graphql.arg({ type: import_core.graphql.nonNull(import_core.graphql.ID) })
        },
        async resolve(source, { collectionId }, context) {
          const userId = context.session?.data?.id;
          if (!userId) {
            throw new Error("User is not authenticated");
          }
          const [isExist] = await context.prisma.userCollection.findMany({
            where: {
              user: {
                id: userId
              },
              collection: {
                id: collectionId
              }
            }
          });
          if (isExist) {
            throw new Error("User is exist in this collection");
          }
          return await context.prisma.userCollection.create({
            data: {
              collection: {
                connect: {
                  id: collectionId
                }
              },
              user: {
                connect: {
                  id: userId
                }
              },
              createdBy: {
                connect: {
                  id: userId
                }
              },
              updatedBy: {
                connect: {
                  id: userId
                }
              }
            }
          });
        }
      }),
      approveJoinCollectionRequest: import_core.graphql.field({
        type: base.object("UserCollection"),
        args: {
          userCollectionId: import_core.graphql.arg({ type: import_core.graphql.nonNull(import_core.graphql.ID) })
        },
        async resolve(source, { userCollectionId }, context) {
          const userId = context.session?.data?.id;
          if (!userId) {
            throw new Error("User is not authenticated");
          }
          const userCollection = await context.prisma.userCollection.findUnique(
            {
              where: {
                id: userCollectionId
              }
            }
          );
          if (!userCollection) {
            throw new Error("Request is not found");
          }
          if (userCollection.status !== "pending") {
            throw new Error("Request is not pending");
          }
          const isCollectionAdmin = await context.prisma.userCollection.findFirst({
            where: {
              user: {
                id: userId
              },
              collection: {
                userCollections: {
                  some: {
                    id: userCollection.id
                  }
                }
              }
            }
          });
          if (!isCollectionAdmin || isCollectionAdmin.role !== "admin") {
            throw new Error("You are not the admin of this collection");
          }
          return await context.prisma.userCollection.update({
            where: {
              id: userCollection.id
            },
            data: {
              status: "accepted"
            }
          });
        }
      })
    }
  };
});

// src/_extension/extend-express-app.ts
function extendExpressApp(app, commonContext) {
  app.get("/rest/check-health", async (req, res) => {
    return res.json({
      message: "Server is up!"
    });
  });
}

// src/_shared/envs/envs.const.ts
var import_dotenv = require("dotenv");
(0, import_dotenv.config)();
var Envs = Object.freeze({
  // Auth
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL || "",
  // NodeMailer
  MAILER_EMAIL: process.env.MAILER_EMAIL || "",
  MAILER_PASSWORD: process.env.MAILER_PASSWORD || ""
});

// src/_shared/config/database.config.ts
var databaseConfig = {
  provider: "postgresql",
  url: Envs.DATABASE_URL,
  shadowDatabaseUrl: Envs.SHADOW_DATABASE_URL
};

// src/_shared/regex/password.regex.ts
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// auth.ts
var import_session = require("@keystone-6/core/session");
var import_auth = require("@keystone-6/auth");
var nodemailer = require("nodemailer");
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  sessionData: "id email role",
  initFirstItem: {
    fields: ["name", "email", "password"]
  },
  magicAuthLink: {
    tokensValidForMins: 60,
    sendToken: async ({ itemId, identity, token, context }) => {
      console.log({ itemId, identity, token, context });
      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: Envs.MAILER_EMAIL,
          pass: Envs.MAILER_PASSWORD
        }
      });
      const info = await transporter.sendMail({
        from: "<no-reply> | today@misraj.net",
        to: identity,
        subject: "Password Reset Link",
        text: `Here is your password reset link: http://localhost:3000/auth/reset-password?token=${token}`
      });
      console.log("Message sent: %s", info.messageId);
    }
  },
  passwordResetLink: {
    tokensValidForMins: 60,
    sendToken: async ({ itemId, identity, token, context }) => {
      console.log({ itemId, identity, token, context });
      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: Envs.MAILER_EMAIL,
          pass: Envs.MAILER_PASSWORD
        }
      });
      const info = await transporter.sendMail({
        from: "<no-reply> | today@misraj.net",
        to: identity,
        subject: "Password Reset Link",
        text: `Here is your password reset link: http://localhost:3000/auth/reset-password?token=${token}`
      });
      console.log("Message sent: %s", info.messageId);
    }
  }
});
var session = (0, import_session.statelessSessions)({
  maxAge: 60 * 60 * 24 * 30,
  secret: Envs.SESSION_SECRET
});

// src/collection/schema/collection.schema.ts
var import_fields = require("@keystone-6/core/fields");
var import_core2 = require("@keystone-6/core");
var import_access = require("@keystone-6/core/access");
var CollectionSchema = (0, import_core2.list)({
  access: import_access.allowAll,
  hooks: {
    afterOperation: {
      create: async ({ item, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }
        await context.prisma.collection.update({
          where: {
            id: item.id
          },
          data: {
            createdAt: /* @__PURE__ */ new Date(),
            createdBy: {
              connect: {
                id: userId
              }
            },
            updatedAt: /* @__PURE__ */ new Date(),
            updatedBy: {
              connect: {
                id: userId
              }
            }
          }
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
            id: item.id
          },
          data: {
            updatedAt: /* @__PURE__ */ new Date(),
            updatedBy: {
              connect: {
                id: userId
              }
            }
          }
        });
      }
    }
  },
  fields: {
    name: (0, import_fields.text)({
      validation: { isRequired: true }
    }),
    createdAt: (0, import_fields.timestamp)({
      validation: { isRequired: false }
    }),
    updatedAt: (0, import_fields.timestamp)({
      validation: { isRequired: false }
    }),
    userCollections: (0, import_fields.relationship)({
      ref: "UserCollection.collection",
      many: true
    }),
    tasks: (0, import_fields.relationship)({
      ref: "Task.collection",
      many: true
    }),
    createdBy: (0, import_fields.relationship)({
      ref: "User",
      many: false
    }),
    updatedBy: (0, import_fields.relationship)({
      ref: "User",
      many: false
    })
  },
  ui: {
    description: "Collection Page ",
    listView: {
      initialColumns: [
        "name",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy"
      ]
    }
  }
});

// src/collection/schema/user-collection.schema.ts
var import_fields2 = require("@keystone-6/core/fields");
var import_core3 = require("@keystone-6/core");
var import_access2 = require("@keystone-6/core/access");
var UserCollectionSchema = (0, import_core3.list)({
  access: import_access2.allowAll,
  hooks: {
    afterOperation: {
      create: async ({ item, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }
        await context.prisma.userCollection.update({
          where: {
            id: item.id
          },
          data: {
            createdAt: /* @__PURE__ */ new Date(),
            createdBy: {
              connect: {
                id: userId
              }
            },
            updatedAt: /* @__PURE__ */ new Date(),
            updatedBy: {
              connect: {
                id: userId
              }
            }
          }
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
            id: item.id
          },
          data: {
            updatedAt: /* @__PURE__ */ new Date(),
            updatedBy: {
              connect: {
                id: userId
              }
            }
          }
        });
      }
    }
  },
  fields: {
    role: (0, import_fields2.select)({
      type: "enum",
      defaultValue: "developer",
      validation: { isRequired: true },
      options: [
        { label: "admin", value: "admin" },
        { label: "developer", value: "developer" },
        { label: "watcher", value: "watcher" }
      ],
      ui: { displayMode: "segmented-control" }
    }),
    status: (0, import_fields2.select)({
      type: "enum",
      defaultValue: "pending",
      validation: { isRequired: true },
      options: [
        { label: "pending", value: "pending" },
        { label: "accepted", value: "accepted" },
        { label: "rejected", value: "rejected" }
      ],
      ui: { displayMode: "radio" }
    }),
    createdAt: (0, import_fields2.timestamp)({
      validation: { isRequired: false }
    }),
    updatedAt: (0, import_fields2.timestamp)({
      validation: { isRequired: false }
    }),
    user: (0, import_fields2.relationship)({
      ref: "User.userCollections",
      many: false
    }),
    collection: (0, import_fields2.relationship)({
      ref: "Collection.userCollections",
      many: false
    }),
    createdBy: (0, import_fields2.relationship)({
      ref: "User",
      many: false
    }),
    updatedBy: (0, import_fields2.relationship)({
      ref: "User",
      many: false
    })
  }
});

// src/task/schema/user-task.schema.ts
var import_fields3 = require("@keystone-6/core/fields");
var import_core4 = require("@keystone-6/core");
var import_access3 = require("@keystone-6/core/access");
var UserTaskSchema = (0, import_core4.list)({
  access: import_access3.allowAll,
  hooks: {
    afterOperation: {
      create: async ({ item, inputData, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }
        await context.prisma.userTask.update({
          where: {
            id: item.id
          },
          data: {
            createdAt: /* @__PURE__ */ new Date(),
            createdBy: {
              connect: {
                id: userId
              }
            }
          }
        });
      }
    }
  },
  fields: {
    createdAt: (0, import_fields3.timestamp)({
      validation: { isRequired: false }
    }),
    user: (0, import_fields3.relationship)({
      ref: "User.userTasks",
      many: false
    }),
    task: (0, import_fields3.relationship)({
      ref: "Task.userTasks",
      many: false
    }),
    createdBy: (0, import_fields3.relationship)({
      ref: "User",
      many: false
    })
  }
});

// src/task/schema/task.schema.ts
var import_fields4 = require("@keystone-6/core/fields");
var import_core5 = require("@keystone-6/core");
var import_access4 = require("@keystone-6/core/access");
var canRead = async (args) => {
  const userCollection = await args.context.prisma.userCollection.findFirst({
    where: {
      user: {
        id: args.context.session?.data?.id
      },
      collection: {
        id: args.item.collectionId
      }
    }
  });
  if (!userCollection) {
    return false;
  }
  return true;
};
var canWrite = async (collectionId, userId, context) => {
  const userCollection = await context.prisma.userCollection.findFirst({
    where: {
      user: {
        id: userId
      },
      collection: {
        id: collectionId
      }
    }
  });
  if (!userCollection || userCollection.role === "watcher") {
    return false;
  }
  return true;
};
var TaskSchema = (0, import_core5.list)({
  access: import_access4.allowAll,
  hooks: {
    resolveInput: async ({ inputData, context }) => {
      const collectionId = inputData.collection.connect.id;
      const userId = context.session?.data?.id;
      if (!await canWrite(collectionId, userId, context)) {
        throw new Error("Unauthorized");
      }
      return inputData;
    },
    beforeOperation: {
      delete: async ({ item, context }) => {
        const collectionId = item.collectionId;
        const userId = context.session?.data?.id;
        if (!await canWrite(collectionId, userId, context)) {
          throw new Error("Unauthorized");
        }
      }
    },
    afterOperation: {
      create: async ({ item, context }) => {
        const userId = context.session?.data?.id;
        if (!userId) {
          throw new Error("You are not authenticated");
        }
        await context.prisma.task.update({
          where: {
            id: item.id
          },
          data: {
            createdAt: /* @__PURE__ */ new Date(),
            createdBy: {
              connect: {
                id: userId
              }
            },
            updatedAt: /* @__PURE__ */ new Date(),
            updatedBy: {
              connect: {
                id: userId
              }
            }
          }
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
            id: item.id
          },
          data: {
            updatedAt: /* @__PURE__ */ new Date(),
            updatedBy: {
              connect: {
                id: userId
              }
            }
          }
        });
      }
    }
  },
  fields: {
    title: (0, import_fields4.text)({
      access: { read: canRead },
      validation: { isRequired: true },
      ui: {
        displayMode: "input"
      }
    }),
    description: (0, import_fields4.text)({
      access: { read: canRead },
      validation: { isRequired: true },
      ui: {
        displayMode: "textarea"
      }
    }),
    deadline: (0, import_fields4.timestamp)({
      access: { read: canRead },
      validation: { isRequired: true }
    }),
    priority: (0, import_fields4.select)({
      access: { read: canRead },
      type: "enum",
      defaultValue: "medium",
      options: [
        { label: "low", value: "low" },
        { label: "medium", value: "medium" },
        { label: "high", value: "high" }
      ],
      ui: { displayMode: "segmented-control" }
    }),
    status: (0, import_fields4.select)({
      access: { read: canRead },
      type: "enum",
      defaultValue: "todo",
      options: [
        { label: "todo", value: "todo" },
        { label: "inprogress", value: "inprogress" },
        { label: "complete", value: "complete" }
      ],
      ui: { displayMode: "segmented-control" }
    }),
    createdAt: (0, import_fields4.timestamp)({
      access: { read: canRead },
      validation: { isRequired: false }
    }),
    updatedAt: (0, import_fields4.timestamp)({
      access: { read: canRead },
      validation: { isRequired: false }
    }),
    userTasks: (0, import_fields4.relationship)({
      access: { read: canRead },
      ref: "UserTask.task",
      many: true
    }),
    collection: (0, import_fields4.relationship)({
      access: { read: canRead },
      ref: "Collection.tasks",
      many: false
    }),
    createdBy: (0, import_fields4.relationship)({
      access: { read: canRead },
      ref: "User",
      many: false
    }),
    updatedBy: (0, import_fields4.relationship)({
      access: { read: canRead },
      ref: "User",
      many: false
    })
  },
  ui: {
    description: "Task Page "
  }
});

// src/user/schema/user.schema.ts
var import_fields5 = require("@keystone-6/core/fields");
var import_core6 = require("@keystone-6/core");
var import_access5 = require("@keystone-6/core/access");
var isAdmin = ({ session: session2 }) => Boolean(session2?.data?.role === "admin");
var UserSchema = (0, import_core6.list)({
  access: {
    operation: {
      query: import_access5.allowAll,
      create: ({ session: session2 }) => isAdmin({ session: session2 }),
      update: import_access5.allowAll,
      delete: ({ session: session2 }) => isAdmin({ session: session2 })
    }
  },
  hooks: {
    afterOperation: {
      create: async ({ item, context }) => {
        await context.prisma.user.update({
          where: {
            id: item.id
          },
          data: {
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
      },
      update: async ({ item, inputData, context }) => {
        if (inputData.updatedAt) {
          return;
        }
        await context.prisma.user.update({
          where: {
            id: item.id
          },
          data: {
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
      }
    }
  },
  fields: {
    role: (0, import_fields5.select)({
      access: {
        update: (args) => isAdmin({ session: args.context.session })
      },
      type: "enum",
      defaultValue: "user",
      validation: { isRequired: true },
      options: [
        { label: "admin", value: "admin" },
        { label: "user", value: "user" }
      ],
      ui: {
        displayMode: "radio"
      }
    }),
    name: (0, import_fields5.text)({
      validation: { isRequired: true },
      ui: {
        displayMode: "input"
      }
    }),
    email: (0, import_fields5.text)({
      validation: { isRequired: true },
      isIndexed: "unique",
      ui: {
        displayMode: "input"
      }
    }),
    password: (0, import_fields5.password)({
      validation: {
        isRequired: true,
        length: {
          min: 8,
          max: 64
        },
        match: {
          regex: passwordRegex,
          explanation: "password should be between [8 64] chars, and should contain numbers, (small/capital) letters"
        }
      }
    }),
    createdAt: (0, import_fields5.timestamp)({
      validation: { isRequired: false }
    }),
    updatedAt: (0, import_fields5.timestamp)({
      validation: { isRequired: false }
    }),
    userCollections: (0, import_fields5.relationship)({
      ref: "UserCollection.user",
      many: true
    }),
    userTasks: (0, import_fields5.relationship)({
      ref: "UserTask.user",
      many: true
    })
  },
  ui: {
    description: "User Page "
  }
});

// schema.ts
var lists = {
  UserCollection: UserCollectionSchema,
  Collection: CollectionSchema,
  UserTask: UserTaskSchema,
  Task: TaskSchema,
  User: UserSchema
};

// keystone.ts
var keystone_default = withAuth(
  (0, import_core7.config)({
    db: databaseConfig,
    lists,
    session,
    server: { extendExpressApp },
    extendGraphqlSchema
  })
);
//# sourceMappingURL=config.js.map
