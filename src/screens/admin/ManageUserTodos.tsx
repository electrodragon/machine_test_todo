import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  IconButton,
  TablePagination,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { getEnv } from "../../utils/env-util";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export const UserTodos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { userId: number; userName: string } | null;

  if (!state) {
    return <Container sx={{ mt: 4 }}>No user selected</Container>;
  }

  const { userId, userName } = state;

  const { data: todos, error, isLoading, mutate } = useSWR(
    `${getEnv("VITE_MOCK_SERVER_BASE_URL")}/todo?assignedUser=${userId}`,
    (url: string) => fetch(url).then((res) => res.json())
  );

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((tick) => tick + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset page on new search
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleAddNew = () => {
    navigate("/create-task", { state: { userId, userName } });
  };

  const handleEdit = (task: any) => {
    navigate("/edit-user-todo", { state: { task, userId, userName } });
  };

  const handleOpenDialog = (taskId: number) => {
    setSelectedTaskId(taskId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTaskId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTaskId) return;
    try {
      await fetch(`${getEnv("VITE_MOCK_SERVER_BASE_URL")}/todo/${selectedTaskId}`, {
        method: "DELETE",
      });
      mutate();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "todo": return "default";
      case "inProgress": return "primary";
      case "done": return "success";
      default: return "default";
    }
  };
  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "error";
      case "low": return "warning";
      default: return "default";
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

  let filteredTodos = todos || [];
  if (statusFilter !== "all") {
    filteredTodos = filteredTodos.filter((t: any) => t.status === statusFilter);
  }
  if (debouncedSearch.trim() !== "") {
    filteredTodos = filteredTodos.filter((t: any) =>
      t.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }
  if (sortOrder) {
    filteredTodos = [...filteredTodos].sort((a: any, b: any) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  const paginatedTodos = filteredTodos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">Manage User Todos</Typography>
          <Typography variant="h6">{userName}</Typography>
        </Toolbar>
      </AppBar>

      <Container>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h4">{userName}'s Todos</Typography>
          <Button variant="contained" color="primary" onClick={handleAddNew}>
            Add New Task
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Search by Title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Typography variant="body1">Filter by Status:</Typography>
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0); // reset page
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="todo">Todo</MenuItem>
            <MenuItem value="inProgress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>

          <Typography variant="body1" sx={{ ml: 3 }}>
            Sort by Due Date:
          </Typography>
          <IconButton onClick={() => setSortOrder("asc")} color="primary">
            <ArrowUpwardIcon />
          </IconButton>
          <IconButton onClick={() => setSortOrder("desc")} color="primary">
            <ArrowDownwardIcon />
          </IconButton>
        </Stack>

        {isLoading && <Typography>Loading...</Typography>}
        {error && <Typography>Error loading todos</Typography>}

        {filteredTodos && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remaining Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTodos.map((todo: any) => (
                    <TableRow key={todo.id}>
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
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5 }}
                          onClick={() => handleEdit(todo)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleOpenDialog(todo.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredTodos.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};
