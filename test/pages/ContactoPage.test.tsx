import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ContactoPage } from "../../src/pages/ContactoPage";

// Test contact form validation and success flash using fake timers
describe("ContactoPage", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows validation errors and flash success on valid submit", () => {
    render(<ContactoPage />);
    const nombre = screen.getByLabelText(/Tu nombre/i);
    const correo = screen.getByLabelText(/Tu correo/i);
    const mensaje = screen.getByLabelText(/Mensaje/i, { selector: 'textarea' });
    const btn = screen.getByRole("button", { name: /Enviar mensaje/i });

    // submit empty -> error flash
    act(() => {
      fireEvent.click(btn);
    });
    expect(screen.getByText(/Revisa los campos marcados/i)).toBeDefined();

    // Fill valid data and submit inside act to ensure state updates are flushed
    act(() => {
      fireEvent.change(nombre, { target: { value: "Test" } });
      fireEvent.change(correo, { target: { value: "user@gmail.com" } });
      fireEvent.change(mensaje, { target: { value: "Hola" } });
      fireEvent.click(btn);
    });

    // success flash appears
    expect(screen.getByText(/Tu mensaje fue enviado con éxito/i)).toBeDefined();

    // Advance timers to hide flash inside act
    act(() => {
      vi.advanceTimersByTime(5000);
    });
  });
});
