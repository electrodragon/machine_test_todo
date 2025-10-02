import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAppDispatch } from "../../app/hooks";
import type { AuthSliceState } from "../../features/auth/authSlice";
import { setAuthState } from '../../features/auth/authSlice';
import { getEnv } from "../../utils/env-util.ts"

const loginSchema = z.object({
  emailOrUsername: z.string().min(2, "Username or Email is required")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginForm>>({});

  useEffect(() => {
    const msg = localStorage.getItem("registerSuccess");

    if (msg) {
      setSuccessMessage(msg);
      localStorage.removeItem("registerSuccess");
    }
  }, []);

  const handleChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    /*
     * Validating Form using ZOD library
     */
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const errors: Partial<LoginForm> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginForm;
        errors[field] = issue.message;
      });

      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      /*
       * Firstly, Attempting to Match details with Admin login credentials
       */
      const adminRes = await axios.get(`${getEnv('VITE_MOCK_SERVER_BASE_URL')}/auth`);
      const admin = adminRes.data as { username: string; password: string };

      if (admin.username === formData.emailOrUsername && admin.password === formData.password) {
        /*
         * Storing in LocalStorage,
         * and also in AuthState (REDUX)
         */
        const adminUser = { role: "admin", username: admin.username };
        localStorage.setItem("currentUser", JSON.stringify(adminUser));

        dispatch(setAuthState({
          role: "admin",
          username: admin.username
        }));

        await navigate("/admin-dashboard");
        return;
      }

      /*
       * Secondly, Attempting to login as regular user
       */
      const userRes = await axios.get(
        `${getEnv('VITE_MOCK_SERVER_BASE_URL')}/users?email=${formData.emailOrUsername.toLowerCase()}`
      );

      const users = userRes.data as { id: number; name: string; email: string; password: string }[];

      let matchedUser: { id: number; name: string; email: string; password: string } | null = null;

      for (const u of users) {
        if (u.email.toLowerCase() === formData.emailOrUsername.toLowerCase() && u.password === formData.password) {
          matchedUser = u;
          break;
        }
      }

      if (matchedUser) {
        const userData: AuthSliceState = {
          id: matchedUser.id,
          role: "user",
          name: matchedUser.name,
          email: matchedUser.email
        };

        /*
         * Storing in LocalStorage,
         * and also in AuthState (REDUX)
         */
        localStorage.setItem("currentUser", JSON.stringify(userData));
        dispatch(setAuthState(userData));

        await navigate("/"); // User Dashboard is default, that's why i'm integrating it to /
        return;
      }

      setErrorMessage("Invalid username/email or password.");
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          onSubmit={handleLogin}
        >
          <TextField
            label="Username / Email"
            variant="outlined"
            fullWidth
            value={formData.emailOrUsername}
            onChange={handleChange("emailOrUsername")}
            error={!!fieldErrors.emailOrUsername}
            helperText={fieldErrors.emailOrUsername}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleChange("password")}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don’t have an account? <Link href="/register" underline="hover">Register</Link>
        </Typography>
      </Paper>
    </Container>
  );
}
