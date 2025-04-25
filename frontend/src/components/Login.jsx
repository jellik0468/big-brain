import { useState, useEffect } from 'react';

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
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">

        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900"
          aria-label="Sign in heading"
        >
          Sign in to your account
        </h2>
    
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                value={email}
                id="email"
                type="email"
                aria-label="Email address"
                aria-required="true"
                onKeyDown={e => {if (e.key === 'Enter') {
                  login();
                }}}
                onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1
                -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
    
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
              Password
              </label>
                  
            </div>
            <div className="mt-2">
              <input
                value={password}
                id="password"
                type="password"
                aria-label="Password"
                aria-required="true"
                onKeyDown={e => {if (e.key === 'Enter') {
                  login();
                }}}
                onChange={e => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1
                -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
    
          <div>
            {error && (
              <div className='text-red-600 font-medium'>
                {error}
              </div>)}

            <button
              onClick={login}
              className="mt-10 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6
              font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 
              focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              aria-label="Submit login form"
            >
              Sign in
            </button>
          </div>
  
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500"
              aria-label="Go to registration page"
            >
            Register Now!
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login