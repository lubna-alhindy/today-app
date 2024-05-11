import { graphql } from "@keystone-6/core";

import { type Context } from ".keystone/types";

export const extendGraphqlSchema = graphql.extend((base) => {
  return {
    mutation: {
      joinCollection: graphql.field({
        type: base.object("UserCollection"),
        args: {
          collectionId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        },
        async resolve(source, { collectionId }, context: Context) {
          const userId = context.session?.data?.id;
          if (!userId) {
            throw new Error("User is not authenticated");
          }

          const [isExist] = await context.prisma.userCollection.findMany({
            where: {
              user: {
                id: userId,
              },
              collection: {
                id: collectionId,
              },
            },
          });
          if (isExist) {
            throw new Error("User is exist in this collection");
          }

          return await context.prisma.userCollection.create({
            data: {
              collection: {
                connect: {
                  id: collectionId,
                },
              },
              user: {
                connect: {
                  id: userId,
                },
              },
              createdBy: {
                connect: {
                  id: userId,
                },
              },
              updatedBy: {
                connect: {
                  id: userId,
                },
              },
            },
          });
        },
      }),

      approveJoinCollectionRequest: graphql.field({
        type: base.object("UserCollection"),
        args: {
          userCollectionId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        },
        async resolve(source, { userCollectionId }, context: Context) {
          const userId = context.session?.data?.id;
          if (!userId) {
            throw new Error("User is not authenticated");
          }

          const userCollection = await context.prisma.userCollection.findUnique(
            {
              where: {
                id: userCollectionId,
              },
            }
          );
          if (!userCollection) {
            throw new Error("Request is not found");
          }
          if (userCollection.status !== "pending") {
            throw new Error("Request is not pending");
          }

          const isCollectionAdmin =
            await context.prisma.userCollection.findFirst({
              where: {
                user: {
                  id: userId,
                },
                collection: {
                  userCollections: {
                    some: {
                      id: userCollection.id,
                    },
                  },
                },
              },
            });

          if (!isCollectionAdmin || isCollectionAdmin.role !== "admin") {
            throw new Error("You are not the admin of this collection");
          }

          return await context.prisma.userCollection.update({
            where: {
              id: userCollection.id,
            },
            data: {
              status: "accepted",
            },
          });
        },
      }),
    },
  };
});
