import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import '../styles/ManageHostels.css';

const ManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    zip: '',
    googleMapsLink: '',
    facilities: {
      wifi: false,
      parking: false,
      laundry: false,
      security: false,
      mess: false,
    },
    pricing: {
      minRent: '',
      maxRent: '',
      securityDeposit: '',
    },
    rules: {
      smoking: false,
      alcohol: false,
      pets: false,
      visitingHours: false,
    },
    images: [] // New field for images
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  // Refresh the access token using the stored refresh token.
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) {
        console.error('No refresh token found');
        window.location.href = '/login';
        return null;
      }
      const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
      localStorage.setItem('token', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      window.location.href = '/login';
      return null;
    }
  };

  // Fetch the list of hostels.
  const fetchHostels = async () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) token = await refreshAccessToken();
      const response = await api.get('/hostel_owner/hostels/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error.response?.data || error.message);
    }
  };

  // Handle changes for both simple and nested fields.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('facilities.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          [field]: type === 'checkbox' ? checked : value,
        }
      }));
    } else if (name.includes('pricing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: value,
        }
      }));
    } else if (name.includes('rules.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        rules: {
          ...prev.rules,
          [field]: type === 'checkbox' ? checked : value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // Handle image upload, enforcing a maximum of 10 images.
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
        alert("You can upload a maximum of 10 images.");
        return;
    }
    
    console.log("✅ Selected Images:", files);  // ✅ Debugging

    setFormData((prev) => ({
        ...prev,
        images: files,  // ✅ Store images properly
    }));
};


  // Submit the form using FormData to include files and nested JSON fields.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        let token = localStorage.getItem('token');
        if (!token) token = await refreshAccessToken();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('address', formData.address);
        data.append('description', formData.description);
        data.append('phone', formData.phone || '');
        data.append('email', formData.email);
        data.append('established_year', formData.established_year || '');
        data.append('city', formData.city || '');
        data.append('state', formData.state || '');
        data.append('zip_code', formData.zip || '');
        data.append('google_maps_link', formData.googleMapsLink || '');
        data.append('nearby_colleges', formData.nearby_colleges || '');
        data.append('nearby_markets', formData.nearby_markets || '');
        
        // ✅ Ensure facilities are properly sent as boolean values
        data.append('wifi', formData.facilities.wifi ? 'true' : 'false');
        data.append('parking', formData.facilities.parking ? 'true' : 'false');
        data.append('laundry', formData.facilities.laundry ? 'true' : 'false');
        data.append('security_guard', formData.facilities.security_guard ? 'true' : 'false');
        data.append('mess_service', formData.facilities.mess_service ? 'true' : 'false');
        data.append('attached_bathroom', formData.facilities.attached_bathroom ? 'true' : 'false');
        data.append('air_conditioning', formData.facilities.air_conditioning ? 'true' : 'false');
        data.append('heater', formData.facilities.heater ? 'true' : 'false');
        data.append('balcony', formData.facilities.balcony ? 'true' : 'false');

        // ✅ Ensure pricing values are correctly added
        data.append('rent_min', formData.pricing.minRent || '');
        data.append('rent_max', formData.pricing.maxRent || '');
        data.append('security_deposit', formData.pricing.securityDeposit || '');
        
        // ✅ Append rules
        data.append('smoking_allowed', formData.rules.smoking ? 'true' : 'false');
        data.append('alcohol_allowed', formData.rules.alcohol ? 'true' : 'false');
        data.append('pets_allowed', formData.rules.pets ? 'true' : 'false');
        data.append('visiting_hours', formData.rules.visitingHours || '');

        // ✅ Ensure images are uploaded correctly
        
        if (formData.images && formData.images.length > 0) {
            formData.images.forEach((image) => {
                data.append("images", image, image.name);  // ✅ Append image file with name
            });
        } else {
            console.warn("No images selected.");
        }
        const response = await api.post('/hostel_owner/hostels/', data, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });

        console.log("Response:", response.data); // ✅ Debug Response
        fetchHostels(); // ✅ Refresh data immediately after adding
    } catch (error) {
        console.error('Error adding hostel:', error.response?.data || error.message);
        alert(`Failed to add hostel: ${JSON.stringify(error.response?.data || error.message)}`);
    }
};



  return (
    <div className="manage-hostels-container">
      
    {/* ✅ Navigation Bar (Copied from ManageRooms.js) */}
    <nav className="dashboard-nav">
      <h1>Hostel Owner Dashboard</h1>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/manage-hostels">Manage Hostels</Link></li>
        <li><Link to="/manage-rooms">Manage Rooms</Link></li>
        <li><Link to="/bookings">Bookings</Link></li>
        <li><Link to="/students">Students</Link></li>
        <li><Link to="/feedback">Feedback</Link></li>
        <li><button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button></li>
      </ul>
    </nav>
   
    <div className="manage-hostels-container">
      <h1>Manage Hostels</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone:</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>City:</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} />
        </div>
        <div>
          <label>State:</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} />
        </div>
        <div>
          <label>Zip Code:</label>
          <input type="text" name="zip" value={formData.zip} onChange={handleChange} />
        </div>
        <div>
          <label>Google Maps Link:</label>
          <input type="url" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} />
        </div>
        <div>
        <label>Established Year:</label>
        <input type="text" name="established_year" value={formData.established_year} onChange={handleChange} />

        <label>Nearby Colleges:</label>
        <input type="text" name="nearby_colleges" value={formData.nearby_colleges} onChange={handleChange} />

        <label>Nearby Markets:</label>
        <input type="text" name="nearby_markets" value={formData.nearby_markets} onChange={handleChange} />
        </div>
        <div>
          <h3>Facilities</h3>
          <label>
            <input type="checkbox" name="facilities.wifi" checked={formData.facilities.wifi} onChange={handleChange} />
            WiFi
          </label>
          <label>
            <input type="checkbox" name="facilities.parking" checked={formData.facilities.parking} onChange={handleChange} />
            Parking
          </label>
          <label>
            <input type="checkbox" name="facilities.laundry" checked={formData.facilities.laundry} onChange={handleChange} />
            Laundry
          </label>
          <label>
            <input type="checkbox" name="facilities.security" checked={formData.facilities.security} onChange={handleChange} />
            Security Guard
          </label>
          <label>
            <input type="checkbox" name="facilities.mess" checked={formData.facilities.mess} onChange={handleChange} />
            Mess Service
          </label>
          
        </div>
        <div>
          <h3>Pricing Details</h3>
          <label>Min Rent:</label>
          <input type="number" name="pricing.minRent" value={formData.pricing.minRent} onChange={handleChange} />
          <label>Max Rent:</label>
          <input type="number" name="pricing.maxRent" value={formData.pricing.maxRent} onChange={handleChange} />
          <label>Security Deposit:</label>
          <input type="number" name="pricing.securityDeposit" value={formData.pricing.securityDeposit} onChange={handleChange} />
        </div>
        <div>
          <h3>Rules</h3>
          <label>
            <input type="checkbox" name="rules.smoking" checked={formData.rules.smoking} onChange={handleChange} />
            Smoking Allowed
          </label>
          <label>
            <input type="checkbox" name="rules.alcohol" checked={formData.rules.alcohol} onChange={handleChange} />
            Alcohol Allowed
          </label>
          <label>
            <input type="checkbox" name="rules.pets" checked={formData.rules.pets} onChange={handleChange} />
            Pets Allowed
          </label>
          <label>
            <input type="checkbox" name="rules.visitingHours" checked={formData.rules.visitingHours} onChange={handleChange} />
            Visiting Hours Restricted
          </label>
        </div>
        <div>
    <label>Upload Images (max 10):</label>
    <input type="file" multiple onChange={handleImageUpload} accept="image/*" />
