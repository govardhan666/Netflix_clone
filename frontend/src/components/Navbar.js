import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaBell, FaCaretDown } from 'react-icons/fa';
import '../styles/Navbar.css';

function Navbar() {
  const [show, setShow] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout, user, selectedProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar ${show && 'navbar-black'}`}>
      <div className="navbar-content">
        <div className="navbar-left">
          <h1 className="navbar-logo">NETFLIX</h1>
          <ul className="navbar-links">
            <li className="active">Home</li>
            <li>TV Shows</li>
            <li>Movies</li>
            <li>New & Popular</li>
            <li>My List</li>
          </ul>
        </div>
        <div className="navbar-right">
          <FaSearch className="navbar-icon" />
          <FaBell className="navbar-icon" />
          <div className="navbar-profile">
            <img
              src={selectedProfile?.avatar || 'https://i.pravatar.cc/150?img=1'}
              alt="Profile"
              className="navbar-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            <FaCaretDown
              className="navbar-icon"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <p>{selectedProfile?.name || user?.username}</p>
                  <p className="profile-email">{user?.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item">
                  Sign out of Netflix
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
