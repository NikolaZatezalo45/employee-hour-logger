"use client";
import { useState, useEffect } from "react";

type Employee = {
  id: number;
  name: string;
};

type WorkLog = {
  employeeId: number;
  employeeName: string;
  checkIn: string;
  checkOut: string | null;
};

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState<string>("");
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // For the clear logs button password
  const [clearPassword, setClearPassword] = useState<string>("");
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const storedEmployees = JSON.parse(
      localStorage.getItem("employees") || "[]"
    ) as Employee[];
    setEmployees(storedEmployees);

    const storedLogs = JSON.parse(
      localStorage.getItem("employeeLogs") || "[]"
    ) as WorkLog[];
    setLogs(storedLogs);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);

      return () => clearTimeout(timer); // Clear the timeout if message changes or component unmounts
    }
  }, [message]);

  const saveEmployeesToLocalStorage = (employees: Employee[]) => {
    localStorage.setItem("employees", JSON.stringify(employees));
  };

  const saveLogsToLocalStorage = (logs: WorkLog[]) => {
    localStorage.setItem("employeeLogs", JSON.stringify(logs));
  };

  const handleAddEmployee = () => {
    if (newEmployeeName.trim() === "") {
      setMessage({ text: "Employee name is required!", type: "error" });
      return;
    }

    const newEmployee: Employee = {
      id: employees.length + 1, // Generate a new ID based on the length
      name: newEmployeeName,
    };

    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    saveEmployeesToLocalStorage(updatedEmployees);
    setNewEmployeeName("");
    setMessage({
      text: `${newEmployee.name} added successfully!`,
      type: "success",
    });
  };

  const handleLogin = () => {
    if (selectedEmployee === null) return;

    const isAlreadyLoggedIn = logs.some(
      (log) => log.employeeId === selectedEmployee && log.checkOut === null
    );

    if (isAlreadyLoggedIn) {
      setMessage({ text: "Employee is already logged in!", type: "error" });
      return;
    }

    const currentTime = new Date().toISOString();
    const employee = employees.find((e) => e.id === selectedEmployee);

    if (!employee) return;

    const newLog: WorkLog = {
      employeeId: selectedEmployee,
      employeeName: employee.name,
      checkIn: currentTime,
      checkOut: null,
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    saveLogsToLocalStorage(updatedLogs);
    setMessage({ text: "Employee logged in successfully!", type: "success" });
  };

  const handleLogout = () => {
    if (selectedEmployee === null) return;

    const isLoggedIn = logs.some(
      (log) => log.employeeId === selectedEmployee && log.checkOut === null
    );

    if (!isLoggedIn) {
      setMessage({ text: "Employee is not logged in!", type: "error" });
      return;
    }

    const currentTime = new Date().toISOString();
    const updatedLogs = logs.map((log) => {
      if (log.employeeId === selectedEmployee && !log.checkOut) {
        return { ...log, checkOut: currentTime };
      }
      return log;
    });

    setLogs(updatedLogs);
    saveLogsToLocalStorage(updatedLogs);
    setMessage({ text: "Employee logged out successfully!", type: "success" });
  };

  const exportToCSV = () => {
    const today = new Date().toISOString().split("T")[0];
    const csvContent = [
      ["Employee", "Check In", "Time", "Check Out", "Time"],
      ...logs.map((log) => [
        log.employeeName,
        log.checkIn ? new Date(log.checkIn).toLocaleString() : "",
        log.checkOut ? new Date(log.checkOut).toLocaleString() : "",
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `employee_log_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isEmployeeLoggedIn =
    selectedEmployee !== null &&
    logs.some(
      (log) => log.employeeId === selectedEmployee && log.checkOut === null
    );

  const handleClearLogs = () => {
    if (clearPassword !== "pass1234") {
      setMessage({ text: "Incorrect password", type: "error" });
      return;
    }

    // Get today's date in the format "YYYY-MM-DD"
    const today = new Date().toISOString().split("T")[0];

    const updatedLogs = logs.filter(
      (log) => log.checkIn && log.checkIn.split("T")[0] !== today
    );

    setLogs(updatedLogs);
    saveLogsToLocalStorage(updatedLogs);
    setIsClearLogsModalOpen(false);
    setMessage({
      text: "All logs for today cleared successfully!",
      type: "success",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Tijana&apos;s hour logger
      </h1>

      {/* Display success or error message */}
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-white ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Employee Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Add New Employee
        </h2>
        <input
          type="text"
          className="border border-gray-300 rounded p-2 w-full text-gray-700 mb-2"
          placeholder="Enter new employee's name"
          value={newEmployeeName}
          onChange={(e) => setNewEmployeeName(e.target.value)}
        />
        <button
          onClick={handleAddEmployee}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 w-full"
        >
          Add Employee
        </button>
      </div>

      {/* Login/Logout Section (Centered) */}
      <div className="flex justify-center space-x-4 mb-8 mt-8">
        <div className="w-full max-w-md">
          <select
            className="border border-gray-300 rounded p-2 w-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setSelectedEmployee(
                e.target.value ? Number(e.target.value) : null
              )
            }
            value={selectedEmployee || ""}
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={handleLogin}
          disabled={isEmployeeLoggedIn || selectedEmployee === null}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 w-full disabled:bg-gray-400"
        >
          Check In
        </button>
        <button
          onClick={handleLogout}
          disabled={!isEmployeeLoggedIn}
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 w-full disabled:bg-gray-400"
        >
          Check Out
        </button>
        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 w-full"
        >
          Export to CSV
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Today&apos;s Logs
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 border-b text-left font-semibold">
                Employee
              </th>
              <th className="px-4 py-2 border-b text-left font-semibold">
                Check In
              </th>
              <th className="px-4 py-2 border-b text-left font-semibold">
                Check Out
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="text-gray-700">
                <td className="px-4 py-2 border-b">{log.employeeName}</td>
                <td className="px-4 py-2 border-b">
                  {log.checkIn ? new Date(log.checkIn).toLocaleString() : ""}
                </td>
                <td className="px-4 py-2 border-b">
                  {log.checkOut
                    ? new Date(log.checkOut).toLocaleString()
                    : "Currently Logged In"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Clear Logs Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setIsClearLogsModalOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 w-full"
        >
          Clear Logs
        </button>
      </div>

      {/* Clear Logs Modal */}
      {isClearLogsModalOpen && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p>Enter password to confirm clearing the logs</p>
            <input
              type="password"
              value={clearPassword}
              onChange={(e) => setClearPassword(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full mt-4 mb-4"
            />
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleClearLogs}
                className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsClearLogsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
