import { useState, useEffect, useRef, useCallback } from 'react';
import { propertyService, preferenceService, nlpService } from '../services/api';
import PropertyCard from './PropertyCard';
import PropertyComparison from './PropertyComparison';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi! I'm AgentMeera, your real estate assistant. I can help you find properties using natural language! Try saying 'I need a 3 bedroom house under $500000' or use the filters below." }
  ]);
  const [input, setInput] = useState('');
  const [filters, setFilters] = useState({
    budget: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    minSize: '',
    maxSize: '',
    amenities: ''
  });
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [comparedProperties, setComparedProperties] = useState([]);
  const [userId] = useState(() => `user_${Date.now()}`);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadSavedProperties();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        performRealTimeSearch(searchQuery);
      }, 500); // 500ms debounce
    } else if (searchQuery.trim().length === 0) {
      setProperties([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSavedProperties = async () => {
    try {
      const response = await preferenceService.getPreferences(userId);
      if (response.success && response.data) {
        setSavedProperties(response.data.savedProperties || []);
      }
    } catch (error) {
      console.error('Error loading saved properties:', error);
    }
  };

  const performRealTimeSearch = async (query) => {
    try {
      // Use NLP to extract filters from query
      const nlpResponse = await nlpService.extractFilters(query, messages);
      if (nlpResponse.success && nlpResponse.data) {
        const extractedFilters = nlpResponse.data;
        const searchFilters = {
          ...filters,
          ...Object.fromEntries(
            Object.entries(extractedFilters).filter(([_, v]) => v !== null)
          )
        };
        
        const response = await propertyService.getProperties(searchFilters);
        if (response.success) {
          setProperties(response.data || []);
        }
      }
    } catch (error) {
      console.error('Real-time search error:', error);
    }
  };

  const handleSearch = async (searchFilters = null) => {
    const activeFilters = searchFilters || filters;
    
    if (!activeFilters.budget && !activeFilters.bedrooms && !activeFilters.location) {
      addMessage('bot', 'Please provide at least one filter (budget, bedrooms, or location)');
      return;
    }

    setIsLoading(true);
    addMessage('user', `Looking for properties...`);
    addMessage('bot', '🔍 Searching for properties...');

    try {
      const response = await propertyService.getProperties(activeFilters);
      
      if (response.success && response.data.length > 0) {
        setProperties(response.data);
        
        // Generate AI response
        const aiResponse = await nlpService.generateResponse(
          `Found ${response.data.length} properties`,
          { propertiesFound: response.data.length }
        );
        addMessage('bot', aiResponse.data);

        // Save search to history
        await preferenceService.savePreferences(userId, {
          searchHistory: activeFilters,
          preferences: activeFilters
        });
      } else {
        
        const aiResponse = await nlpService.generateResponse(
          'No properties found',
          { propertiesFound: 0 }
        );
        addMessage('bot', aiResponse.data);
        setProperties([]);
      }
    } catch (error) {
      addMessage('bot', 'Sorry, there was an error searching for properties.');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProperty = async (propertyId) => {
    try {
      await preferenceService.saveProperty(userId, propertyId);
      await loadSavedProperties();
      addMessage('bot', '✅ Property saved to your favorites!');
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const handleRemoveProperty = async (propertyId) => {
    try {
      await preferenceService.removeProperty(userId, propertyId);
      await loadSavedProperties();
      addMessage('bot', 'Property removed from favorites.');
    } catch (error) {
      console.error('Error removing property:', error);
    }
  };

  const handleCompareProperty = (property) => {
    const propId = property._id || property.id;
    const isAlreadyComparing = comparedProperties.some(
      p => (p._id || p.id) === propId
    );

    if (isAlreadyComparing) {
      setComparedProperties(prev => 
        prev.filter(p => (p._id || p.id) !== propId)
      );
      addMessage('bot', 'Property removed from comparison.');
    } else {
      if (comparedProperties.length >= 4) {
        addMessage('bot', 'You can compare up to 4 properties at once. Remove one to add another.');
        return;
      }
      setComparedProperties(prev => [...prev, property]);
      addMessage('bot', 'Property added to comparison!');
    }
  };

  const handleRemoveFromComparison = (propertyId) => {
    if (propertyId === 'all') {
      setComparedProperties([]);
      addMessage('bot', 'Comparison cleared.');
    } else {
      setComparedProperties(prev => 
        prev.filter(p => (p._id || p.id) !== propertyId)
      );
    }
  };

  const addMessage = (type, text) => {
    const safe =
      typeof text === 'string'
        ? text
        : text == null
        ? ''
        : typeof text === 'object'
        ? JSON.stringify(text)
        : String(text);
    setMessages(prev => [...prev, { type, text: safe }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage = input.trim();
      addMessage('user', userMessage);
      setIsLoading(true);

      try {
        // Use NLP to understand user intent
        const nlpResponse = await nlpService.extractFilters(userMessage, messages);
        
        if (nlpResponse.success && nlpResponse.data) {
          const extractedFilters = nlpResponse.data;
          const intent = extractedFilters.intent || 'general';

          if (intent === 'search' || Object.keys(extractedFilters).some(k => k !== 'intent' && extractedFilters[k] !== null)) {
            // Update filters with extracted data
            const newFilters = {
              ...filters,
              ...Object.fromEntries(
                Object.entries(extractedFilters).filter(([k, v]) => k !== 'intent' && v !== null)
              )
            };
            setFilters(newFilters);
            
            // Perform search with extracted filters
            await handleSearch(newFilters);
          } else {
            // Generate AI response for general queries
            const aiResponse = await nlpService.generateResponse(userMessage);
            addMessage('bot', aiResponse);
          }
        } else {
          addMessage('bot', "I'm here to help! Try describing what you're looking for, or use the filters below.");
        }
      } catch (error) {
        console.error('NLP Error:', error);
        addMessage('bot', "I'm here to help! Try describing what you're looking for, or use the filters below.");
      } finally {
        setIsLoading(false);
        setInput('');
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>🏠 Real Estate Assistant - AgentMeera</h2>
        <button 
          className="toggle-filters-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Real-Time Search:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search properties in real-time..."
              className="realtime-search-input"
            />
          </div>
          <div className="filter-group">
            <label>Budget ($):</label>
            <input
              type="number"
              value={filters.budget}
              onChange={(e) => setFilters({...filters, budget: e.target.value})}
              placeholder="Max budget"
            />
          </div>
          <div className="filter-group">
            <label>Location:</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              placeholder="City or area"
            />
          </div>
          <div className="filter-group">
            <label>Bedrooms:</label>
            <input
              type="number"
              value={filters.bedrooms}
              onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
              placeholder="Min bedrooms"
            />
          </div>
          <div className="filter-group">
            <label>Bathrooms:</label>
            <input
              type="number"
              value={filters.bathrooms}
              onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
              placeholder="Min bathrooms"
            />
          </div>
          <div className="filter-group">
            <label>Size (sqft):</label>
            <input
              type="number"
              value={filters.minSize}
              onChange={(e) => setFilters({...filters, minSize: e.target.value})}
              placeholder="Min size"
              style={{ width: '45%', marginRight: '5%' }}
            />
            <input
              type="number"
              value={filters.maxSize}
              onChange={(e) => setFilters({...filters, maxSize: e.target.value})}
              placeholder="Max size"
              style={{ width: '45%' }}
            />
          </div>
          <button 
            className="search-btn" 
            onClick={() => handleSearch()}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Searching...' : '🔍 Search Properties'}
          </button>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">🤔 Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything! e.g., 'Find me a 3 bedroom house under $500k'"
          className="chat-input"
          disabled={isLoading}
        />
        <button type="submit" className="send-btn" disabled={isLoading}>
          {isLoading ? '⏳' : 'Send'}
        </button>
      </form>

      {comparedProperties.length > 0 && (
        <PropertyComparison 
          properties={comparedProperties}
          onRemove={handleRemoveFromComparison}
        />
      )}

      {properties.length > 0 && (
        <div className="properties-section">
          <h3>Search Results ({properties.length})</h3>
          <div className="properties-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onSave={() => handleSaveProperty(property._id)}
                onRemove={() => handleRemoveProperty(property._id)}
                onCompare={handleCompareProperty}
                isSaved={savedProperties.some(sp => sp._id === property._id || sp.toString() === property._id)}
                isComparing={comparedProperties.some(cp => (cp._id || cp.id) === (property._id || property.id))}
              />
            ))}
          </div>
        </div>
      )}

      {savedProperties.length > 0 && (
        <div className="saved-properties-section">
          <h3>Your Saved Properties ({savedProperties.length})</h3>
          <div className="properties-grid">
            {savedProperties.map((property) => (
              <PropertyCard
                key={property._id || property.id}
                property={property}
                onRemove={() => handleRemoveProperty(property._id)}
                onCompare={handleCompareProperty}
                isSaved={true}
                isComparing={comparedProperties.some(cp => (cp._id || cp.id) === (property._id || property.id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;