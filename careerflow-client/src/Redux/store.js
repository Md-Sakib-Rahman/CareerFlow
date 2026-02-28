import {configureStore} from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import boardReducer from "./board/boardSlice";
import reminderReducer from "./reminder/reminderSlice";
export const store = configureStore({
    reducer:{
        auth: authReducer,
        board: boardReducer,
        reminder: reminderReducer,
    }
})