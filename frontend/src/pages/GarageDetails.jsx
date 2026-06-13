import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Mail, Check, Navigation } from 'lucide-react';
import { checkIsOpen } from '../utils/dateHelper';

const GarageDetails = () => {
  const { id } = useParams();
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reviews database integration
  const [reviews, setReviews] = useState([]);

  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchGarageAndReviews = async () => {
    try {
      // 1. Fetch garage details by ID (which also increments views on backend)
      const garageRes = await fetch(`http://localhost:5000/api/garage/${id}`);
      const garageData = await garageRes.json();
      
      if (garageRes.ok) {
        setGarage({
          ...garageData,
          openStatus: checkIsOpen(garageData.openTime, garageData.closeTime, garageData.openDays),
          openingHours: garageData.openTime ? `${garageData.openTime} - ${garageData.closeTime}` : 'Mon-Sat: 8:00 AM - 6:00 PM'
        });
      }

      // 2. Fetch reviews from MongoDB
      const reviewsRes = await fetch(`http://localhost:5000/api/reviews?garageId=${id}`);
      const reviewsData = await reviewsRes.json();
      if (reviewsRes.ok) {
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error loading garage details & reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasIncremented = useRef(false);

  useEffect(() => {
    setLoading(true);
    fetchGarageAndReviews();
  }, [id]);

  useEffect(() => {
    const incrementGarageViews = async () => {
      try {
        await fetch(`http://localhost:5000/api/garage/${id}/view`, { method: "POST" });
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    };

    if (id && !hasIncremented.current) {
      hasIncremented.current = true;
      incrementGarageViews();
    }
  }, [id]);

  const handleGetDirections = () => {
    if (!garage) return;
    const query = encodeURIComponent(`${garage.garageName}, ${garage.address}, ${garage.district}, Sri Lanka`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      const payload = {
        garageId: id,
        userId: currentUser?.id || currentUser?._id,
        rating: selectedRating,
        comment: reviewText
      };

      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh the page data
        await fetchGarageAndReviews();
        setReviewText('');
        setSelectedRating(5);
        alert('Thank you! Your feedback has been registered and the rating updated.');
      } else {
        alert(`Failed to submit review: ${data.message}`);
      }
    } catch (error) {
      console.error("Review submission error:", error);
      alert("Network error: Could not submit review to backend.");
    }
  };

  if (loading) return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading garage details...</div>;
  if (!garage) return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Garage not found</div>;

  const galleryImages = (garage.images && garage.images.length > 0)
    ? garage.images
    : [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=800&q=80'
      ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header/Cover Section */}
      <div style={{
        height: '300px',
        backgroundColor: 'var(--dark-navy)',
        backgroundImage: `url(${galleryImages[0]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10, 17, 40, 0.9), rgba(10, 17, 40, 0.3))'
        }}></div>
        <div className="container" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: '40px',
          color: 'white', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              {garage.openStatus ? (
                <span style={{ backgroundColor: 'var(--success)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Open Now</span>
              ) : (
                <span style={{ backgroundColor: 'var(--danger)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Closed</span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 600 }}>
                <Star size={18} fill="var(--warning)" /> {garage.rating} ({garage.numReviews} Reviews)
              </span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{garage.garageName}</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', opacity: 0.9 }}>
              <MapPin size={18} /> {garage.address}, {garage.district}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleGetDirections} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} /> Get Directions
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="details-grid">
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* About */}
            <div className="card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--dark-navy)' }}>About</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{garage.description}</p>
            </div>

            {/* Services */}
            <div className="card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--dark-navy)' }}>Services Offered</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {garage.services.map((service, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Check size={18} color="var(--success)" /> {service}
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Types */}
            <div className="card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--dark-navy)' }}>Supported Vehicles</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {garage.vehicleTypes.map((type, idx) => (
                  <span key={idx} style={{ padding: '8px 16px', backgroundColor: 'var(--light-gray)', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Garage Gallery */}
            <div className="card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--dark-navy)' }}>Garage Gallery</h2>
              <div className="gallery-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '20px' 
              }}>
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="gallery-image-container" style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    aspectRatio: '4/3',
                    boxShadow: 'var(--shadow-sm)',
                    backgroundColor: 'var(--light-gray)'
                  }}>
                    <img 
                      src={imgUrl} 
                      alt={`${garage.garageName} Gallery ${idx + 1}`} 
                      className="gallery-img"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                    <div className="gallery-overlay" style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(10, 17, 40, 0.4)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none'
                    }}>
                      <span style={{
                        color: 'white',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                      }}>
                        View Photo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews & Feedback Section */}
            <div className="card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', color: 'var(--dark-navy)' }}>Customer Reviews</h2>
              
              {/* Write a Review Card */}
              <div style={{ 
                padding: '24px', 
                backgroundColor: 'var(--light-gray)', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '30px',
                border: '1px solid var(--medium-gray)'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px', color: 'var(--dark-navy)' }}>
                  Give Feedback & Rating
                </h3>

                {currentUser ? (
                  <form onSubmit={handleReviewSubmit}>
                    {/* Star Rating Picker */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Your Rating:
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const isFilled = starValue <= (hoverRating || selectedRating);
                          return (
                            <button
                              type="button"
                              key={starValue}
                              onClick={() => setSelectedRating(starValue)}
                              onMouseEnter={() => setHoverRating(starValue)}
                              onMouseLeave={() => setHoverRating(0)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                transition: 'transform 0.15s ease',
                                transform: hoverRating === starValue ? 'scale(1.2)' : 'scale(1)'
                              }}
                            >
                              <Star
                                size={28}
                                fill={isFilled ? 'var(--warning)' : 'none'}
                                color={isFilled ? 'var(--warning)' : 'var(--dark-gray)'}
                                style={{ transition: 'color 0.15s ease, fill 0.15s ease' }}
                              />
                            </button>
                          );
                        })}
                        <span style={{ marginLeft: '10px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {selectedRating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    {/* Review Comments */}
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="reviewComment" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Your Review Comment:
                      </label>
                      <textarea
                        id="reviewComment"
                        rows="4"
                        placeholder="Write your experience at this garage... What did you like or what could be improved?"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid var(--medium-gray)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--primary-blue)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--medium-gray)';
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Submit Feedback
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1rem' }}>
                      Only registered users can submit feedback and ratings for garages.
                    </p>
                    <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                      Log In to Review
                    </Link>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '20px', color: 'var(--dark-navy)' }}>
                  Recent Reviews ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    No reviews yet. Be the first to share your feedback!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {reviews.map((rev) => {
                      // Generate background color based on name initials
                      const reviewerName = rev.user?.name || rev.name || 'Anonymous User';
                      const firstChar = reviewerName ? reviewerName.charAt(0).toUpperCase() : 'A';
                      const charCode = firstChar.charCodeAt(0);
                      const colors = [
                        '#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', 
                        '#FF375F', '#64D2FF', '#ffd60a', '#5e5ce6'
                      ];
                      const avatarBg = colors[charCode % colors.length];

                      const reviewDate = rev.createdAt ? new Date(rev.createdAt).toISOString().split('T')[0] : (rev.date || '');

                      return (
                        <div key={rev._id || rev.id} style={{ 
                          padding: '20px', 
                          borderBottom: '1px solid var(--medium-gray)',
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'flex-start'
                        }}>
                          {/* Reviewer Avatar */}
                          <div style={{ 
                            width: '45px', 
                            height: '45px', 
                            borderRadius: '50%', 
                            backgroundColor: avatarBg, 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 700, 
                            fontSize: '1.1rem',
                            flexShrink: 0
                          }}>
                            {firstChar}
                          </div>

                          {/* Review Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--dark-navy)' }}>
                                {reviewerName}
                              </h4>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {reviewDate}
                              </span>
                            </div>

                            {/* Stars rating */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={16} 
                                  fill={star <= rev.rating ? 'var(--warning)' : 'none'} 
                                  color={star <= rev.rating ? 'var(--warning)' : 'var(--dark-gray)'} 
                                />
                              ))}
                            </div>

                            {/* Comment */}
                            <p style={{ color: 'var(--text-primary)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                              {rev.comment}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--dark-navy)' }}>Contact Info</h3>
              
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <MapPin size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Address</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{garage.address}, {garage.district}</span>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Phone size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Phone</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{garage.phone}</span>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Mail size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Email</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{garage.email}</span>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Clock size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Opening Hours</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{garage.openingHours}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media (min-width: 992px) {
          .details-grid { grid-template-columns: 2fr 1fr !important; }
        }
        .gallery-image-container:hover .gallery-img {
          transform: scale(1.08);
        }
        .gallery-image-container:hover .gallery-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default GarageDetails;
