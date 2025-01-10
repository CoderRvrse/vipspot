import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Message = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios
      .get('https://vipspot-backend-47b6a431fc5d.herokuapp.com/')
      .then((response) => setMessage(response.data))
      .catch((err) => console.error(err));
  }, []);

  return <p>Message from Backend: {message}</p>;
};

export default Message;
