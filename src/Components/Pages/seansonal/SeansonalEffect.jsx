import React, { useEffect, useState } from 'react';
import './seansonal.css';
import winterImage from './seansnow.png'; // Qor parchasining tasviri
import autumnImage from './seanheaf.png'; // Kuz yaprog'ining tasviri
import springImage from './seanflow.png'; // Bahor guli tasviri

const SeasonalEffect = () => {
  const [season, setSeason] = useState(null);

  useEffect(() => {
    const month = new Date().getMonth() + 1; // JavaScriptda oylar 0 dan boshlanadi
    if ([12, 1, 2].includes(month)) {
      setSeason('winter');
    } else if ([3, 4, 5].includes(month)) {
      setSeason('spring');
    } else if ([9, 10, 11].includes(month)) {
      setSeason('autumn');
    } else if ([6, 7, 8].includes(month)) {
      setSeason('summer'); // Summer oylariga hech qanday effekt ko‘rsatmaymiz
    }
  }, []);

  const getEffect = () => {
    switch (season) {
      case 'winter':
        return <SnowEffect />;
      case 'spring':
        return <FlowEffect />;
      case 'autumn':
        return <HeafEffect />;
      default:
        return null; // Summerda hech qanday effekt ko‘rsatilmaydi
    }
  };

  return (
    <div className="fullscreen-overlay">
      {getEffect()}
    </div>
  );
};

const SnowEffect = () => {
  return (
    <div className="snowfall">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            backgroundImage: `url(${winterImage})`,
            width: `${Math.random() * 15 + 15}px`,
            height: `${Math.random() * 15 + 15}px`,
            left: `${Math.random() * 100}%`,
          }}
        ></div>
      ))}
    </div>
  );
};

const HeafEffect = () => {
  return (
    <div className="snowfall">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            backgroundImage: `url(${autumnImage})`,
            width: `${Math.random() * 15 + 15}px`,
            height: `${Math.random() * 15 + 15}px`,
            left: `${Math.random() * 100}%`,
          }}
        ></div>
      ))}
    </div>
  );
};

const FlowEffect = () => {
  return (
    <div className="snowfall">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            backgroundImage: `url(${springImage})`,
            width: `${Math.random() * 15 + 15}px`,
            height: `${Math.random() * 15 + 15}px`,
            left: `${Math.random() * 100}%`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default SeasonalEffect;
