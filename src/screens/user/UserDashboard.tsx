import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  AppBar,
  Toolbar,
  Button,
  TablePagination,
} from "@mui/material";
import { getEnv } from "../../utils/env-util";
import { useNavigate } from "react-router-dom";

const statusColor = (status: string) => {
  switch (status) {
    case "todo":
      return "default";
    case "inProgress":
      return "primary";
    case "done":
      return "success";
    default:
      return "default";
  }
};

const priorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "error";
    case "low":
      return "warning";
    default:
      return "default";
  }
};

const getRemainingTime = (dueDateISO: string) => {
  const now = new Date();
  const due = new Date(dueDateISO);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) return "Overdue";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const diffSeconds = Math.floor((diffMs / 1000) % 60);

  if (diffDays > 0) return `${diffDays} day(s) left`;
  if (diffHours > 0) return `${diffHours} hour(s) ${diffMinutes} min left`;
  if (diffMinutes > 0) return `${diffMinutes} min ${diffSeconds} sec left`;
  return `${diffSeconds} sec left`;
};

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const userId = Number(currentUser.id);
  const userName = currentUser.name || "User";

  const handleLogout = async () => {
    localStorage.removeItem("currentUser");
    await navigate("/login", { replace: true });
  };

  const { data: todos, error, isLoading } = useSWR(
    userId
      ? `${getEnv("VITE_MOCK_SERVER_BASE_URL")}/todo?assignedUser=${userId}`
      : null,
    (url: string) => fetch(url).then((res) => res.json())
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    if (todos && page > Math.ceil(todos.length / rowsPerPage) - 1) {
      setPage(Math.max(0, Math.ceil(todos.length / rowsPerPage) - 1));
    }
  }, [todos, rowsPerPage, page]);

  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">{userName}</Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {userName}!
        </Typography>

        {isLoading && <Typography>Loading tasks...</Typography>}
        {error && <Typography>Error loading tasks</Typography>}

        {todos && todos.length > 0 ? (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remaining Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((todo: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{todo.id}</TableCell>
                        <TableCell>
                          <Typography variant="h6">{todo.title}</Typography>
                          <Typography variant="body2">
                            {todo.description}
                          </Typography>
                          {todo.tags?.length > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              {todo.tags.map((tag: string) => (
                                <Chip
                                  key={tag}
                                  label={`#${tag}`}
                                  size="small"
                                  sx={{ mr: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={todo.priority}
                            color={priorityColor(todo.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={todo.status}
                            color={statusColor(todo.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getRemainingTime(todo.dueDate)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={todos.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        ) : (
          <Typography>No tasks assigned yet.</Typography>
        )}
      </Container>
    </>
  );
};
