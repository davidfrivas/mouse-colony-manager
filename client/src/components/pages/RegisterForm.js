// Import the fetchData helper to make HTTP requests
import { fetchData } from "../../main.js";
import { useState } from "react"; // React hook for component state
import { useNavigate } from "react-router-dom"; // React Router hook to navigate between routes

const RegisterForm = () => {
  const navigate = useNavigate(); // Redirect users after successful registration

  // State to hold form input values
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: ''
  });

  const { username, email, password } = user; // Destructure values for convenience

  // Update state on each input change
  const onChange = (e) => setUser({
    ...user, // keep existing values
    [e.target.name]: e.target.value // update only the changed field
  });
  
  // Handle form submission
  const onSubmit = (e) => {
    e.preventDefault(); // prevent default form refresh behavior
    
    // Call the backend API to register the user
    fetchData("/user/register", user, "POST")
    .then((data) => {
      if (data.user) {
        console.log(data); // log response

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate("/profile"); // redirect to home page after successful registration
      }
    })
    .catch((error) => {
      console.log(error); // log any errors from the server
    });
  };

  // Render the registration form
  return (
    <div className="form-container register">
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        {/* Username field */}
        <div className="form-group mb-3">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            onChange={onChange}
            value={username}
            placeholder="Enter username"
            required
          />
        </div>
        {/* Email field */}
        <div className="form-group mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            onChange={onChange}
            value={email}
            placeholder="example@domain.com"
            required
          />
        </div>
        {/* Password field */}
        <div className="form-group mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            onChange={onChange}
            value={password}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;