const LoginForm = () => {
  return (
    <div className="form-container">
      <h2>Login</h2>
      <form>
        <div className="form-group mb-3">
          <label>Username</label>
          <input type="text" className="form-control" placeholder="Enter username" />
        </div>
        <div className="form-group mb-3">
          <label>Password</label>
          <input type="password" className="form-control" placeholder="Password" />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;