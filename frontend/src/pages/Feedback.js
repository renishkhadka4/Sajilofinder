import React, { useState } from 'react';
import api from '../api/axios';

const SubmitFeedback = ({ hostelId }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        try {
            let token = localStorage.getItem('token');
            await api.post('/students/feedback/', {
                hostel_id: hostelId,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Feedback submitted successfully!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div>
            <h2>Submit Feedback</h2>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num} Stars</option>
                ))}
            </select>
            <textarea placeholder="Write your feedback" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default SubmitFeedback;
