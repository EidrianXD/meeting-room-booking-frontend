import axios from "axios";

/**
 * Forma normalizada de erro vinda da API. Toda camada do frontend que toca rede
 * (composables, stores, formulários) deve passar a exceção por `toApiError()` e
 * usar `message` para feedback ao usuário e `fieldErrors` para destacar campos
 * de formulário quando o backend retornar detalhes do Zod.
 */
export interface ApiError {
  /** HTTP status code. `null` quando o erro foi de rede (sem resposta do servidor). */
  status: number | null;
  /** Mensagem pronta para exibir ao usuário (em pt-BR). */
  message: string;
  /** Erros por campo, no formato { path: message } — vindo do array `details` do backend. */
  fieldErrors: Record<string, string>;
  /** True quando não houve resposta do servidor (offline, DNS, CORS preflight, etc.). */
  isNetworkError: boolean;
}

interface ApiErrorBody {
  error?: string;
  details?: Array<{ path: string; message: string }>;
}

/** Mensagens padrão por status, usadas quando o backend não envia uma específica. */
const STATUS_FALLBACK: Record<number, string> = {
  400: "Os dados enviados são inválidos.",
  401: "Sessão expirada. Faça login novamente.",
  403: "Você não tem permissão para essa ação.",
  404: "Recurso não encontrado.",
  409: "Conflito: já existe uma reserva nesse horário.",
  422: "Os dados enviados são inválidos.",
  429: "Muitas requisições. Aguarde alguns instantes e tente de novo.",
  500: "Erro no servidor. Tente novamente em instantes.",
  502: "Servidor indisponível no momento.",
  503: "Servidor indisponível no momento.",
  504: "O servidor demorou demais para responder.",
};

export function toApiError(err: unknown, fallback = "Algo deu errado."): ApiError {
  if (axios.isAxiosError(err)) {
    // Sem `response` → erro de rede (offline, servidor caiu, CORS preflight bloqueado).
    if (!err.response) {
      const isTimeout = err.code === "ECONNABORTED";
      return {
        status: null,
        message: isTimeout
          ? "A requisição demorou demais. Tente novamente."
          : "Não foi possível conectar ao servidor. Verifique sua conexão.",
        fieldErrors: {},
        isNetworkError: true,
      };
    }

    const { status } = err.response;
    const data = (err.response.data ?? {}) as ApiErrorBody;

    const fieldErrors: Record<string, string> = {};
    for (const detail of data.details ?? []) {
      if (detail.path) fieldErrors[detail.path] = detail.message;
    }

    const backendMessage = typeof data.error === "string" && data.error.length > 0 ? data.error : null;
    const message = backendMessage ?? STATUS_FALLBACK[status] ?? fallback;

    return { status, message, fieldErrors, isNetworkError: false };
  }

  // Erro lançado por código nosso (ex.: throw new Error em validações locais).
  if (err instanceof Error && err.message) {
    return { status: null, message: err.message, fieldErrors: {}, isNetworkError: false };
  }

  return { status: null, message: fallback, fieldErrors: {}, isNetworkError: false };
}
