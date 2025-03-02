import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/navbar.css"; // Import CSS file

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Retrieved User from Storage:", storedUser); // ✅ Debugging line

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // ✅ Fix: Ensure valid JSON
      } catch (err) {
        console.error("⚠️ Error parsing user data:", err);
        localStorage.removeItem("user"); // ✅ Remove corrupt data
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Sajilo Finder</Link>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contacts">Contacts</Link></li>
        <li><Link to="/community">Community</Link></li>
        <li><Link to="/hostels">Hostels</Link></li>
      </ul>

      {/* ✅ Show username if logged in, else show "Get Started" */}
      {user && user.username ? (
        <div className="user-menu">
          <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user.username} ⬇
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile">Edit Profile</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="btn">Get Started</Link>
      )}
    </nav>
  );
};

export default Navbar;
