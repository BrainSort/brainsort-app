/**
 * badges.service.ts
 * BrainSort — Servicio de insignias
 *
 * task_breakdown.md T-FE-040
 *
 * Expone:
 *   - getAllBadges(): Obtiene todas las insignias disponibles
 *   - getUserBadges(): Obtiene insignias desbloqueadas por el usuario actual
 *
 * Consumido por: useProgress.ts hook (T-FE-050) o componente BadgeCard
 *
 * Referencia: 02-frontend-app.md §1 services/badges.service.ts
 *            04-contratos-api.md §7 Badges Module
 */

import { apiClient } from './api';

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Insignia disponible en el sistema (GET /api/badges o /api/insignias) */
export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  criterioDesbloqueo: string; // Descripción/pista del criterio (ej: "Completar 1 simulación")
  categoria?: string;
  desbloqueada?: boolean;
  fechaObtencion?: string;
}

/** Insignia en el perfil del usuario (desbloqueada o bloqueada) */
export interface InsigniaDesbloqueada {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  criterioDesbloqueo?: string;
  categoria?: string;
  desbloqueada?: boolean;
  fechaObtencion?: string; // ISO 8601 timestamp
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de insignias.
 */
export const badgesService = {
  /**
   * Obtiene todas las insignias disponibles en el sistema.
   *
   * @returns Lista completa de insignias con criterios de desbloqueo
   */
  async getAllBadges(): Promise<Insignia[]> {
    return apiClient.get<Insignia[]>('/insignias', {
      public: false,
    });
  },

  /**
   * Obtiene las insignias del usuario (desbloqueadas con fecha y bloqueadas con pista).
   *
   * @param userId ID del usuario o 'me' para el usuario autenticado
   */
  async getUserBadges(userId?: string): Promise<InsigniaDesbloqueada[]> {
    const endpoint = userId ? `/users/${userId}/badges` : '/insignias/me';
    return apiClient.get<InsigniaDesbloqueada[]>(endpoint, {
      public: false,
    });
  },
};
