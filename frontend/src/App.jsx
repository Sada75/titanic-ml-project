import LoanForm from "./components/LoanForm";
import CompareModels from "./components/CompareModels";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoanForm />} />
        <Route path="/compare" element={<CompareModels />} />
      </Routes>
    </Router>
  );
}

export default App;
