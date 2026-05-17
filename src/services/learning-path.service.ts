import { apiClient } from './api';
import { AlgoritmoEnBiblioteca } from './library.service';

export interface RutaAprendizajeResponse {
  id: string;
  createdAt: string;
  algoritmos: AlgoritmoEnBiblioteca[];
}

export const learningPathService = {
  async getMiRuta(): Promise<RutaAprendizajeResponse> {
    return apiClient.get<RutaAprendizajeResponse>('/ruta-aprendizaje/me', {
      public: false,
    });
  },
};
