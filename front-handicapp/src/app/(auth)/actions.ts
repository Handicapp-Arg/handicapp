"use server";

import { AuthService } from "@/lib/services/authService";
import { ROLE_ID_TO_ROLE_KEY, ROLE_DASHBOARD_ROUTES } from "@/lib/utils/roleUtils";
import { CookieService } from "@/lib/services/cookieService";
import { ValidationService } from "@/lib/services/validationService";
import { ErrorService } from "@/lib/services/errorService";
import type { ActionResult } from "@/lib/types/api";

/**
 * Server Action para registro de usuarios
 */
export async function registerAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extraer y limpiar datos del formulario
    const rawData = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
    };

    // Validar datos del lado del servidor
    const validation = ValidationService.validateRegister(rawData);
    if (!validation.success) {
      return {
        ok: false,
        message: "Por favor corrige los errores en el formulario",
        fieldErrors: validation.errors || {},
        status: 400,
      };
    }

    // Registrar usuario en el backend
    const response = await AuthService.register(validation.data!);

    if (response.success && response.data) {
      // Establecer cookies de autenticación
      await CookieService.setAuthCookies({ accessToken: response.data.token, refreshToken: response.data.token });

      return {
        ok: true,
        message: "¡Registro exitoso! Ya puedes iniciar sesión.",
        status: 201,
      };
    }

    return {
      ok: false,
      message: response.message || "Error durante el registro",
      status: 400,
    };

  } catch (error) {
    const errorResult = ErrorService.handleHttpError(error);
    return {
      ok: false,
      message: errorResult.message,
      fieldErrors: errorResult.fieldErrors,
      status: errorResult.status,
    };
  }
}

/**
 * Server Action para login de usuarios
 */
export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extraer y limpiar datos del formulario
    const rawData = {
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
    };

    // Validar datos del lado del servidor
    const validation = ValidationService.validateLogin(rawData);
    if (!validation.success) {
      return {
        ok: false,
        message: "Por favor corrige los errores en el formulario",
        fieldErrors: validation.errors || {},
        status: 400,
      };
    }

    // Autenticar usuario en el backend
    const response = await AuthService.login(validation.data!);

    if (response.success && response.data) {
      // Establecer cookies de autenticación
      await CookieService.setAuthCookies({ 
        accessToken: response.data.token, 
        refreshToken: response.data.token,
        role: response.data.user.rol_id 
      });

      const roleKey = ROLE_ID_TO_ROLE_KEY[response.data.user.rol_id];
      const dashboardRoute = ROLE_DASHBOARD_ROUTES[roleKey];

      return {
        ok: true,
        message: "¡Inicio de sesión exitoso!",
        status: 200,
        data: {
          user: response.data.user,
          redirectTo: dashboardRoute
        }
      };
    }

    return {
      ok: false,
      message: response.message || "Error durante el inicio de sesión",
      status: 400,
    };

  } catch (error) {
    const errorResult = ErrorService.handleHttpError(error);
    return {
      ok: false,
      message: errorResult.message,
      fieldErrors: errorResult.fieldErrors,
      status: errorResult.status,
    };
  }
}

/**
 * Server Action para logout de usuarios
 */
export async function logoutAction(): Promise<ActionResult> {
  try {
    // Limpiar cookies de autenticación
    await CookieService.clearAuthCookies();

    return {
      ok: true,
      message: "Sesión cerrada correctamente",
      status: 200,
    };

  } catch (error) {
    // Incluso si hay error, limpiamos las cookies localmente
    await CookieService.clearAuthCookies();

    const errorResult = ErrorService.handleHttpError(error);
    return {
      ok: false,
      message: errorResult.message,
      status: errorResult.status,
    };
  }
}