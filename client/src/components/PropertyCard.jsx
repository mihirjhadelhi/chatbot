import './PropertyCard.css';

const PropertyCard = ({ property, onSave, onRemove, isSaved, onCompare, isComparing }) => {
  const prop = property._id ? property : property;

  return (
    <div className="property-card">
      {prop.image_url && (
        <div className="property-image">
          <img src={prop.image_url} alt={`Property ${prop.id}`} />
        </div>
      )}
      <div className="property-content">
        <h4>Property #{prop.id}</h4>
        <div className="property-details">
          <span>🛏️ {prop.bedrooms || 'N/A'} Bedrooms</span>
          <span>🚿 {prop.bathrooms || 'N/A'} Bathrooms</span>
          <span>📐 {prop.size_sqft || 'N/A'} sqft</span>
        </div>
        {prop.amenities && prop.amenities.length > 0 && (
          <div className="property-amenities">
            <strong>Amenities:</strong>
            <div className="amenities-list">
              {prop.amenities.map((amenity, idx) => (
                <span key={idx} className="amenity-tag">{amenity}</span>
              ))}
            </div>
          </div>
        )}
        <div className="property-actions">
          {isSaved ? (
            <button className="remove-btn" onClick={onRemove}>
              ❌ Remove from Saved
            </button>
          ) : (
            <button className="save-btn" onClick={onSave}>
              ⭐ Save Property
            </button>
          )}
          <button 
            className={isComparing ? "compare-btn active" : "compare-btn"}
            onClick={() => onCompare && onCompare(prop)}
          >
            {isComparing ? '✓ Comparing' : '📊 Compare'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;