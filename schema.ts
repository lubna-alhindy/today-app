import type { Lists } from ".keystone/types";

import { CollectionSchema, UserCollectionSchema } from "./src/collection";
import { TaskSchema, UserTaskSchema } from "./src/task";
import { UserSchema } from "./src/user";

export const lists: Lists = {
  UserCollection: UserCollectionSchema,
  Collection: CollectionSchema,
  UserTask: UserTaskSchema,
  Task: TaskSchema,
  User: UserSchema,
};
