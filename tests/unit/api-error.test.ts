import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { toApiError } from "@/shared/api-error";

function makeAxiosError(status: number, data: unknown, url = "/bookings"): AxiosError {
  const headers = new AxiosHeaders();
  const err = new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_REQUEST",
    { headers, url } as never,
    null,
    {
      status,
      statusText: "",
      headers,
      data,
      config: { headers, url } as never,
    },
  );
  return err;
}

function makeNetworkError(code = "ERR_NETWORK"): AxiosError {
  const headers = new AxiosHeaders();
  return new AxiosError("Network Error", code, { headers, url: "/x" } as never);
}

describe("toApiError", () => {
  it("usa data.error do backend quando presente", () => {
    const err = makeAxiosError(409, {
      error: "Já existe uma reserva para esta sala neste horário.",
    });
    const apiErr = toApiError(err);
    expect(apiErr.status).toBe(409);
    expect(apiErr.message).toBe("Já existe uma reserva para esta sala neste horário.");
    expect(apiErr.fieldErrors).toEqual({});
    expect(apiErr.isNetworkError).toBe(false);
  });

  it("extrai fieldErrors do array details (formato Zod)", () => {
    const err = makeAxiosError(400, {
      error: "Dados inválidos.",
      details: [
        { path: "startTime", message: "Data deve estar no formato ISO-8601." },
        { path: "title", message: "title é obrigatório" },
      ],
    });
    const apiErr = toApiError(err);
    expect(apiErr.status).toBe(400);
    expect(apiErr.fieldErrors).toEqual({
      startTime: "Data deve estar no formato ISO-8601.",
      title: "title é obrigatório",
    });
  });

  it("usa fallback por status quando backend não envia mensagem", () => {
    const err = makeAxiosError(403, {});
    const apiErr = toApiError(err);
    expect(apiErr.status).toBe(403);
    expect(apiErr.message).toBe("Você não tem permissão para essa ação.");
  });

  it("usa fallback explícito quando status é desconhecido e sem mensagem", () => {
    const err = makeAxiosError(418, {});
    const apiErr = toApiError(err, "fallback custom");
    expect(apiErr.message).toBe("fallback custom");
  });

  it("identifica erro de rede (sem response)", () => {
    const err = makeNetworkError("ERR_NETWORK");
    const apiErr = toApiError(err);
    expect(apiErr.status).toBeNull();
    expect(apiErr.isNetworkError).toBe(true);
    expect(apiErr.message).toContain("conectar");
  });

  it("identifica timeout", () => {
    const err = makeNetworkError("ECONNABORTED");
    const apiErr = toApiError(err);
    expect(apiErr.isNetworkError).toBe(true);
    expect(apiErr.message).toContain("demorou");
  });

  it("aceita Error genérico", () => {
    const apiErr = toApiError(new Error("boom"));
    expect(apiErr.status).toBeNull();
    expect(apiErr.message).toBe("boom");
  });

  it("retorna fallback para input desconhecido", () => {
    const apiErr = toApiError({ random: "object" }, "padrão");
    expect(apiErr.message).toBe("padrão");
  });
});
