const RegisterForm = () => {
  return (
    <div className="form-container">
      <h2>Register</h2>
      <form>
        <div className="form-group mb-3">
          <label>Username</label>
          <input type="text" className="form-control" placeholder="Enter username" />
        </div>
        <div className="form-group mb-3">
          <label>Email</label>
          <input type="email" className="form-control" placeholder="example@domain.com" />
        </div>
        <div className="form-group mb-3">
          <label>Password</label>
          <input type="password" className="form-control" placeholder="Password" />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;