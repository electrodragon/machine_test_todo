import useSWR from "swr";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ListAlt } from "@mui/icons-material";
import { getEnv } from "../../utils/env-util";
import { useNavigate } from "react-router-dom";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("currentUser");
    await navigate("/login", { replace: true });
  };

  const { data: users, error: usersError, isLoading: usersLoading } = useSWR(
    `${getEnv("VITE_MOCK_SERVER_BASE_URL")}/users`,
    (url: string) => fetch(url).then((res) => res.json())
  );

  const { data: todos, error: todosError, isLoading: todosLoading } = useSWR(
    `${getEnv("VITE_MOCK_SERVER_BASE_URL")}/todo`,
    (url: string) => fetch(url).then((res) => res.json())
  );

  const error = usersError || todosError;
  const isLoading = usersLoading || todosLoading;

  const merged = (users || []).map((u: any) => ({
    ...u,
    totalTodos: (todos || []).filter(
      (t: any) => t.assignedUser === u.id && t.status !== "done"
    ),
  }));

  const handleManage = (userId: number, userName: string) => {
    navigate("/manage-user-todos", { state: { userId, userName } });
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Hello Admin</Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        <Typography variant="h4" gutterBottom>
          Users
        </Typography>

        {isLoading && (
          <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
        )}
        {error && <Alert severity="error">Failed to load users</Alert>}

        {merged.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Total Todos</TableCell>
                  <TableCell>Manage Todos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {merged.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.totalTodos.length}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        startIcon={<ListAlt />}
                        size="small"
                        onClick={() => handleManage(user.id, user.name)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};
