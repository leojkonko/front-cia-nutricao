import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AISearchPage from "../AISearchPage";

// Mock para fetch
global.fetch = jest.fn();

describe("AISearchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza o formulário de busca", () => {
    render(
      <BrowserRouter>
        <AISearchPage />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText(/Digite o nome de um produto/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buscar/i })).toBeInTheDocument();
  });

  test("exibe erro quando a busca está vazia", async () => {
    render(
      <BrowserRouter>
        <AISearchPage />
      </BrowserRouter>
    );

    fireEvent.submit(screen.getByRole("button", { name: /buscar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Por favor, digite o nome de um produto para buscar/i)
      ).toBeInTheDocument();
    });
  });

  test("exibe resultados quando a busca é bem-sucedida", async () => {
    const mockResponse = {
      success: true,
      data: {
        benefits: ["Benefício 1", "Benefício 2"],
        contraindications: ["Contraindicação 1"],
        origin: "Origem do produto",
        purpose: "Finalidade do produto",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <BrowserRouter>
        <AISearchPage />
      </BrowserRouter>
    );

    fireEvent.change(
      screen.getByPlaceholderText(/Digite o nome de um produto/i),
      {
        target: { value: "Whey Protein" },
      }
    );

    fireEvent.submit(screen.getByRole("button", { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Benefício 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Origem do produto/i)).toBeInTheDocument();
    });
  });
});
