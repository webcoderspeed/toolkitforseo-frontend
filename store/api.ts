import axios from "axios";
import { v4 as uuidV4 } from "uuid";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-trace-id": uuidV4(),
  },
});
