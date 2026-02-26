import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/GroupFeed.css"; // optional CSS

const GroupFeed = ({ groupId, limit = 50 }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!groupId) return;

    const fetchFeed = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`http://16.171.162.5:8005/groups/${groupId}/feed`, {
          params: { limit },
        });

        if (Array.isArray(response.data)) {
          setFeedItems(response.data);
        } else {
          setFeedItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch group feed:", err);
        setError("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [groupId, limit]);

  if (loading) return <p className="loading-text">Loading feed...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!feedItems.length) return <p className="empty-text">No feed items yet.</p>;

  return (
    <div className="group-feed-wrapper">
      {feedItems.map(item => (
        <div key={item.feed_id} className="feed-item">
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          <small>
            {new Date(item.createdAt).toLocaleString()} • Type: {item.type}
          </small>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default GroupFeed;