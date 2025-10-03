import { Route, Routes } from "react-router-dom"
import { AdminDashboard } from "./screens/admin/AdminDashboard.tsx"
import LoginScreen from "./screens/auth/LoginScreen.tsx"
import { UserDashboard } from "./screens/user/UserDashboard.tsx"
import RegisterScreen from "./screens/auth/RegisterScreen.tsx"
import { UserTodos } from "./screens/admin/ManageUserTodos.tsx"
import { CreateTask } from "./screens/admin/CreateTask.tsx"
import { EditUserTodo } from "./screens/admin/EditUserTodo.tsx"
import { PrivateRoute } from "./components/PrivateRoute.tsx"

export const App = () => (
  <Routes>

    <Route
      path="/"
      element={
        <PrivateRoute allowedRoles={["user"]} isAuthRoute={false}>
          <UserDashboard />
        </PrivateRoute>
      }
    />

    <Route
      path="/login"
      element={
        <PrivateRoute isAuthRoute={true}>
          <LoginScreen />
        </PrivateRoute>
      }
    />

    <Route
      path="/register"
      element={
        <PrivateRoute isAuthRoute={true}>
          <RegisterScreen />
        </PrivateRoute>
      }
    />

    <Route
      path="/admin-dashboard"
      element={
        <PrivateRoute allowedRoles={["admin"]} isAuthRoute={false}>
          <AdminDashboard />
        </PrivateRoute>
      }
    />

    <Route
      path="/manage-user-todos"
      element={
        <PrivateRoute allowedRoles={["admin"]} isAuthRoute={false}>
          <UserTodos />
        </PrivateRoute>
      }
    />

    <Route
      path="/create-task"
      element={
        <PrivateRoute allowedRoles={["admin"]} isAuthRoute={false}>
          <CreateTask />
        </PrivateRoute>
      }
    />

    <Route
      path="/edit-user-todo"
      element={
        <PrivateRoute allowedRoles={["admin"]} isAuthRoute={false}>
          <EditUserTodo />
        </PrivateRoute>
      }
    />
  </Routes>
)
