import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: null,
    unsignedImage: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true
            state.userData = action.payload
        },
        logout: (state) => {
            state.status = false
            state.userData = null
        },
        loadImage: (state, action) => {
            state.unsignedImage = action.payload
        },
        unloadImage: (state) => {
            state.unsignedImage = null
        }
    }
})

export const {login,logout, loadImage,unloadImage} = authSlice.actions

export default authSlice.reducer;