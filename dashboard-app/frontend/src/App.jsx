import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./components/Home";
import UsersPage from "./components/Users";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UsersPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
