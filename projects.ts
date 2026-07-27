import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("projects router", () => {
  it("should list projects as public user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get featured projects as public user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.featured();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create project as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      title: "Test Project",
      description: "A test project",
      category: "Web",
      imageUrl: "https://example.com/image.jpg",
      technologies: '["React", "Node.js"]',
      link: "https://example.com",
      githubLink: "https://github.com/example",
      featured: 0,
      order: 0,
    });

    expect(result).toBeDefined();
  });
});

describe("messages router", () => {
  it("should send message as public user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.messages.send({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test message content",
    });

    expect(result).toBeDefined();
  });

  it("should list messages as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.messages.list({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get unread count as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.messages.unreadCount();

    expect(typeof result).toBe("number");
  });
});

describe("skills router", () => {
  it("should list skills as public user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.skills.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get skills by category as public user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.skills.byCategory("Frontend");

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create skill as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.skills.create({
      name: "React",
      category: "Frontend",
      proficiency: "Advanced",
      icon: "react",
      order: 0,
    });

    expect(result).toBeDefined();
  });
});
