import { MenuItem } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false); // Track if the settings menu is open

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        // const response = await axios.get("http://localhost:5000/api/users", {
        const response = await axios.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64  min-h-screen">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white text-xl font-semibold">🏠 AES</span>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <button
              className={`w-full flex items-center px-4 py-3 text-sm rounded-lg ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-gray-100"
                  : "text-black hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className={`w-full flex items-center px-4 py-3 text-sm rounded-lg ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white"
                  : "text-black hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              👤 Profile
            </button>
            <button
              onClick={() => {
                setSettingsMenuOpen(!settingsMenuOpen); // Toggle settings menu visibility
                setActiveTab("settings"); // Change active tab to settings when the settings button is clicked
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white"
                  : "text-black hover:bg-gray-700"
              }`}
            >
              <span>⚙️ Settings</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                  settingsMenuOpen ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {settingsMenuOpen && (
              <div className="bg-gray-500 rounded-md mt-2">
                <MenuItem
                  onClick={() => {
                    // Handle Profile Settings click
                  }}
                  className="text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-white hover:text-gray-900 hover:shadow-lg hover:scale-105"
                >
                  Profile Settings
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    // Handle Account Security click
                  }}
                  className="text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-white hover:text-gray-900 hover:shadow-lg hover:scale-105"
                >
                  Account Security
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    // Handle Notification Preferences click
                  }}
                  className="text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-white hover:text-gray-900 hover:shadow-lg hover:scale-105"
                >
                  Notification Preferences
                </MenuItem>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-100 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Users Management
                </h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400">
                      🔍
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Add User
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Company
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Contact
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          University
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.company || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phone || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.university || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-1 px-3 rounded-lg text-xs">
                              Edit
                            </button>
                            <button className="ml-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-1 px-3 rounded-lg text-xs">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Prev
                  </button>
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of{" "}
                    {Math.ceil(users.length / usersPerPage)}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(users.length / usersPerPage)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
