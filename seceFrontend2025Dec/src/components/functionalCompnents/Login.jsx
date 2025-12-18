import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log('Login attempt with:', { email });
    console.log('API URL:', import.meta.env.VITE_API_URL);

    try {
      const req = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        email,
        password,
      });

      const { message, isLoggedIn } = req.data;

      if (isLoggedIn) {
        localStorage.setItem("isLogin", "true");
        alert(message);
        navigate("/");
      }
    } catch (e) {
      console.error('Login error:', e);
      if (e.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', e.response.data);
        console.error('Response status:', e.response.status);
        console.error('Response headers:', e.response.headers);
        alert(`Login Failed: ${e.response.data?.message || e.message}`);
      } else if (e.request) {
        // The request was made but no response was received
        console.error('No response received:', e.request);
        alert('Login Failed: No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', e.message);
        alert(`Login Failed: ${e.message}`);
      }
    }
  };

  return (
    <div>
      <h2>Login Page</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <br />

        <div>
          <label>Password:</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <br />

        <button type="submit">Login</button>
      </form>

      <p>
        Create an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
};

export default Login;