// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../styles/components/GroupFeed.css"; // optional CSS

// const GroupFeed = ({ groupId = "g_public_001", limit = 50 }) => {
//   const [feedItems, setFeedItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!groupId) return;

//     const fetchFeed = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const response = await axios.get(`http://16.171.162.5:8005/groups/${groupId}/feed`, {
//           params: { limit },
//         });

//         if (Array.isArray(response.data)) {
//           setFeedItems(response.data);
//         } else {
//           setFeedItems([]);
//         }
//       } catch (err) {
//         console.error("Failed to fetch group feed:", err);
//         setError("Failed to load feed.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeed();
//   }, [groupId, limit]);

//   if (loading) return <p className="loading-text">Loading feed...</p>;
//   if (error) return <p className="error-text">{error}</p>;
//   if (!feedItems.length) return <p className="empty-text">No feed items yet.</p>;

//   return (
//     <div className="group-feed-wrapper">
//       {feedItems.map(item => (
//         <div key={item.feed_id} className="feed-item">
//           <h4>{item.title}</h4>
//           <p>{item.description}</p>
//           <small>
//             {new Date(item.createdAt).toLocaleString()} • Type: {item.type}
//           </small>
//           <hr />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default GroupFeed;
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/GroupFeed.css";

// Simple SVG icons for types and clock
const icons = {
  EXERCISE_LOG: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="#4caf50"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#4caf50"
    >
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM11 6h2v6h-2V6zm0 8h2v2h-2v-2z" />
    </svg>
  ),
  AWARDED_BADGE: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="#ff9800"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#ff9800"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  CLOCK: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="#999"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#999"
    >
      <circle cx="12" cy="12" r="10" stroke="none" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
};

const GroupFeed = () => {
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await axios.get(
          "http://16.171.162.5:8005/groups/g_public_001/feed"
        );
        setFeedItems(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="group-feed-wrapper">
      <h2>Group Feed</h2>
      {feedItems.length === 0 && <p className="empty-text">No feed items yet.</p>}
      {feedItems.map((item) => (
        <div key={item.feed_id} className="feed-item">
          <div className="feed-item-header">
            <div className="feed-icon">{icons[item.type] || null}</div>
            <h4>{item.title}</h4>
          </div>
          <p>{item.description}</p>
          <small>
            {icons.CLOCK} {new Date(item.createdAt).toLocaleString()} • Type: {item.type}
          </small>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default GroupFeed;