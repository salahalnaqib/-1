import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: router({
    list: publicProcedure.query(() => db.getProjects()),
    featured: publicProcedure.query(() => db.getFeaturedProjects()),
    byId: publicProcedure.input(z.number()).query(({ input }) => db.getProjectById(input)),
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          longDescription: z.string().optional(),
          category: z.string().min(1),
          imageUrl: z.string().optional(),
          technologies: z.string().optional(),
          link: z.string().optional(),
          githubLink: z.string().optional(),
          featured: z.number().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.createProject(input)),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          longDescription: z.string().optional(),
          category: z.string().optional(),
          imageUrl: z.string().optional(),
          technologies: z.string().optional(),
          link: z.string().optional(),
          githubLink: z.string().optional(),
          featured: z.number().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateProject(id, data);
      }),
    delete: adminProcedure
      .input(z.number())
      .mutation(({ input }) => db.deleteProject(input)),
  }),

  messages: router({
    send: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          subject: z.string().min(1),
          message: z.string().min(1),
        })
      )
      .mutation(({ input }) => db.createMessage(input)),
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(({ input }) => db.getMessages(input.limit, input.offset)),
    unreadCount: adminProcedure.query(() => db.getUnreadMessagesCount()),
    markAsRead: adminProcedure
      .input(z.number())
      .mutation(({ input }) => db.markMessageAsRead(input)),
    delete: adminProcedure
      .input(z.number())
      .mutation(({ input }) => db.deleteMessage(input)),
  }),

  skills: router({
    list: publicProcedure.query(() => db.getSkills()),
    byCategory: publicProcedure
      .input(z.string())
      .query(({ input }) => db.getSkillsByCategory(input)),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          category: z.string().min(1),
          proficiency: z.string().optional(),
          icon: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.createSkill(input)),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          category: z.string().optional(),
          proficiency: z.string().optional(),
          icon: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSkill(id, data);
      }),
    delete: adminProcedure
      .input(z.number())
      .mutation(({ input }) => db.deleteSkill(input)),
  }),
});

export type AppRouter = typeof appRouter;
