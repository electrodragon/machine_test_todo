import { Route, Routes } from "react-router-dom"
import { AdminDashboard } from "./screens/admin/AdminDashboard.tsx"
import LoginScreen from "./screens/auth/LoginScreen.tsx"
import { UserDashboard } from "./screens/user/UserDashboard.tsx"
import RegisterScreen from "./screens/auth/RegisterScreen.tsx"

export const App = () => (
  <Routes>
    <Route path={"/"} element={<UserDashboard />} />
    <Route path={"/login"} element={<LoginScreen />} />
    <Route path={"/register"} element={<RegisterScreen />} />
    <Route path={"/admin-dashboard"} element={<AdminDashboard />} />
    <Route path={"/"} element={<AdminDashboard />} />
    <Route path={"/"} element={<AdminDashboard />} />
    <Route path={"/"} element={<AdminDashboard />} />
    <Route path={"/"} element={<AdminDashboard />} />
    <Route path={"/"} element={<AdminDashboard />} />
  </Routes>
)
