
import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api/students"
    : "https://student-management-system-vunc.onrender.com/api/students");

const studentApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch all students
export const getStudents = async () => {
  const response = await studentApi.get("/");
  return response.data;
};

// Add a student
export const addStudent = async (student) => {
  const response = await studentApi.post("/", student);
  return response.data;
};


export const updateStudent = async (id, student) => {
  const response = await studentApi.put(`/${id}`, student);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await studentApi.delete(`/${id}`);
  return response.data;
};
