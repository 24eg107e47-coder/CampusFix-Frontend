
import { useEffect, useState } from "react";
import "./App.css";
import AdminLogin from "./AdminLogin";

import { API_URL } from "./config";

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
  const [message, setMessage] = useState("");

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

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        API_URL + "/api/complaints"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setMessage("Unable to load complaints. Please try again.");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        API_URL + "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(loginForm)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          typeof data === "string"
            ? data
            : data.message || "Login failed. Check your credentials."
        );
        return;
      }

      if (data.role === "ADMIN") {
        setMessage("Please use the Admin website to login.");
        return;
      }

      setLoggedIn(true);
      setUser(data);
      setLoginForm({
        username: "",
        password: ""
      });
      setMessage("");
      setPage("home");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Could not connect to the backend. Please try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        API_URL + "/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: signupForm.username,
            password: signupForm.password,
            role: "STUDENT"
          })
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setMessage(data || "Account creation failed.");
        return;
      }

      setMessage("Account created successfully. Please login.");

      setSignupForm({
        username: "",
        password: ""
      });

      setPage("login");
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("Could not connect to the backend. Please try again.");
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (!loggedIn || !user) {
      setMessage("Please login before submitting a complaint.");
      setPage("login");
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        API_URL + "/api/complaints",
        {
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
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        setMessage(errorText || "Could not submit complaint.");
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
      console.error("Complaint submission error:", error);
      setMessage("Could not connect to the backend. Please try again.");
    }
  };

  const logout = () => {
    setLoggedIn(false);
    setUser(null);
    setLoginForm({
      username: "",
      password: ""
    });
    setMessage("");
    setPage("home");
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const searchText = [
      complaint.title,
      complaint.description,
      complaint.category,
      complaint.location
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

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
            className={
              page === "complaints" ? "nav-btn active" : "nav-btn"
            }
            onClick={() => setPage("complaints")}
          >
            📋 Complaints
          </button>

          <button
            className={
              page === "dashboard" ? "nav-btn active" : "nav-btn"
            }
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

          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn admin-portal-btn"
          >
            🛡️ Admin Portal ↗
          </a>

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
                    onClick={() => {
                      setMessage("");
                      setPage("login");
                    }}
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

            <Stats
              total={total}
              pending={pending}
              inProgress={inProgress}
              resolved={resolved}
            />

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
            <p className="page-subtitle">
              Campus complaint overview
            </p>

            <Stats
              total={total}
              pending={pending}
              inProgress={inProgress}
              resolved={resolved}
            />
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

              <p
                className="switch-text"
                style={{
                  marginTop: "12px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "12px"
                }}
              >
                Campus Staff or Administrator?{" "}
                <a
                  href="/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    textDecoration: "none"
                  }}
                >
                  Open Admin Portal ↗
                </a>
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
        <div>
          Building a better campus together ·{" "}
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Admin Portal ↗
          </a>
        </div>
        <div>❤️ Made for our college community</div>
      </footer>
    </div>
  );
}

function Stats({ total, pending, inProgress, resolved }) {
  return (
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
  );
}

function ComplaintCard({ complaint }) {
  const categoryIcon =
    complaint.category === "Electricity"
      ? "💡"
      : complaint.category === "Water"
        ? "💧"
        : complaint.category === "Cleaning"
          ? "🧹"
          : "🏫";

  const statusClass = (complaint.status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <div className="complaint-card">
      <div className="complaint-top">
        <div className="complaint-icon">{categoryIcon}</div>

        <div className="complaint-title">
          <h3>{complaint.title}</h3>
          <span>{complaint.category}</span>
        </div>

        <span className={"status " + statusClass}>
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

      <p className="description">{complaint.description}</p>

      {complaint.resolutionMessage && (
        <div className="resolution-message">
          <strong>Admin Message:</strong>{" "}
          {complaint.resolutionMessage}
        </div>
      )}
    </div>
  );
}

export default AppRouter;
