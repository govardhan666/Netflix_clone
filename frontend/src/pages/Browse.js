import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Row from '../components/Row';
import '../styles/Browse.css';

function Browse() {
  const { token, selectedProfile } = useAuth();
  const [content, setContent] = useState({
    featured: [],
    trending: [],
    newReleases: [],
    actionMovies: [],
    comedies: [],
    sciFi: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [selectedProfile]);

  const fetchContent = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [featured, trending, newReleases, action, comedy, sciFi, recommendations] =
        await Promise.all([
          axios.get('/api/content?featured=true&limit=10', { headers }),
          axios.get('/api/content?trending=true&limit=10', { headers }),
          axios.get('/api/content?newRelease=true&limit=10', { headers }),
          axios.get('/api/content?genre=Action&limit=10', { headers }),
          axios.get('/api/content?genre=Comedy&limit=10', { headers }),
          axios.get('/api/content?genre=Sci-Fi&limit=10', { headers }),
          selectedProfile
            ? axios.get(`/api/recommendations/${selectedProfile._id}?limit=10`, { headers })
            : Promise.resolve({ data: { data: [] } })
        ]);

      setContent({
        featured: featured.data.data,
        trending: trending.data.data,
        newReleases: newReleases.data.data,
        actionMovies: action.data.data,
        comedies: comedy.data.data,
        sciFi: sciFi.data.data,
        recommendations: recommendations.data.data
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="browse">
      <Navbar />
      {content.featured.length > 0 && <Banner content={content.featured[0]} />}
      <div className="rows">
        {content.recommendations.length > 0 && (
          <Row title="Recommended for You" content={content.recommendations} />
        )}
        {content.trending.length > 0 && (
          <Row title="Trending Now" content={content.trending} />
        )}
        {content.newReleases.length > 0 && (
          <Row title="New Releases" content={content.newReleases} />
        )}
        {content.actionMovies.length > 0 && (
          <Row title="Action Movies" content={content.actionMovies} />
        )}
        {content.comedies.length > 0 && (
          <Row title="Comedies" content={content.comedies} />
        )}
        {content.sciFi.length > 0 && (
          <Row title="Sci-Fi Adventures" content={content.sciFi} />
        )}
      </div>
    </div>
  );
}

export default Browse;
