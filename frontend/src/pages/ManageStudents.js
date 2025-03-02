import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const ManageStudents = ({ selectedHostel }) => {
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedHostel) {
            fetchStudents();
        }
    }, [selectedHostel]);

    const fetchStudents = async () => {
        try {
            let token = localStorage.getItem("token");
            if (!selectedHostel) return; // Prevent fetching if hostel is not selected
            
            const response = await api.get(`/hostel_owner/hostels/${selectedHostel}/students/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudents(response.data.students);
        } catch (error) {
            console.error("Error fetching students:", error.response?.data || error.message);
        }
    };

    return (
        <div className="manage-students-container">
            <h1>Confirmed Students</h1>
            {students.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No students have been confirmed for this hostel.</p>
            )}
        </div>
    );
};

export default ManageStudents;
