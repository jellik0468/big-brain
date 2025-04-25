import { useState, useEffect } from 'react';
import EnterInput from './EnterInput';
import {
  useNavigate,
  Link,
} from "react-router-dom"

import axios from 'axios';

function Login(props) {
  const setToken = props.setToken;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate =  useNavigate();

  useEffect(() => {
    setError('');
  }, [password, email])

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5005/admin/auth/login', {
        email: email,
        password: password
      });

      const token = res.data.token;
      localStorage.setItem('token', token);
      setToken(token);
      localStorage.setItem('owner', email);
      navigate('/dashboard');
    } catch (err) {
      if (err.response.data.error === 'Invalid username or password') {
        setError('Invalid username or password');
      } else {
        console.log(err);
      }
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <h2
        className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900"
        aria-label="Sign in heading"
      >
        Sign in to your account
      </h2>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <EnterInput
          id="email"
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onEnter={login}
          aria-label="Email address"
          placeholder="zId@ad.unsw.edu.com"
        />

        <EnterInput
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onEnter={login}
          aria-label="Password"
          placeholder="Enter Your password"
        />

        {error && <div className="text-red-600 font-medium">{error}</div>}

        <button
          onClick={login}
          className="mt-10 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label="Submit login form"
        >
          Sign in
        </button>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
            aria-label="Go to registration page"
          >
            Register Now!
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login