</div>

        <button type="submit">Add Hostel</button>
      </form>
      <hr />
      <h3>Hostel List</h3>
    
<table className="hostel-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Address</th>
      <th>Description</th>
      <th>Owner</th>
      <th>Contact</th>
      <th>Email</th>
      <th>City</th>
      <th>State</th>
      <th>Zip Code</th>
      <th>Google Maps</th>
      <th>Rent Range</th>
      <th>Security Deposit</th>
      <th>Facilities</th>
      <th>Rules</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {hostels.map(hostel => (
      <tr key={hostel.id}>
        <td>{hostel.name || '-'}</td>
        <td>{hostel.address || '-'}</td>
        <td>{hostel.description || '-'}</td>
        <td>{hostel.owner || '-'}</td>
        <td>{hostel.contact_number ? hostel.contact_number : '-'}</td>
        <td>{hostel.email || '-'}</td>
        <td>{hostel.city || '-'}</td>
        <td>{hostel.state || '-'}</td>
        <td>{hostel.zip_code || '-'}</td>
        <td>
          {hostel.google_maps_link ? (
            <a href={hostel.google_maps_link} target="_blank" rel="noopener noreferrer">
              View Map
            </a>
          ) : '-'}
        </td>
        <td>
          {hostel.rent_min && hostel.rent_max ? `${hostel.rent_min} - ${hostel.rent_max}` : '-'}
        </td>
        <td>{hostel.security_deposit || '-'}</td>
        <td>
          {hostel.wifi && 'WiFi, '}
          {hostel.parking && 'Parking, '}
          {hostel.laundry && 'Laundry, '}
          {hostel.security_guard && 'Security Guard, '}
          {hostel.mess_service && 'Mess Service, '}
          {hostel.attached_bathroom && 'Attached Bathroom, '}
          {hostel.air_conditioning && 'AC, '}
          {hostel.heater && 'Heater, '}
          {hostel.balcony && 'Balcony'}
          {!(hostel.wifi || hostel.parking || hostel.laundry || hostel.security_guard || hostel.mess_service || hostel.attached_bathroom || hostel.air_conditioning || hostel.heater || hostel.balcony) ? '-' : ''}
        </td>
        <td>
          {hostel.smoking_allowed && 'Smoking Allowed, '}
          {hostel.alcohol_allowed && 'Alcohol Allowed, '}
          {hostel.pets_allowed && 'Pets Allowed, '}
          {hostel.visiting_hours ? `Visiting Hours: ${hostel.visiting_hours}` : ''}
          {!(hostel.smoking_allowed || hostel.alcohol_allowed || hostel.pets_allowed || hostel.visiting_hours) ? '-' : ''}
        </td>
        <td>
          <button className="edit-btn">Edit</button>
          <button className="delete-btn">Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


    </div>
    </div>
    
    
  );
};

export default ManageHostels;
