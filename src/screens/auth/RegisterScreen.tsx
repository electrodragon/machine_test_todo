import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
} from "@mui/material";

export default function RegisterScreen() {
  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField label="Name" type="text" variant="outlined" fullWidth />
          <TextField label="Email" type="email" variant="outlined" fullWidth />
          <TextField label="Password" type="password" variant="outlined" fullWidth />

          <Button variant="contained" color="primary" fullWidth>
            Register
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link href="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
