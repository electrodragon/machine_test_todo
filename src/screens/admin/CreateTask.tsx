import { useState } from "react";
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

type TaskForm = {
  title: string;
  status: "todo" | "inProgress" | "done";
  dueDate: string;
  description: string;
  priority: "high" | "low";
  tags: string[];
};

export const CreateTask: React.FC = () => {
  const location = useLocation();
  const state = location.state as { userId: number; userName: string } | null;

  if (!state) {
    return <Container sx={{ mt: 4 }}>No user selected</Container>;
  }

  const { userId, userName } = state;

  const [formData, setFormData] = useState<TaskForm>({
    title: "",
    status: "todo",
    dueDate: "",
    description: "",
    priority: "low",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof TaskForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    else if (formData.dueDate < today) newErrors.dueDate = "Due date cannot be in the past";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post("http://localhost:3000/todo", {
        ...formData,
        assignedUser: userId,
      });

      setSuccess("Task created successfully!");
      setFormData({
        title: "",
        status: "todo",
        dueDate: "",
        description: "",
        priority: "low",
        tags: [],
      });
      setTagInput("");
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Task for {userName}
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
              {formData.tags.map((tag) => (
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
            Create Task
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
