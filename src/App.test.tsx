import { act, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "./utils/test-utils";
import RegisterScreen from "./screens/auth/RegisterScreen.tsx";

test("Zod shows error for invalid email", async () => {
  renderWithProviders(
    <MemoryRouter>
      <RegisterScreen />
    </MemoryRouter>
  );

  await act(async () => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "invalid-email" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
  });

  expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
});
