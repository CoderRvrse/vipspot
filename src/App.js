import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('https://vipspot-backend-47b6a431fc5d.herokuapp.com/')
      .then(response => setMessage(response.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>VIPSPOT Frontend</h1>
      <p>Message from Backend: {message}</p>
    </div>
  );
}

export default App;
