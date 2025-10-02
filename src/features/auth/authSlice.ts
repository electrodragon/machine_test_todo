import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice.ts"

export type AuthSliceState = {
  id?: number
  role: "idle" | "admin" | "user"
  name?: string
  email?: string
  username?: string
}

const initialState: AuthSliceState = {
  id: undefined,
  role: "idle",
  name: undefined,
  email: undefined,
  username: undefined,
}

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: create => ({
    setAuthState: create.reducer((state, action: PayloadAction<AuthSliceState>) => {
      if (action.payload.role === 'admin') {
        /*
         * saving details for the admin user
         */
        state.role = action.payload.role;
        state.username = action.payload.username;
        state.username = action.payload.username;
      } else if (action.payload.role === 'user') {
        /*
         * saving details for the regular user
         */
        state.id = action.payload.id;
        state.role = action.payload.role;
        state.name = action.payload.name;
        state.email = action.payload.email;
      } else {
        /*
         * Saving as IDLE, equivalent to initial state values
         */
        state.id = initialState.id;
        state.role = initialState.role;
        state.name = initialState.name;
        state.email = initialState.email;
        state.username = initialState.username;
      }
    })
  }),
  selectors: {
    /*
     * created separate selectors for each fields
     */
    selectAuthUserId: authState => authState.id,
    selectAuthUserRole: authState => authState.role,
    selectAuthUserFullName: authState => authState.name,
    selectAuthUserUsername: authState => authState.username,
    selectAuthUserEmail: authState => authState.email,
  }
});

export const { setAuthState } = authSlice.actions;

export const {
  selectAuthUserId,
  selectAuthUserRole,
  selectAuthUserFullName,
  selectAuthUserEmail,
  selectAuthUserUsername
} = authSlice.selectors;

export default authSlice.reducer;
