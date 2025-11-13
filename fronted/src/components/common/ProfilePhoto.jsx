//Direccion
// Componente de foto de perfil

import React from 'react';
import colors from '../../assets/Colors';

const ProfilePhoto = ({ imageUrl, size = '150px', borderColor = colors.white }) => {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: `2px solid ${borderColor}`,
    boxShadow: `0px 0px 15px ${colors.primary}`,
    margin: '80px 0',
    position: 'relative',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };

  return (
    <div style={circleStyle}>
      <img src={imageUrl} alt="Profile" style={imageStyle} />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: '20',
      }}>
      </div>
    </div>
  );
};

export default ProfilePhoto;