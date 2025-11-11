import './PropertyComparison.css';

const PropertyComparison = ({ properties, onRemove }) => {
  if (properties.length === 0) return null;

  const getPropertyValue = (prop, field) => {
    return prop[field] || prop._id?.[field] || 'N/A';
  };

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h3>📊 Property Comparison ({properties.length})</h3>
        <button className="clear-comparison-btn" onClick={() => onRemove('all')}>
          Clear All
        </button>
      </div>
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Property</th>
              {properties.map((prop, idx) => (
                <th key={prop._id || prop.id || idx} className="property-column">
                  <button 
                    className="remove-compare-btn"
                    onClick={() => onRemove(prop._id || prop.id)}
                    title="Remove from comparison"
                  >
                    ✕
                  </button>
                  <div className="property-header">
                    {getPropertyValue(prop, 'image_url') && (
                      <img 
                        src={getPropertyValue(prop, 'image_url')} 
                        alt={`Property ${getPropertyValue(prop, 'id')}`}
                        className="compare-image"
                      />
                    )}
                    <span>Property #{getPropertyValue(prop, 'id')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="comparison-label">🛏️ Bedrooms</td>
              {properties.map((prop, idx) => (
                <td key={idx}>{getPropertyValue(prop, 'bedrooms')}</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">🚿 Bathrooms</td>
              {properties.map((prop, idx) => (
                <td key={idx}>{getPropertyValue(prop, 'bathrooms')}</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">📐 Size (sqft)</td>
              {properties.map((prop, idx) => (
                <td key={idx}>{getPropertyValue(prop, 'size_sqft')}</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">💰 Price</td>
              {properties.map((prop, idx) => (
                <td key={idx}>${getPropertyValue(prop, 'price') || 'N/A'}</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">📍 Location</td>
              {properties.map((prop, idx) => (
                <td key={idx}>{getPropertyValue(prop, 'location') || 'N/A'}</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">✨ Amenities</td>
              {properties.map((prop, idx) => (
                <td key={idx}>
                  <div className="amenities-compare">
                    {getPropertyValue(prop, 'amenities')?.map((amenity, aIdx) => (
                      <span key={aIdx} className="amenity-badge">{amenity}</span>
                    )) || 'N/A'}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyComparison;