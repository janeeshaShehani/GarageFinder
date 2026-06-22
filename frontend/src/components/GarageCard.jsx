import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, ShieldCheck } from 'lucide-react';
import { checkIsOpen } from '../utils/dateHelper';

const GarageCard = ({ garage }) => {
  const isOpen = checkIsOpen(garage.openTime, garage.closeTime, garage.openDays);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Image Placeholder */}
      <div style={{
        height: '200px',
        backgroundColor: 'var(--medium-gray)',
        backgroundImage: garage.images && garage.images.length > 0 ? `url(${garage.images[0]})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {!garage.images || garage.images.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--dark-gray)'
          }}>No Image</div>
        )}
        {isOpen ? (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            backgroundColor: 'var(--success)', color: 'white',
            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
          }}>Open Now</span>
        ) : (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            backgroundColor: 'var(--danger)', color: 'white',
            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
          }}>Closed</span>
        )}
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-navy)' }}>{garage.garageName}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 600 }}>
            <Star size={16} fill="var(--warning)" />
            <span>{garage.rating ? garage.rating.toFixed(1) : 'New'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
          <MapPin size={16} /> {garage.address}, {garage.district}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {garage.services && garage.services.slice(0, 3).map((service, idx) => (
            <span key={idx} style={{
              backgroundColor: 'var(--light-gray)',
              color: 'var(--dark-navy)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>{service}</span>
          ))}
          {garage.services && garage.services.length > 3 && (
            <span style={{
              backgroundColor: 'var(--light-gray)', color: 'var(--dark-navy)',
              padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'
            }}>+{garage.services.length - 3} more</span>
          )}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Link to={`/garage/${garage._id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GarageCard;
