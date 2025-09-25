import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/errors";
import { ResponseHelper } from "../utils/response";
import { PaginationQuery } from "../types";
import { RoleService, RolePayload, RoleUpdatePayload } from "../services/roleService";

export class RoleController {
  static list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query as Partial<PaginationQuery>;

    const pagination: PaginationQuery = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sortBy: typeof sortBy === "string" ? sortBy : undefined,
      sortOrder: sortOrder === "DESC" ? "DESC" : "ASC",
    };

    const result = await RoleService.listRoles(pagination);

    return ResponseHelper.success(res, result.data, "Roles retrieved successfully", 200, {
      page: pagination.page,
      limit: pagination.limit,
      total: result.data?.total,
      totalPages: result.data?.totalPages,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    const result = await RoleService.getRoleById(id);
    return ResponseHelper.success(res, result.data, "Role retrieved successfully");
  });

  static create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payload = req.body as RolePayload;
    const result = await RoleService.createRole(payload);
    return ResponseHelper.created(res, result.data, "Role created successfully");
  });

  static update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    const payload = req.body as RoleUpdatePayload;
    const result = await RoleService.updateRole(id, payload);
    return ResponseHelper.success(res, result.data, "Role updated successfully");
  });

  static remove = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = Number(req.params.id);
    await RoleService.deleteRole(id);
    return ResponseHelper.noContent(res, "Role deleted successfully");
  });
}
