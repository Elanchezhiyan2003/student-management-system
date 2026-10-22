
import { useEffect, useState } from "react";
// import { getStudents, addStudent } from "./services/studentApi";
import "./App.css";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "./services/studentApi";

const initialForm = {
  name: "",
  email: "",
  age: "",
  course: "",
};

function App() {
  const [editingId, setEditingId] = useState(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  async function loadStudents() {
    try {
      setError("");
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load students. Check the backend server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isCurrent = true;

    async function fetchStudents() {
      try {
        const data = await getStudents();
        if (isCurrent) setStudents(data);
      } catch (err) {
        if (isCurrent) {
          setError(
            err.response?.data?.message ||
              "Could not load students. Check the backend server."
          );
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    fetchStudents();
    return () => {
      isCurrent = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleEdit(student) {
    setEditingId(student._id);
    setForm({
      name: student.name,
      email: student.email,
      age: String(student.age),
      course: student.course,
    });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.age ||
      !form.course.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (Number(form.age) < 1 || Number(form.age) > 120) {
      setError("Age must be between 1 and 120.");
      return;
    }

    try {
      setSaving(true);

      const studentData = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        course: form.course.trim(),
      };

      if (editingId) {
        await updateStudent(editingId, studentData);
        setMessage("Student updated successfully!");
      } else {
        await addStudent(studentData);
        setMessage("Student added successfully!");
      }

      setEditingId(null);
      setForm(initialForm);
      await loadStudents();

    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();

    return [student.name, student.email, student.course].some(
      (value) => value?.toLowerCase().includes(query)
    );
  });

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteStudent(id);

      if (editingId === id) {
        handleCancelEdit();
      }

      setMessage("Student deleted successfully!");
      await loadStudents();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete student."
      );
    }
  }

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">STUDENT ADMINISTRATION</p>
        <h1>Student Management System</h1>
        <p>Manage student records in one place.</p>
      </header>

      <section className="panel">
        <h2>{editingId ? "Edit Student" : "Add a Student"}</h2>

        <form onSubmit={handleSubmit} className="student-form">
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
            />
          </label>

          <label>
            Age
            <input
              name="age"
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter age"
              required
            />
          </label>

          <label>
            Course
            <input
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="e.g. Full Stack Development"
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Student"
                  : "Add Student"}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </section>

      <section className="panel">
        <div className="list-header">
          <div>
            <h2>Student Records</h2>
            <p>{students.length} total students</p>
          </div>

        </div>

        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, or course..."
          aria-label="Search students"
        />

        {loading ? (
          <p>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.age}</td>
                    <td>{student.course}</td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
