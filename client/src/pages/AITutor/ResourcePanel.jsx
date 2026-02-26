import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Loader } from 'lucide-react';
import { api } from '../../services/api';
import '../styles/AITutor.css';

function ResourcePanel({ topic }) {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [topic]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai-tutor/resources', {
        params: { topic },
      });
      setResources(response.data.resources);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rp-loading">
        <Loader size={20} className="spinner" />
        <p>Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="resource-panel">
      <div className="resources-list">
        {resources && resources.length > 0 ? (
          resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <div className="resource-icon">
                <BookOpen size={16} />
              </div>
              <div className="resource-info">
                <p className="resource-name">{resource.name}</p>
                <p className="resource-title">{resource.title}</p>
              </div>
              <ExternalLink size={16} />
            </a>
          ))
        ) : (
          <p className="no-resources">No resources found for this topic</p>
        )}
      </div>

      <div className="rp-tips">
        <h4>Learning Tips</h4>
        <ul>
          <li>Take notes while learning</li>
          <li>Try explaining concepts out loud</li>
          <li>Connect to real-world examples</li>
          <li>Practice problem sets regularly</li>
        </ul>
      </div>
    </div>
  );
}

export default ResourcePanel;
