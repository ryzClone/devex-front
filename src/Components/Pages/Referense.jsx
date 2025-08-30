import React from "react";
import "../style/Referense.css";

export default function Referense(props) {
  const successStyle = {
    backgroundColor: props.background ? "#c8f1cc" : "#ff6b6b",
    color: props.background ? "#2e7d32" : "white",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };
  return (
    <div className="Success" style={successStyle}>
      {props.title}
    </div>
  );
}
