
import { useEffect, useState } from "react";
import "./App.css";
import AdminLogin from "./AdminLogin";

const API_URL = "https://backend-2-hc99.onrender.com";

function AppRouter() {
  if (window.location.pathname === "/admin") {
    return <AdminLogin />;
  }

  return <App />;
}

function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [signupForm, setSignupForm] = useState({
    username: "",
    password: ""
  });

  const [complaintForm, setComplaintForm] = useState({
    title: "",
    description: "",
    category: "Electricity",
    location: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
  try {
    const response = await fetch(
      "https://backend-2-hc99.onrender.com/api/complaints"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch complaints");
    }

    const data = await response.json();
    setComplaints(data);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    alert("Unable to connect to backend. Please try again.");
  }
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginForm)
      });

      if (!response.ok) {
        setMessage(await response.text());
        return;
      }

      const data = await response.json();

      if (data.role === "ADMIN") {
        setMessage("Please use the Admin website to login.");
        return;
      }

      setLoggedIn(true);
      setUser(data);
      setMessage("");
      setPage("home");

      setLoginForm({
        username: "",
        password: ""
      });
    } catch (error) {
      setMessage("Could not connect to the backend. Please try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: signupForm.username,
          password: signupForm.password,
          role: "STUDENT"
        })
      });

      const data = await response.text();

      if (!response.ok) {
        setMessage(data);
        return;
      }

      setMessage("Account created successfully. Please login.");

      setSignupForm({
        username: "",
        password: ""
      });

      setPage("login");
    } catch (error) {
      setMessage("Could not connect to the backend. Please try again.");
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (!loggedIn || !user) {
      setPage("login");
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: complaintForm.title,
          description: complaintForm.description,
          category: complaintForm.category,
          location: complaintForm.location,
          status: "Pending",
          username: user.username
        })
      });

      if (!response.ok) {
        setMessage(await response.text() || "Could not submit complaint.");
        return;
      }

      setComplaintForm({
        title: "",
        description: "",
        category: "Electricity",
        location: ""
      });

      setMessage("Complaint submitted successfully.");

      await fetchComplaints();
      setPage("complaints");
    } catch (error) {
      setMessage("Could not connect to the backend. Please try again.");
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
        window.alert("Please enter a message for the student.");
        return;
      }
    }

    try {
      const url =
        `${API_URL}/api/complaints/${id}/status` +
        `?status=${encodeURIComponent(status)}` +
        `&resolutionMessage=${encodeURIComponent(resolutionMessage)}`;

      const response = await fetch(url, {
        method: "PUT"
      });

      if (!response.ok) {
        window.alert("Could not update complaint status.");
        return;
      }

      await fetchComplaints();
    } catch (error) {
      console.error("Updating complaint failed:", error);
      window.alert("Could not connect to the backend.");
    }
  };

  const deleteComplaint = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/complaints/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        window.alert("Could not delete complaint.");
        return;
      }

      await fetchComplaints();
    } catch (error) {
      console.error("Deleting complaint failed:", error);
      window.alert("Could not connect to the backend.");
    }
  };

  const logout = () => {
    setLoggedIn(false);
    setUser(null);
    setPage("login");
    setMessage("");
  };

  const filteredComplaints = complaints.filter((complaint) =>
    `${complaint.title || ""} ${complaint.description || ""} ${complaint.category || ""} ${complaint.location || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const total = complaints.length;

  const pending = complaints.filter(
    (c) => c.status === "Pending"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;

  const resolved = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div className="logo-area">
          <div className="logo-icon">CF</div>
          <div>
            <h1>
              CAMPUS<span>FIX</span>
            </h1>
            <p>Smart Campus Complaint Management</p>
          </div>
        </div>

        <nav className="nav">
          <button
            className={page === "home" ? "nav-btn active" : "nav-btn"}
            onClick={() => setPage("home")}
          >
            🏠 Home
          </button>

          <button
            className={page === "complaints" ? "nav-btn active" : "nav-btn"}
            onClick={() => setPage("complaints")}
          >
            📋 Complaints
          </button>

          <button
            className={page === "dashboard" ? "nav-btn active" : "nav-btn"}
            onClick={() => setPage("dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className={page === "about" ? "nav-btn active" : "nav-btn"}
            onClick={() => setPage("about")}
          >
            ℹ️ About
          </button>

          {loggedIn ? (
            <button className="user-btn" onClick={logout}>
              👤 Logout
            </button>
          ) : (
            <button
              className="user-btn"
              onClick={() => {
                setMessage("");
                setPage("login");
              }}
            >
              👤 Login
            </button>
          )}
        </nav>
      </header>

      <main>
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-overlay">
                <h2>Welcome to CampusFix</h2>
                <p>Together we make our campus better.</p>

                {!loggedIn && (
                  <button
                    className="hero-btn"
                    onClick={() => setPage("login")}
                  >
                    Get Started →
                  </button>
                )}

                {loggedIn && (
                  <button
                    className="hero-btn"
                    onClick={() => {
                      setMessage("");
                      setPage("newComplaint");
                    }}
                  >
                    + Report a Complaint
                  </button>
                )}
              </div>
            </section>

            <section className="stats">
              <div className="stat-card">
                <div className="stat-icon blue">📋</div>
                <div>
                  <h3>Total Complaints</h3>
                  <strong>{total}</strong>
                  <p>All complaints</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">◷</div>
                <div>
                  <h3>Pending</h3>
                  <strong>{pending}</strong>
                  <p>Waiting for action</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">⚙</div>
                <div>
                  <h3>In Progress</h3>
                  <strong>{inProgress}</strong>
                  <p>Currently being worked on</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">✓</div>
                <div>
                  <h3>Resolved</h3>
                  <strong>{resolved}</strong>
                  <p>Successfully resolved</p>
                </div>
              </div>
            </section>

            <section className="content-card">
              <div className="section-header">
                <div>
                  <h2>Recent Complaints</h2>
                  <p>View and track campus complaints</p>
                </div>

                {loggedIn && (
                  <button
                    className="primary-btn"
                    onClick={() => {
                      setMessage("");
                      setPage("newComplaint");
                    }}
                  >
                    + New Complaint
                  </button>
                )}
              </div>

              <input
                className="search-box"
                placeholder="🔍 Search complaints..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="complaint-grid">
                {filteredComplaints.slice(0, 6).map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    user={user}
                    updateStatus={updateStatus}
                    deleteComplaint={deleteComplaint}
                  />
                ))}

                {filteredComplaints.length === 0 && (
                  <div className="empty">No complaints found.</div>
                )}
              </div>
            </section>
          </>
        )}

        {page === "dashboard" && (
          <section className="page-section">
            <h2>Dashboard</h2>
            <p className="page-subtitle">Campus complaint overview</p>

            <section className="stats">
              <div className="stat-card">
                <div className="stat-icon blue">📋</div>
                <div>
                  <h3>Total Complaints</h3>
                  <strong>{total}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">◷</div>
                <div>
                  <h3>Pending</h3>
                  <strong>{pending}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">⚙</div>
                <div>
                  <h3>In Progress</h3>
                  <strong>{inProgress}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">✓</div>
                <div>
                  <h3>Resolved</h3>
                  <strong>{resolved}</strong>
                </div>
              </div>
            </section>
          </section>
        )}

        {page === "complaints" && (
          <section className="page-section">
            <div className="section-header">
              <div>
                <h2>All Complaints</h2>
                <p>Track complaints reported on campus</p>
              </div>

              {loggedIn && (
                <button
                  className="primary-btn"
                  onClick={() => {
                    setMessage("");
                    setPage("newComplaint");
                  }}
                >
                  + New Complaint
                </button>
              )}
            </div>

            <input
              className="search-box"
              placeholder="🔍 Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="complaint-grid">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  user={user}
                  updateStatus={updateStatus}
                  deleteComplaint={deleteComplaint}
                />
              ))}

              {filteredComplaints.length === 0 && (
                <div className="empty">No complaints found.</div>
              )}
            </div>
          </section>
        )}

        {page === "newComplaint" && (
          <section className="form-page">
            <div className="form-card">
              <h2>Report a Campus Complaint</h2>
              <p>
                Tell us about the problem and our team will take care of it.
              </p>

              <form onSubmit={handleComplaintSubmit}>
                <label>Complaint Title</label>
                <input
                  required
                  value={complaintForm.title}
                  onChange={(e) =>
                    setComplaintForm({
                      ...complaintForm,
                      title: e.target.value
                    })
                  }
                  placeholder="Example: Fan not working"
                />

                <label>Category</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) =>
                    setComplaintForm({
                      ...complaintForm,
                      category: e.target.value
                    })
                  }
                >
                  <option>Electricity</option>
                  <option>Water</option>
                  <option>Classroom</option>
                  <option>Cleaning</option>
                  <option>Other</option>
                </select>

                <label>Location</label>
                <input
                  required
                  value={complaintForm.location}
                  onChange={(e) =>
                    setComplaintForm({
                      ...complaintForm,
                      location: e.target.value
                    })
                  }
                  placeholder="Example: Block A - Room 203"
                />

                <label>Description</label>
                <textarea
                  required
                  value={complaintForm.description}
                  onChange={(e) =>
                    setComplaintForm({
                      ...complaintForm,
                      description: e.target.value
                    })
                  }
                  placeholder="Describe the problem..."
                />

                <button className="primary-btn" type="submit">
                  Submit Complaint
                </button>
              </form>

              {message && <p className="message">{message}</p>}
            </div>
          </section>
        )}

        {page === "login" && (
          <section className="form-page">
            <div className="auth-card">
              <div className="auth-icon">👤</div>
              <h2>Welcome Back</h2>
              <p>Login to your CampusFix account</p>

              <form onSubmit={handleLogin}>
                <input
                  required
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      username: e.target.value
                    })
                  }
                />

                <input
                  required
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      password: e.target.value
                    })
                  }
                />

                <button className="primary-btn" type="submit">
                  Login
                </button>
              </form>

              {message && <p className="message">{message}</p>}

              <p className="switch-text">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setPage("signup");
                  }}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </section>
        )}

        {page === "signup" && (
          <section className="form-page">
            <div className="auth-card">
              <div className="auth-icon">📝</div>
              <h2>Create Account</h2>
              <p>Join CampusFix today</p>

              <form onSubmit={handleSignup}>
                <input
                  required
                  placeholder="Username"
                  value={signupForm.username}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      username: e.target.value
                    })
                  }
                />

                <input
                  required
                  type="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      password: e.target.value
                    })
                  }
                />

                <button className="primary-btn" type="submit">
                  Create Account
                </button>
              </form>

              {message && <p className="message">{message}</p>}

              <p className="switch-text">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setPage("login");
                  }}
                >
                  Login
                </button>
              </p>
            </div>
          </section>
        )}

        {page === "about" && (
          <section className="page-section">
            <div className="about-card">
              <h2>About CampusFix</h2>
              <p>
                CampusFix is a campus complaint management system designed
                to help students report maintenance and campus-related
                problems easily.
              </p>

              <div className="about-grid">
                <div>
                  <span>📋</span>
                  <h3>Easy Reporting</h3>
                  <p>
                    Students can quickly report problems from one simple
                    platform.
                  </p>
                </div>

                <div>
                  <span>⚡</span>
                  <h3>Quick Updates</h3>
                  <p>
                    Complaints can be tracked through different status stages.
                  </p>
                </div>

                <div>
                  <span>🏫</span>
                  <h3>Better Campus</h3>
                  <p>
                    Helps organize campus maintenance complaints.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <div>🎓 © 2026 CampusFix. All rights reserved.</div>
        <div>Building a better campus together</div>
        <div>❤️ Made for our college community</div>
      </footer>
    </div>
  );
}

function ComplaintCard({
  complaint,
  user,
  updateStatus,
  deleteComplaint
}) {
  return (
    <div className="complaint-card">
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
          <h3>{complaint.title}</h3>
          <span>{complaint.category}</span>
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
        📅 Submitted on:{" "}
        {complaint.createdAt
          ? new Date(complaint.createdAt).toLocaleString()
          : "Not available"}
      </div>

      <div className="complaint-info">
        🆔 Complaint ID: CF-{complaint.id}
      </div>

      <p className="description">{complaint.description}</p>

      {complaint.resolutionMessage && (
        <div className="resolution-message">
          <strong>Admin Message:</strong>{" "}
          {complaint.resolutionMessage}
        </div>
      )}

      {user?.role === "ADMIN" && (
        <div className="admin-controls">
          <button onClick={() => updateStatus(complaint.id, "Pending")}>
            Pending
          </button>

          <button onClick={() => updateStatus(complaint.id, "Assigned")}>
            Assigned
          </button>

          <button onClick={() => updateStatus(complaint.id, "In Progress")}>
            In Progress
          </button>

          <button onClick={() => updateStatus(complaint.id, "Resolved")}>
            Resolved
          </button>

          <button
            className="delete-btn"
            onClick={() => deleteComplaint(complaint.id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default AppRouter;
