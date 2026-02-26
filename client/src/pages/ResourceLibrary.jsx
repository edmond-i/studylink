import React, { useState, useEffect } from 'react';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Loader, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import './styles/Resources.css';

export default function ResourceLibrary() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [view, setView] = useState('browse'); // 'browse' or 'saved'
  const [savingId, setSavingId] = useState(null);
  const showToast = useToast();

  // Fetch categories on mount
  useEffect(() => {
    loadCategories();
    if (view === 'browse') {
      loadResources();
    } else {
      loadSavedResources();
    }
  }, []);

  // Fetch resources when search or category changes
  useEffect(() => {
    if (view === 'browse') {
      loadResources();
    }
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/resources/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      showToast('Failed to load categories', 'error');
    }
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('limit', 24);

      const response = await api.get(`/resources?${params.toString()}`);
      setResources(response.data.resources || []);
    } catch (err) {
      console.error('Error loading resources:', err);
      showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedResources = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resources/saved/list?limit=24');
      const saved = response.data.resources || [];
      setSavedResources(saved);
      setResources(saved);
    } catch (err) {
      console.error('Error loading saved resources:', err);
      showToast('Failed to load saved resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveResource = async (resourceId, resource) => {
    try {
      setSavingId(resourceId);
      const isSavedNow = savedResources.some((r) => r.url === resource.url);

      if (isSavedNow) {
        await api.delete(`/resources/${resourceId}/save`);
        setSavedResources((prev) => prev.filter((r) => r.url !== resource.url));
        showToast('Removed from library', 'success');
      } else {
        await api.post(`/resources/${resourceId}/save`);
        const response = await api.get('/resources/saved/list?limit=24');
        setSavedResources(response.data.resources || []);
        showToast('Added to library', 'success');
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      if (err.response?.data?.error?.includes('already saved')) {
        showToast('Already in your library', 'info');
      } else {
        showToast('Failed to update library', 'error');
      }
    } finally {
      setSavingId(null);
    }
  };

  const isSaved = (resourceUrl) => {
    return savedResources.some((r) => r.url === resourceUrl);
  };

  return (
    <div className="resource-library">
      {/* Header */}
      <div className="resource-header">
        <div className="resource-header-content">
          <h1>Resource Library</h1>
          <p>Discover curated learning resources to boost your studies</p>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'browse' ? 'active' : ''}`}
            onClick={() => {
              setView('browse');
              loadResources();
            }}
          >
            Browse
          </button>
          <button
            className={`toggle-btn ${view === 'saved' ? 'active' : ''}`}
            onClick={() => {
              setView('saved');
              loadSavedResources();
            }}
          >
            Saved ({savedResources.length})
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      {view === 'browse' && (
        <div className="resource-filters">
          {/* Search Bar */}
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            <button
              className={`tab ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Resources
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {loading ? (
        <div className="loading-container">
          <Loader className="loading-spinner" size={40} />
          <p>Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">
            <BookOpen size={40} />
          </p>
          <p className="empty-text">
            {view === 'saved' ? 'No saved resources yet' : 'No resources found'}
          </p>
          {view === 'saved' && (
            <button
              className="empty-action-btn"
              onClick={() => {
                setView('browse');
                loadResources();
              }}
            >
              Browse Resources
            </button>
          )}
        </div>
      ) : (
        <div className="resources-grid">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-card-header">
                <span className="resource-icon">
                  <BookOpen size={20} />
                </span>
                <button
                  className={`save-btn ${isSaved(resource.url) ? 'saved' : ''}`}
                  onClick={() => toggleSaveResource(resource.id, resource)}
                  disabled={savingId === resource.id}
                  title={isSaved(resource.url) ? 'Remove from library' : 'Add to library'}
                >
                  {savingId === resource.id ? (
                    <Loader size={18} className="spinning" />
                  ) : isSaved(resource.url) ? (
                    <BookmarkCheck size={18} />
                  ) : (
                    <Bookmark size={18} />
                  )}
                </button>
              </div>

              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-description">{resource.description}</p>

              <div className="resource-meta">
                <div className="category-badge">
                  {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                </div>
                <div className="rating">
                  Rating <span className="rating-num">{resource.rating}/5</span>
                </div>
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div className="resource-tags">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-btn"
              >
                <ExternalLink size={16} />
                Visit Resource
              </a>

              {resource.isPremium && (
                <div className="premium-badge">Premium</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
