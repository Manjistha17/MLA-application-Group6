import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/components/UserProfile.css";
import { Button } from "@mui/material";


const Profile = ({ currentUser }) => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        axios
            .get(`/api/auth/details/${currentUser}`)
            .then(res => setUserDetails(res.data))
            .catch(err => console.error("Error loading profile:", err))
            .finally(() => setLoading(false));
    }, [currentUser]);

    if (loading) {
        return (
            <div className="profilePage">
                <div className="profileCard">
                    <h2>Loading profile…</h2>
                    <p className="profileMuted">Fetching your details</p>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="profilePage">
                <div className="profileCard">
                    <h2>Something went wrong</h2>
                    <p className="profileMuted">Could not load your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profilePage">
            <div className="profileCard">
                {/* Header */}
                <div className="profileHeader">
                    <div className="profileAvatar">
                        {userDetails.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="profileHeaderText">
                        <h2>{userDetails.username}</h2>
                        <p className="profileMuted">{userDetails.email}</p>
                    </div>

                    <Button variant="outlined"
                        className="editProfileBtn"
                        onClick={() => (window.location.href = "/edit-profile")}>
                            Edit Profile
                    </Button>
                </div>

                <div className="profileDivider" />

                {/* Details */}
                <div className="profileDetailsGrid">
                    <div>
                        <span>Contact</span>
                        <strong>{userDetails.contact}</strong>
                    </div>
                    <div>
                        <span>Age</span>
                        <strong>{userDetails.age}</strong>
                    </div>
                    <div>
                        <span>Gender</span>
                        <strong>{userDetails.gender}</strong>
                    </div>
                    <div>
                        <span>Height</span>
                        <strong>{userDetails.height} cm</strong>
                    </div>
                    <div>
                        <span>Weight</span>
                        <strong>{userDetails.weight} kg</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
