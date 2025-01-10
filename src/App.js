import React, { Suspense, lazy } from "react";
import Login from "./Login";

// Lazy load the Message component
const Message = lazy(() => import("./components/Message"));

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>VIPSPOT Frontend</h1>
      {/* Include the Login Component */}
      <Login />
      {/* Wrap the lazy-loaded Message component with Suspense */}
      <Suspense fallback={<p>Loading message from backend...</p>}>
        <Message />
      </Suspense>
    </div>
  );
}

export default App;
