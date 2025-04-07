import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, RefreshCw, Check, X, ChevronDown, ChevronUp, Eye } from "lucide-react";

const AdminManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHostel, setExpandedHostel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const token = localStorage.getItem("token");

  const fetchPendingHostels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pending-hostels/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHostels(res.data);
    } catch (error) {
      toast.error("Failed to load hostels");
      console.error("Error fetching hostels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(
        `/admin/approve-hostel/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hostel approved successfully");
      fetchPendingHostels();
    } catch (error) {
      toast.error("Failed to approve hostel");
    }
  };

  const handleReject = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to reject this hostel?"
    );
    if (!confirm) return;

    try {
      await api.patch(
        `/admin/reject-hostel/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hostel rejected and email sent to owner");
      fetchPendingHostels();
    } catch (error) {
      toast.error("Failed to reject hostel");
    }
  };

  const toggleExpand = (id) => {
    setExpandedHostel(expandedHostel === id ? null : id);
  };

  const filteredHostels = hostels.filter(
    (hostel) =>
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchPendingHostels();
  }, []);

  // Format facilities to be more readable
  const formatFacilities = (hostel) => {
    const facilities = [
      hostel.wifi && "WiFi",
      hostel.parking && "Parking",
      hostel.laundry && "Laundry",
      hostel.security_guard && "Security Guard",
      hostel.mess_service && "Mess",
      hostel.attached_bathroom && "Attached Bathroom",
      hostel.air_conditioning && "AC",
      hostel.heater && "Heater",
      hostel.balcony && "Balcony",
    ].filter(Boolean);

    return facilities.length > 0 ? facilities.join(", ") : "None";
  };

  // Image Viewer Modal
  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="text-xl font-semibold">Hostel Image</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-4 flex justify-center">
            <img
              src={image}
              alt="Hostel Image"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      </div>
    );
  };

  // Admin Sidebar Component
  const AdminSidebar = () => {
    return (
      <div className="w-48 min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="p-4 bg-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <div className="font-medium">Admin</div>
            <div className="text-xs text-gray-400">Administrator</div>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="font-medium text-gray-300">Admin Panel</div>
        </div>
        
        <nav className="flex-1">
          <ul>
            <li>
              <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Users
              </a>
            </li>
            <li>
              <a href="/admin/feedback" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                Feedback
              </a>
            </li>
            <li>
              <a href="/admin/hostels" className="flex items-center gap-3 px-4 py-3 bg-gray-800 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Hostels
              </a>
            </li>
            <li>
              <a href="/admin/blogs" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                </svg>
                Blogs
              </a>
            </li>
            <li>
              <a href="/admin/transactions" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Transactions
              </a>
            </li>
            <li>
              <a href="/admin/messages" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"></path>
                </svg>
                Messages
              </a>
            </li>
            <li>
              <a href="/admin/about" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                About Us
              </a>
            </li>
            <li>
              <a href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Settings
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto">
          <a href="/logout" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 border-t border-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pending Hostel Approvals</h1>
              <p className="text-gray-600">Review and manage hostels waiting approval</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">80%</span>
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-400">−</button>
                <button className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-400">+</button>
              </div>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500 hover:bg-gray-50">Reset</button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center relative">
              <input
                type="text"
                placeholder="Search hostels..."
                className="pl-9 pr-4 py-2 border rounded w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            
            <button
              onClick={fetchPendingHostels}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading hostels...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredHostels.length === 0 && (
            <div className="bg-white rounded shadow text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No pending hostels</h3>
              <p className="mt-1 text-gray-500">There are no hostels waiting for approval at this time.</p>
            </div>
          )}

          {/* Hostels list */}
          {!loading && filteredHostels.length > 0 && (
            <div className="space-y-4">
              {filteredHostels.map((hostel) => (
                <div
                  key={hostel.id}
                  className="bg-white rounded shadow overflow-hidden"
                >
                  <div className="p-4 flex justify-between items-center border-b">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {hostel.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Owner: {hostel.owner} • City: {hostel.city}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExpand(hostel.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      {expandedHostel === hostel.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>

                  {/* Quick Info */}
                  <div className="p-4 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Category</span>
                        <p>{hostel.category || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Security Deposit</span>
                        <p>Rs. {hostel.security_deposit}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Rent Range</span>
                        <p>Rs. {hostel.rent_min} - {hostel.rent_max}</p>
                      </div>
                    </div>
                  </div>

                  {/* Images Preview */}
                  {hostel.images && hostel.images.length > 0 && (
                    <div className="p-4 border-b">
                      <div className="flex overflow-x-auto gap-3 pb-2">
                        {hostel.images.map((img) => (
                          <div key={img.id} className="relative flex-shrink-0">
                            <img
                              src={img.image}
                              alt="hostel"
                              className="w-28 h-20 object-cover rounded border cursor-pointer"
                              onClick={() => setSelectedImage(img.image)}
                            />
                            <button
                              className="absolute top-1 right-1 bg-white bg-opacity-75 rounded-full p-1"
                              onClick={() => setSelectedImage(img.image)}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedHostel === hostel.id && (
                    <div className="p-4 border-b">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">Details</h3>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Address</span>
                              <p>{hostel.address}, {hostel.city}, {hostel.zip_code}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Description</span>
                              <p>{hostel.description || "No description provided"}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">Amenities</h3>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Facilities</span>
                              <p>{formatFacilities(hostel)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Nearby</span>
                              <p>Colleges: {hostel.nearby_colleges || "None"}</p>
                              <p>Markets: {hostel.nearby_markets || "None"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Policy */}
                      {hostel.cancellation_policy && Object.keys(hostel.cancellation_policy).length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium text-gray-700 mb-2">Cancellation Policy</h3>
                          <div className="bg-gray-50 p-3 rounded">
                            <pre className="whitespace-pre-wrap text-sm">
                              {JSON.stringify(hostel.cancellation_policy, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => handleReject(hostel.id)}
                    >
                      Reject
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => handleApprove(hostel.id)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Image viewer modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

export default AdminManageHostels;