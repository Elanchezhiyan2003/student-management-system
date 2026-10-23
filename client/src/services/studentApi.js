
import axios from "axios";

const studentApi = axios.create({
  baseURL: "https://student-management-system-vunc.onrender.com/api/students",
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
