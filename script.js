import { prisma } from "./lib/prisma.js";

async function main() {
  // Create a new user with a post
  const user = await prisma.user.create({
    data: {
      username: "alice",
      password: "fakeexample",
      folders: {
        create: {
          title: "Default",
          files: {
            create: {
              title: "Hello world",
              content: "Test 1",
            }
          },
        },
      },
    },
  });
  console.log("Created user:", user);

  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      folders: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });