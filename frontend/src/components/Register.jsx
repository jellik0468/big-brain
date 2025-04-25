import { useEffect, useState } from 'react';
import EnterInput from './EnterInput';
import {
  useNavigate,
  Link,
} from "react-router-dom"

import axios from 'axios';

function Register(props) {
  const setToken = props.setToken;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate =  useNavigate();

  useEffect(() => {
    if (password != confirmPassword) {
      setError('Password does not match!')
    } else {
      setError('')
    }
  }, [password, confirmPassword])
  
  const register = async () => {
    if (password != confirmPassword) {
      return;
    }
    
    try {
      const res = await axios.post('http://localhost:5005/admin/auth/register', {
        email: email,
        password: password,
        name: name
      });
      const token = res.data.token;
      localStorage.setItem('token', token);
      setToken(token);
      localStorage.setItem('owner', email);
      navigate('/dashboard');

    } catch (err) {
      if (err.response.data.error === 'Email address already registered') {
        setError('This Email address already registered, maybe try logging in');
      } else {
        setError('Failed to register');
      }
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900"
          aria-label="Register heading"
        >
          Register
        </h2>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

          <EnterInput
            id="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onEnter={register}
            placeholder="zId@ad.unsw.edu.com"
            aria-label="Email address"
          />

          <EnterInput
            id="name"
            type="text"
            label="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onEnter={register}
            placeholder="Your Name"
            aria-label="User Name"
          />

          <EnterInput
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onEnter={register}
            placeholder="Enter Your Password"
            aria-label="Password"
          />

          <EnterInput
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onEnter={register}
            placeholder="Confirm Your password"
            aria-label="Confirm Password"
          />

          {error && <div className="text-red-600 font-medium">{error}</div>}

          <button
            onClick={register}
            className="mt-5 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="Submit registration form"
          >
            Register
          </button>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Already a member?{' '}
            <Link to="/Login" className="font-semibold text-indigo-600 hover:text-indigo-500"
              aria-label="Navigate to login page"
            >
              Login Now!
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Register