import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
} from "@mui/material";

export default function LoginScreen() {
  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField label="Username / Email" variant="outlined" fullWidth />
          <TextField label="Password" type="password" variant="outlined" fullWidth />

          <Button variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don’t have an account?{" "}
          <Link href="/register" underline="hover">
            Register
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
