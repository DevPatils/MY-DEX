import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Faucet from "./Components/Faucet";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Faucet />} />
      </Routes>
    </Router>
  );
}