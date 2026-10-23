
import { useEffect, useState } from "react";
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
  const inputClassName =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
  const secondaryButtonClassName =
    "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100";

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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-white/10 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">
              Student administration
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Student Management System
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100 sm:text-base">
              Keep student records organized and easy to manage.
            </p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">
              {students.length}
            </span>
            <div>
              <p className="text-xl font-bold leading-none">{students.length}</p>
              <p className="mt-1 text-xs text-indigo-100">
                {students.length === 1 ? "student" : "students"} registered
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)] lg:px-8">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {editingId ? "Update record" : "New record"}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {editingId ? "Edit student" : "Add a student"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the student's details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Full name
              <input
                className={inputClassName}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Jordan Lee"
                autoComplete="name"
                required
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <input
                className={inputClassName}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                autoComplete="email"
                required
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Age
                <input
                  className={inputClassName}
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Course
                <input
                  className={inputClassName}
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  required
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Add student"}
              </button>
              {editingId && (
                <button
                  className={secondaryButtonClassName}
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && (
            <p
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {error}
            </p>
          )}
          {message && (
            <p
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              role="status"
            >
              {message}
            </p>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Directory
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Student records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? `${filteredStudents.length} of ${students.length} students`
                  : `${students.length} ${students.length === 1 ? "student" : "students"} total`}
              </p>
            </div>
          </div>

          <div className="relative mt-5">
            <label className="sr-only text-amber-300" htmlFor="student-search">
              Search students
            </label>
            <input
              className={`${inputClassName} mt-0 pr-20`}
              id="student-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or course..."
              aria-label="Search students by name, email, or course"
            />
            {search && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                type="button"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-5 overflow-x-auto">
            {loading ? (
              <div
                className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 px-4 py-12 text-sm text-slate-500"
                role="status"
              >
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                Loading student records...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <p className="font-semibold text-slate-800">
                  {search ? "No matching students" : "No students yet"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try another name, email, or course."
                    : "Add a student using the form to get started."}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {filteredStudents.map((student) => (
                    <article
                      className="rounded-xl border border-slate-200 p-4"
                      key={student._id}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-slate-900">
                            {student.name}
                          </h3>
                          <p className="mt-1 break-all text-sm text-slate-500">
                            {student.email}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          Age {student.age}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        <span className="font-medium text-slate-800">
                          Course:
                        </span>{" "}
                        {student.course}
                      </p>
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                        <button
                          className={`${secondaryButtonClassName} flex-1`}
                          type="button"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
                          type="button"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="h-[260px] hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[00px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-3 py-3 font-semibold">Student</th>
                        <th className="px-3 py-3 font-semibold">Age</th>
                        <th className="px-3 py-3 font-semibold">Course</th>
                        <th className="px-3 py-3 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {filteredStudents.map((student) => (
                        <tr
                          className="transition hover:bg-slate-50"
                          key={student._id}
                        >
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-900">
                              {student.name}
                            </p>
                            <p className="mt-1 break-all text-xs text-slate-500">
                              {student.email}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-slate-600">
                            {student.age}
                          </td>
                          <td className="px-3 py-4 text-slate-600">
                            {student.course}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                className={secondaryButtonClassName}
                                type="button"
                                onClick={() => handleEdit(student)}
                              >
                                Edit
                              </button>
                              <button
                                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
                                type="button"
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
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
