import { Router } from "express";
import {
  createStaffSchema,
  invitationActionSchema,
  staffRoleSchema,
} from "@swiftdrop/contracts";
import { z } from "zod";
import type { Config } from "../../shared/config.js";
import { HttpError } from "../../shared/problem.js";
import { protectMutations } from "../../shared/mutations.js";
import { authenticate, requireRole } from "../auth/index.js";
import type { AuthService } from "../auth/service.js";
import { UsersService } from "./service.js";

const filtersSchema = z
  .object({
    role: staffRoleSchema.optional(),
    status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
    cursor: z.string().max(256).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export function createUsersRouter(
  users: UsersService,
  auth: AuthService,
  config: Config,
) {
  const router = Router();
  const admin = [authenticate(auth), requireRole("ADMIN")];
  router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  router.get("/", ...admin, async (req, res) => {
    const filters = filtersSchema.parse(req.query);
    res.json(await users.list(res.locals.user.id, filters));
  });
  router.post("/", protectMutations(config), ...admin, async (req, res) => {
    res
      .status(201)
      .json(
        await users.create(
          res.locals.user.id,
          createStaffSchema.parse(req.body),
        ),
      );
  });
  router.post(
    "/:id/invitation",
    protectMutations(config),
    ...admin,
    async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1)
        throw new HttpError(400, "INVALID_USER", "User id is invalid.");
      const { action } = invitationActionSchema.parse(req.body);
      res.json(await users.invitationAction(res.locals.user.id, id, action));
    },
  );
  return router;
}
