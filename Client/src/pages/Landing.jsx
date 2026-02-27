import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";
import AnimatedContent from '../components/Buttonsbit.jsx';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-bg">
      <div className="landing-overlay" />
      <div className="landing-content">
        <h1 className="landing-title">RELIC RUSH</h1>
        <h2 className="landing-subtitle">
          The Quest for the True Relic Begins
        </h2>
        <AnimatedContent
          distance={100}
          direction="vertical"
          reverse={false}
          duration={0.8}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1}
          threshold={0.1}
          delay={0}
        >
          <button
            className="landing-btn"
            onClick={() => navigate("/login")}
          >
            Start Journey
          </button>
        </AnimatedContent>
      </div>
    </div>
  );
};

export default Landing;
