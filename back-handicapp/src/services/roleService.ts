import { Op, Transaction } from "sequelize";
import { Role, RoleAttrs } from "../models/roles";
import { PaginationQuery, ServiceResponse } from "../types";
import { ConflictError, NotFoundError, DatabaseError } from "../utils/errors";

export interface RolePayload {
  clave: string;
  nombre: string;
}

export type RoleUpdatePayload = Partial<RolePayload>;

const SORTABLE_FIELDS = new Set<string>(["id", "clave", "nombre", "creado_el"]);

const normalizeClave = (value: string) => value.trim().toLowerCase();
const normalizeNombre = (value: string) => value.trim();

export class RoleService {
  static async listRoles(
    pagination: PaginationQuery = {},
  ): Promise<ServiceResponse<{ roles: RoleAttrs[]; total: number; totalPages: number }>> {
    const { page = 1, limit = 10, sortBy = "creado_el", sortOrder = "ASC" } = pagination;

    const safeSortField = SORTABLE_FIELDS.has(sortBy ?? "") ? sortBy! : "creado_el";
    const safeSortOrder = sortOrder === "DESC" ? "DESC" : "ASC";

    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await Role.findAndCountAll({
      limit: safeLimit,
      offset,
      order: [[safeSortField, safeSortOrder]],
    });

    const totalPages = Math.max(1, Math.ceil(count / safeLimit));

    return {
      success: true,
      data: {
        roles: rows.map((role) => role.get({ plain: true }) as RoleAttrs),
        total: count,
        totalPages,
      },
    };
  }

  static async getRoleById(id: number): Promise<ServiceResponse<RoleAttrs>> {
    const role = await Role.findByPk(id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    return {
      success: true,
      data: role.get({ plain: true }) as RoleAttrs,
    };
  }

  static async createRole(payload: RolePayload, transaction?: Transaction): Promise<ServiceResponse<RoleAttrs>> {
    const clave = normalizeClave(payload.clave);
    const nombre = normalizeNombre(payload.nombre);

    const existing = await Role.findOne({ where: { clave } });
    if (existing) {
      throw new ConflictError("La clave de rol ya se encuentra registrada");
    }

  const role = await Role.create({ clave, nombre }, { transaction: transaction ?? null });

    return {
      success: true,
      data: role.get({ plain: true }) as RoleAttrs,
    };
  }

  static async updateRole(
    id: number,
    payload: RoleUpdatePayload,
    transaction?: Transaction,
  ): Promise<ServiceResponse<RoleAttrs>> {
    const role = await Role.findByPk(id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const update: RoleUpdatePayload = {};

    if (payload.clave !== undefined) {
      const clave = normalizeClave(payload.clave);
      if (clave !== role.clave) {
        const existing = await Role.findOne({
          where: {
            clave,
            id: { [Op.ne]: id },
          },
        });

        if (existing) {
          throw new ConflictError("La clave de rol ya se encuentra registrada");
        }
      }
      update.clave = clave;
    }

    if (payload.nombre !== undefined) {
      update.nombre = normalizeNombre(payload.nombre);
    }

  // Usamos set + save para evitar problemas con overloads estrictos
  role.set(update as Partial<RoleAttrs>);
  await role.save({ transaction: transaction ?? null });

    return {
      success: true,
      data: role.get({ plain: true }) as RoleAttrs,
    };
  }

  static async deleteRole(id: number, transaction?: Transaction): Promise<ServiceResponse<null>> {
    const role = await Role.findByPk(id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    try {
  await role.destroy({ transaction: transaction ?? null });
    } catch (error: any) {
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError("No es posible eliminar el rol porque esta siendo utilizado");
      }
      throw new DatabaseError("Failed to delete role");
    }

    return { success: true, data: null };
  }
}
