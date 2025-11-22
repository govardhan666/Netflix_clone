import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';
import '../styles/Banner.css';

function Banner({ content }) {
  const navigate = useNavigate();

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <header
      className="banner"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(20,20,20,1)), url(${content?.banner})`,
      }}
    >
      <div className="banner-contents">
        <h1 className="banner-title">
          {content?.title}
        </h1>
        <div className="banner-buttons">
          <button
            className="banner-button"
            onClick={() => navigate(`/watch/${content._id}`)}
          >
            <FaPlay /> Play
          </button>
          <button className="banner-button outline">
            <FaInfoCircle /> More Info
          </button>
        </div>
        <p className="banner-description">
          {truncate(content?.description, 150)}
        </p>
      </div>
      <div className="banner-fade-bottom" />
    </header>
  );
}

export default Banner;
