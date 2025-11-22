import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/Watch.css';

function Watch() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { token, selectedProfile } = useAuth();
  const [content, setContent] = useState(null);
  const [streamingUrl, setStreamingUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  const fetchContent = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [contentRes, streamRes] = await Promise.all([
        axios.get(`/api/content/${contentId}`, { headers }),
        axios.get(`/api/streaming/${contentId}`, { headers })
      ]);

      setContent(contentRes.data.data);
      setStreamingUrl(streamRes.data.data.streamingUrl);
      setLoading(false);

      // Increment view count
      axios.post(`/api/content/${contentId}/view`, {}, { headers });
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  const handleProgress = (state) => {
    setProgress(state.played * 100);
  };

  const handleEnded = () => {
    if (selectedProfile) {
      const headers = { Authorization: `Bearer ${token}` };
      axios.put(
        `/api/user/profiles/${selectedProfile._id}/watch-history`,
        {
          contentId: contentId,
          progress: 100,
          completed: true
        },
        { headers }
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!content) {
    return <div className="error">Content not found</div>;
  }

  return (
    <div className="watch">
      <button className="back-button" onClick={() => navigate('/browse')}>
        <FaArrowLeft /> Back to Browse
      </button>
      <div className="player-wrapper">
        <ReactPlayer
          url={streamingUrl}
          playing
          controls
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onEnded={handleEnded}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload'
              }
            }
          }}
        />
      </div>
      <div className="watch-info">
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <div className="metadata">
          <span className="rating">{content.maturityRating}</span>
          <span>{content.releaseYear}</span>
          {content.duration && <span>{content.duration} min</span>}
        </div>
        <div className="genres">
          {content.genres.map((genre, index) => (
            <span key={index} className="genre-tag">{genre}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Watch;
