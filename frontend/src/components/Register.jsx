import { useState } from 'react';

import {
    BrowserRouter as Router,
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

    const navigate =  useNavigate();

    const register = async () => {
        if (password != confirmPassword) {
            alert('Please double check your password!');
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
            navigate('/dashboard');
        } catch (err) {
            alert(err.res.data.error)
        }
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">

                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Register
                </h2>
    
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                            value={email}
                            onKeyDown={e => {if (e.key === 'Enter') {
                                register();
                            }}}
                            onChange={e => setEmail(e.target.value)}
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1
                            -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="userName" className="block text-sm/6 font-medium text-gray-900">
                            User Name
                        </label>
                        <div className="mt-2">
                            <input
                            value={name}
                            onKeyDown={e => {if (e.key === 'Enter') {
                                register();
                            }}}
                            onChange={e => setName(e.target.value)}
                            type="text"
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
                            onKeyDown={e => {if (e.key === 'Enter') {
                                register();
                            }}}
                            onChange={e => setPassword(e.target.value)}
                            type="password"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1
                            -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-900">
                            Confirm Password
                            </label>

                        </div>
                        <div className="mt-2">
                            <input
                            value={confirmPassword}
                            onKeyDown={e => {if (e.key === 'Enter') {
                                register();
                            }}}
                            onChange={e => setConfirmPassword(e.target.value)}
                            type="password"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1
                            -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>
    
                    <div>
                        <button
                        onClick={register}
                        className="mt-10 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6
                        font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Register
                        </button>
                    </div>
    
                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        Already a member?{' '}
                    <Link to="/Login" className="font-semibold text-indigo-600 hover:text-indigo-500">Login Now!</Link>
                    </p>
                </div>
            </div>
        </>
      )
}

export default Register