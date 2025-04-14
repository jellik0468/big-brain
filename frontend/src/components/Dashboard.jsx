import { useState } from 'react';

import {
    BrowserRouter as Router,
    useNavigate,
    Link,
} from "react-router-dom"

import axios from 'axios';

function Dashboard() {
    const navigate =  useNavigate();
    return(
        <>
            <div className='flex justify-between items-center px-4 py-2 bg-gray-100'>
                <div className="">Dashboard</div>

                
            </div>

        </>
    )

}

export default Dashboard