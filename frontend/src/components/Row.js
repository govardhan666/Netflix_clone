import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/Row.css';

function Row({ title, content }) {
  const rowRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);
  const navigate = useNavigate();

  const handleClick = (direction) => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="row">
      <h2 className="row-title">{title}</h2>
      <div className="row-container">
        <FaChevronLeft
          className={`row-slider left ${!isMoved && 'hidden'}`}
          onClick={() => handleClick('left')}
        />
        <div className="row-posters" ref={rowRef}>
          {content.map((item) => (
            <div
              key={item._id}
              className="row-poster"
              onClick={() => navigate(`/watch/${item._id}`)}
            >
              <img src={item.thumbnail} alt={item.title} />
              <div className="row-poster-info">
                <h3>{item.title}</h3>
                <p className="rating">
                  {item.rating.average.toFixed(1)} / 10
                </p>
              </div>
            </div>
          ))}
        </div>
        <FaChevronRight
          className="row-slider right"
          onClick={() => handleClick('right')}
        />
      </div>
    </div>
  );
}

export default Row;
