import { useEffect, useState } from "react";
import "./App.css";

function AdminLogin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [complaints, setComplaints] = useState([]);

  const loginAdmin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://https://backend-4-wep2.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            password
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        setMessage(error);
        return;
      }

      const data = await response.json();

      if (data.role !== "ADMIN") {
        setMessage("Access denied. Admin account required.");
        return;
      }

      setLoggedIn(true);
      setMessage("");
      fetchComplaints();

    } catch (error) {
      setMessage("Backend is not running");
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        "http://https://backend-4-wep2.onrender.com/api/complaints"
      );

      const data = await response.json();
      setComplaints(data);

    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, status) => {
    let resolutionMessage = "";

    if (status === "Resolved") {
      resolutionMessage = window.prompt(
        "Enter message for the student:"
      );

      if (resolutionMessage === null) {
        return;
      }

      if (resolutionMessage.trim() === "") {
        alert("Please enter a message for the student.");
        return;
      }
    }

    try {
      const url =
        `http://https://backend-4-wep2.onrender.com/api/complaints/${id}/status` +
        `?status=${encodeURIComponent(status)}` +
        `&resolutionMessage=${encodeURIComponent(
          resolutionMessage
        )}`;

      const response = await fetch(url, {
        method: "PUT"
      });

      if (!response.ok) {
        alert("Could not update complaint");
        return;
      }

      fetchComplaints();

    } catch (error) {
      console.log(error);
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await fetch(
        `http://https://backend-4-wep2.onrender.com/api/complaints/${id}`,
        {
          method: "DELETE"
        }
      );

      fetchComplaints();

    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setComplaints([]);
  };

  if (!loggedIn) {
    return (
      <section className="form-page">

        <div className="auth-card">

          <div className="auth-icon">
            🔐
          </div>

          <h2>
            Admin Login
          </h2>

          <p>
            Login to CampusFix Admin Panel
          </p>

          <form onSubmit={loginAdmin}>

            <input
              required
              placeholder="Admin Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

            <input
              required
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              className="primary-btn"
              type="submit"
            >
              Admin Login
            </button>

          </form>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

        </div>

      </section>
    );
  }

  return (
    <div className="app">

      <header className="header">

        <div className="logo-area">

          <div className="logo-icon">
            CF
          </div>

          <div>
            <h1>
              CAMPUS<span>FIX</span>
            </h1>

            <p>
              Admin Complaint Management
            </p>
          </div>

        </div>

        <nav className="nav">

          <button
            className="user-btn"
            onClick={logout}
          >
            👤 Admin Logout
          </button>

        </nav>

      </header>

      <main>

        <section className="page-section">

          <div className="section-header">

            <div>
              <h2>
                Admin Dashboard
              </h2>

              <p>
                Manage all student complaints
              </p>
            </div>

          </div>

          <div className="stats">

            <div className="stat-card">

              <div className="stat-icon blue">
                📋
              </div>

              <div>
                <h3>
                  Total Complaints
                </h3>

                <strong>
                  {complaints.length}
                </strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">
                ◷
              </div>

              <div>
                <h3>
                  Pending
                </h3>

                <strong>
                  {
                    complaints.filter(
                      (c) => c.status === "Pending"
                    ).length
                  }
                </strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon purple">
                ⚙
              </div>

              <div>
                <h3>
                  In Progress
                </h3>

                <strong>
                  {
                    complaints.filter(
                      (c) => c.status === "In Progress"
                    ).length
                  }
                </strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <h3>
                  Resolved
                </h3>

                <strong>
                  {
                    complaints.filter(
                      (c) => c.status === "Resolved"
                    ).length
                  }
                </strong>
              </div>

            </div>

          </div>

          <div className="complaint-grid">

            {complaints.map((complaint) => (

              <div
                className="complaint-card"
                key={complaint.id}
              >

                <div className="complaint-top">

                  <div className="complaint-icon">
                    {complaint.category === "Electricity"
                      ? "💡"
                      : complaint.category === "Water"
                      ? "💧"
                      : complaint.category === "Cleaning"
                      ? "🧹"
                      : "🏫"}
                  </div>

                  <div className="complaint-title">

                    <h3>
                      {complaint.title}
                    </h3>

                    <span>
                      {complaint.category}
                    </span>

                  </div>

                  <span
                    className={`status ${complaint.status
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {complaint.status}
                  </span>

                </div>

                <div className="complaint-info">
                  📍 {complaint.location}
                </div>
                <div className="complaint-info">
  🆔 Complaint ID: CF-{complaint.id}
</div>
                <div className="complaint-info">
  📅 Submitted on:{" "}
  {complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleString()
    : "Not available"}
</div>

                <p className="description">
                  {complaint.description}
                </p>

                

                {complaint.resolutionMessage && (
                  <div className="resolution-message">
                    <strong>
                      Admin Message:
                    </strong>{" "}
                    {complaint.resolutionMessage}
                  </div>
                )}

                <div className="admin-controls">

                  <button
                    onClick={() =>
                      updateStatus(
                        complaint.id,
                        "Pending"
                      )
                    }
                  >
                    Pending
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        complaint.id,
                        "Assigned"
                      )
                    }
                  >
                    Assigned
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        complaint.id,
                        "In Progress"
                      )
                    }
                  >
                    In Progress
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        complaint.id,
                        "Resolved"
                      )
                    }
                  >
                    Resolved
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteComplaint(complaint.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

            {complaints.length === 0 && (
              <div className="empty">
                No complaints available.
              </div>
            )}

          </div>

        </section>

      </main>

      <footer>

        <div>
          🎓 © 2026 CampusFix. All rights reserved.
        </div>

        <div>
          Admin Panel
        </div>

        <div>
          Campus Complaint Management
        </div>

      </footer>

    </div>
  );
}

export default AdminLogin;