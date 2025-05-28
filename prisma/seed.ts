import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = "admin@example.com";
  let admin;

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        isVerified: true,
      },
    });
    console.log("Admin user created:", admin.email);
  } else {
    admin = existingAdmin;
    console.log("Admin user already exists, skipping creation");
  }

  // Create editor user if it doesn't exist
  const editorEmail = "editor@example.com";
  let editor;

  const existingEditor = await prisma.user.findUnique({
    where: { email: editorEmail },
  });

  if (!existingEditor) {
    const editorPassword = await bcrypt.hash("editor123", 10);
    editor = await prisma.user.create({
      data: {
        name: "Editor User",
        email: editorEmail,
        password: editorPassword,
        role: Role.EDITOR,
        isVerified: true,
      },
    });
    console.log("Editor user created:", editor.email);
  } else {
    editor = existingEditor;
    console.log("Editor user already exists, skipping creation");
  }

  // Create tags if they don't exist
  const techTagName = "technology";
  let techTag;

  const existingTechTag = await prisma.tag.findUnique({
    where: { name: techTagName },
  });

  if (!existingTechTag) {
    techTag = await prisma.tag.create({ data: { name: techTagName } });
    console.log("Technology tag created");
  } else {
    techTag = existingTechTag;
    console.log("Technology tag already exists, skipping creation");
  }

  const healthTagName = "health";
  let healthTag;

  const existingHealthTag = await prisma.tag.findUnique({
    where: { name: healthTagName },
  });

  if (!existingHealthTag) {
    healthTag = await prisma.tag.create({ data: { name: healthTagName } });
    console.log("Health tag created");
  } else {
    healthTag = existingHealthTag;
    console.log("Health tag already exists, skipping creation");
  }

  // Create sample article if it doesn't exist
  const articleTitle = "Getting Started with Node.js";

  const existingArticle = await prisma.article.findFirst({
    where: { title: articleTitle },
  });

  if (!existingArticle && editor) {
    const article = await prisma.article.create({
      data: {
        title: articleTitle,
        content:
          "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows developers to use JavaScript for server-side scripting and runs scripts server-side to produce dynamic web page content before the page is sent to the user's web browser.",
        authorId: editor.id,
        isPublished: true,
      },
    });

    // Check if the article tag relationship already exists
    const existingArticleTag = await prisma.articleTag.findUnique({
      where: {
        articleId_tagId: {
          articleId: article.id,
          tagId: techTag.id,
        },
      },
    });

    if (!existingArticleTag) {
      await prisma.articleTag.create({
        data: { articleId: article.id, tagId: techTag.id },
      });
    }

    console.log("Sample article created with tag");
  } else {
    console.log("Sample article already exists, skipping creation");
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
