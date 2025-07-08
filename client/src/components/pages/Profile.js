import { fetchData } from "../../main.js";
import { useState, useEffect } from "react";

const Profile = () => {
  // User and mice state
  const [user, setUser] = useState(null);
  const [mice, setMice] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for creating new mouse
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [newMouse, setNewMouse] = useState({
    name: '',
    sex: '',
    genotype: '',
    strain: '',
    birthDate: '',
    availability: true,
    notes: ''
  });
  
  // Message state
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Get user data from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadUserMice(parsedUser._id);
      } else {
        setLoading(false);
        setMessage('Please log in to view your profile');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user'); // Remove corrupted data
      setLoading(false);
      setMessage('Please log in again');
      setMessageType('error');
    }
  }, []);

  // Load mice created by the user
  const loadUserMice = async (userId) => {
    try {
      setLoading(true);
      const response = await fetchData(`/mouse/user/${userId}`, {}, "GET");
      setMice(response.mice || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading mice:', error);
      setLoading(false);
      setMessage('Error loading your mice: ' + (error.message || 'Unknown error'));
      setMessageType('error');
      // Don't clear mice on error
    }
  };

  // Handle form input changes
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMouse({
      ...newMouse,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');

    try {
      // Add userId to the mouse data
      const mouseData = {
        ...newMouse,
        userId: user._id,
        genotype: newMouse.genotype.split(',').map(g => g.trim()) // Convert comma-separated string to array
      };

      const response = await fetchData("/mouse/create", mouseData, "POST");
      
      if (response.mouse) {
        setMessage('Mouse created successfully!');
        setMessageType('success');
        
        // Add new mouse to the list
        setMice(prevMice => [...prevMice, response.mouse]);
        
        // Reset form
        setNewMouse({
          name: '',
          sex: '',
          genotype: '',
          strain: '',
          birthDate: '',
          availability: true,
          notes: ''
        });
        
        // Hide form
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating mouse:', error);
      setMessage(error.message || 'Error creating mouse');
      setMessageType('error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle mouse deletion
  const deleteMouse = async (mouseId) => {
    if (!window.confirm('Are you sure you want to delete this mouse?')) return;

    try {
      await fetchData(`/mouse/delete/${mouseId}`, {}, "DELETE");
      setMice(prevMice => prevMice.filter(mouse => mouse._id !== mouseId));
      setMessage('Mouse deleted successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error deleting mouse:', error);
      setMessage(error.message || 'Error deleting mouse');
      setMessageType('error');
    }
  };

  // Handle availability toggle
  const toggleAvailability = async (mouseId, currentAvailability) => {
    try {
      const response = await fetchData(
        `/mouse/update-availability/${mouseId}`, 
        { availability: !currentAvailability }, 
        "PUT"
      );
      
      if (response.mouse) {
        setMice(prevMice => 
          prevMice.map(mouse => 
            mouse._id === mouseId ? response.mouse : mouse
          )
        );
        setMessage('Mouse availability updated');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      setMessage(error.message || 'Error updating availability');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="form-container">
        <div className="alert alert-warning">
          <h4>Not Logged In</h4>
          <p>Please log in to view your profile.</p>
          <a href="/login" className="btn btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      {/* User Information */}
      <div className="card mb-4">
        <div className="card-body">
          <h2>Welcome, {user.username}!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible`}>
          {message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage('')}
          ></button>
        </div>
      )}

      {/* My Mice Section */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>My Mice ({mice.length})</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Mouse'}
          </button>
        </div>
        <div className="card-body">
          {/* Create Mouse Form */}
          {showForm && (
            <div className="border p-3 mb-4 rounded">
              <h4>Create New Mouse</h4>
              <form onSubmit={onSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={newMouse.name}
                        onChange={onChange}
                        placeholder="Mouse name"
                        required
                        disabled={formLoading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Sex *</label>
                      <select
                        className="form-control"
                        name="sex"
                        value={newMouse.sex}
                        onChange={onChange}
                        required
                        disabled={formLoading}
                      >
                        <option value="">Select sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Genotype * (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="genotype"
                        value={newMouse.genotype}
                        onChange={onChange}
                        placeholder="e.g., WT, KO, HET"
                        required
                        disabled={formLoading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Strain *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="strain"
                        value={newMouse.strain}
                        onChange={onChange}
                        placeholder="e.g., C57BL/6J"
                        required
                        disabled={formLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Birth Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="birthDate"
                        value={newMouse.birthDate}
                        onChange={onChange}
                        required
                        disabled={formLoading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>
                        <input
                          type="checkbox"
                          name="availability"
                          checked={newMouse.availability}
                          onChange={onChange}
                          disabled={formLoading}
                        />
                        {' '}Available for research
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label>Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={newMouse.notes}
                    onChange={onChange}
                    placeholder="Additional notes about this mouse"
                    rows="3"
                    disabled={formLoading}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success me-2"
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Create Mouse'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Mice List */}
          {mice.length === 0 ? (
            <p className="text-muted">You haven't created any mice yet. Click "Add New Mouse" to get started!</p>
          ) : (
            <div className="row">
              {mice.map((mouse) => (
                <div key={mouse._id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{mouse.name}</h5>
                      <p className="card-text">
                        <strong>Sex:</strong> {mouse.sex}<br />
                        <strong>Strain:</strong> {mouse.strain}<br />
                        <strong>Genotype:</strong> {Array.isArray(mouse.genotype) ? mouse.genotype.join(', ') : mouse.genotype}<br />
                        <strong>Birth Date:</strong> {new Date(mouse.birthDate).toLocaleDateString()}<br />
                        <strong>Available:</strong> 
                        <span className={`badge ${mouse.availability ? 'bg-success' : 'bg-secondary'} ms-1`}>
                          {mouse.availability ? 'Yes' : 'No'}
                        </span>
                      </p>
                      {mouse.notes && (
                        <p className="card-text"><small className="text-muted">{mouse.notes}</small></p>
                      )}
                      <div className="btn-group w-100">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => toggleAvailability(mouse._id, mouse.availability)}
                        >
                          Toggle Availability
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteMouse(mouse._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;