import "./App.css";
import AppRoutes from "./routes/router";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <main>
        <AppRoutes />
      </main>
      <ToastContainer
        aria-label="toast-container"
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  );
}

export default App;
