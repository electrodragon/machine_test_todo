import  { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Chip,
  Box,
  Alert,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getEnv } from "../../utils/env-util";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum(["todo", "inProgress", "done"]),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine(
      (val) => {
        if (!val) return false;
        const today = new Date().toISOString().split("T")[0];
        return val >= today;
      },
      { message: "Due date cannot be in the past" }
    ),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["high", "low"]),
  tags: z.array(z.string()).optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

export const EditUserTodo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { task: any; userId: number; userName: string } | null;

  if (!state) {
    return <Container sx={{ mt: 4 }}>No task selected</Container>;
  }

  const { task, userId, userName } = state;
  const baseUrl = getEnv("VITE_MOCK_SERVER_BASE_URL");

  const [formData, setFormData] = useState<TaskForm>({
    title: task.title || "",
    status: task.status || "todo",
    dueDate: task.dueDate?.split("T")[0] || "",
    description: task.description || "",
    priority: task.priority || "low",
    tags: task.tags || [],
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TaskForm, string>>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange =
    (field: keyof TaskForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags?.includes(trimmed)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), trimmed] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = taskSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TaskForm, string>> = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof TaskForm;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      await axios.patch(`${baseUrl}/todo/${task.id}`, {
        ...formData,
        assignedUser: userId,
      });

      setSuccess("Task updated successfully!");
      setTimeout(() => {
        navigate("/manage-user-todos", { state: { userId, userName } });
      }, 1000);
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Task for {userName}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
          />

          <TextField
            select
            label="Status"
            value={formData.status}
            onChange={handleChange("status")}
            fullWidth
          >
            <MenuItem value="todo">Todo</MenuItem>
            <MenuItem value="inProgress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </TextField>

          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={handleChange("dueDate")}
            error={!!errors.dueDate}
            helperText={errors.dueDate}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange("description")}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            select
            label="Priority"
            value={formData.priority}
            onChange={handleChange("priority")}
            fullWidth
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>

          <Box>
            <TextField
              label="Add Tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              size="small"
              sx={{ mr: 1 }}
            />
            <Button variant="outlined" size="small" onClick={handleAddTag}>
              Add Tag
            </Button>
            <Box sx={{ mt: 1 }}>
              {formData.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </Box>

          <Button type="submit" variant="contained" color="primary">
            Update Task
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
