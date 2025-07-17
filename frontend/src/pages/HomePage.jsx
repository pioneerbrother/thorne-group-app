import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Import the new stylesheet

function HomePage() {
  const navigate = useNavigate();

  // Function to handle the button click and navigate to the portal
  const handleAccessClick = () => {
    navigate('/portal'); 
  };

  // This is where you will list your "teaser" tweet threads.
  // Remember to replace the placeholder URL with the real URL of your tweet.
  const preliminaryFindings = [
    {
      id: 1,
      title: "Finding 1.0: Analysis of the Fort Hunter Liggett Anomaly",
      // IMPORTANT: Replace this placeholder with the actual URL to your X thread
    url: "https://x.com/ariisthorne/status/1945146830703964209" 
    },
    // {
    //   id: 2,
    //   title: "Finding 2.0: The 'Ghost Ship' - Covert Maritime Logistics",
    //   url: "https://x.com/ariisthorne/status/YOUR_OTHER_TWEET_ID_HERE"
    // }
  ];

  return (
    <div className="homepage-container">
      <div className="content-box">
        {/* The main header with the logo is now in App.jsx and will appear above this page content */}
        
        <h1 className="main-heading">The Thorne Analysis</h1>
        
        <p className="bio-manifesto">
          <strong>Ariis Thorne.</strong> "Geopolitical Analyst. 35 years tracking illicit capital and its influence on statecraft. I have found the nexus. 
           My research has led me to an unavoidable conclusion: a significant portion of the West's elite are not independent actors, but nodes in a privately-controlled network of influence maintained through systemic compromise. Traditional channels would suppress this data. I will be presenting my findings directly. The data will speak for itself."
        </p>
        
        <div className="findings-section">
          <h2 className="findings-title">Preliminary Findings</h2>
          <div className="findings-list">
            {preliminaryFindings.map(finding => (
              <a 
                key={finding.id} 
                href={finding.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="finding-link"
              >
                {finding.title}
              </a>
            ))}
          </div>
        </div>

        <button className="cta-button" onClick={handleAccessClick}>
          Access Intelligence Briefs
        </button>

      </div>
    </div>
  );
}

export default HomePage;