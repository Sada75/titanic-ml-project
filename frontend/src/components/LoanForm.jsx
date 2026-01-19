import { useState } from "react";
import bgimage from "../assets/AIML_lab_bg.png"
import {useNavigate} from "react-router-dom"; 

const modelDetails = {
  neural_network: {
    name: "Neural Network (MLP)",
    layers: "2 Hidden Layers (16, 8)",
    activation: "ReLU (hidden), Sigmoid (output)",
    optimizer: "Adam",
    accuracy: "≈ 76%",
    dataset: "Loan Approval Dataset"
  },
  svm: {
    name: "Support Vector Machine",
    layers: "Kernel-based (RBF)",
    activation: "Non-linear (Kernel Trick)",
    optimizer: "SMO",
    accuracy: "≈ 78%",
    dataset: "Loan Approval Dataset"
  },
  decision_tree: {
    name: "Decision Tree",
    layers: "Tree Depth = 5",
    activation: "Rule-based splits",
    optimizer: "Greedy (Gini Index)",
    accuracy: "≈ 73%",
    dataset: "Loan Approval Dataset"
  },
  knn: {
    name: "K-Nearest Neighbors",
    layers: "k = 7",
    activation: "Distance-based",
    optimizer: "Lazy Learning",
    accuracy: "≈ 75%",
    dataset: "Loan Approval Dataset"
  }
};



export default function LoanForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    gender: "",
    married: "",
    dependents: "",
    education: "",
    self_employed: "",
    applicant_income: "",
    coapplicant_income: "",
    loan_amount: "",
    loan_term: "",
    credit_history: "",
    property_area: ""
  });

  const modelInfo = {
    name: "Neural Network (MLP)",
    layers: "2 Hidden Layers (16, 8)",
    activation: "ReLU + Sigmoid",
    optimizer: "Adam",
    accuracy: "≈ 76%",
    dataset: "Loan Approval Dataset"
  };
  

  // Decision Variables
  const [probability, setProbability] = useState(null);
  const [threshold, setThreshold] = useState(40); // default 40%
  const [finalDecision, setFinalDecision] = useState(null);
  const [risk, setRisk] = useState("");
  const [explanations, setExplanations] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedModel, setSelectedModel] = useState("neural_network");




  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
  
    Object.keys(form).forEach((key) => {
      if (form[key] === "") {
        newErrors[key] = "This field is required";
      }
    });
  
    if (form.applicant_income && Number(form.applicant_income) <= 0) {
      newErrors.applicant_income = "Income must be greater than 0";
    }
  
    if (form.loan_amount && Number(form.loan_amount) <= 0) {
      newErrors.loan_amount = "Loan amount must be greater than 0";
    }
  
    if (form.credit_history && !["0", "1"].includes(form.credit_history)) {
      newErrors.credit_history = "Credit history must be 0 or 1";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const predictLoan = async () => {
    if (!validateForm()) return;
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        threshold: threshold / 100,
        gender: Number(form.gender),
        married: Number(form.married),
        dependents: Number(form.dependents),
        education: Number(form.education),
        self_employed: Number(form.self_employed),
        applicant_income: Number(form.applicant_income),
        coapplicant_income: Number(form.coapplicant_income),
        loan_amount: Number(form.loan_amount),
        loan_term: Number(form.loan_term),
        credit_history: Number(form.credit_history),
        property_area: Number(form.property_area)
      })
    });

    const data = await response.json();

    const prob = data.approval_probability;

    setFinalDecision(data.decision);
    setProbability(data.approval_probability);


    // Decision based on threshold
    if (prob >= threshold) {
      setFinalDecision("Approved");
    } else {
      setFinalDecision("Rejected");
    }

    // ----------------------------
    // Decision Explanation Logic
    // ----------------------------
    const reasons = [];

    if (form.credit_history === "1") {
      reasons.push("Good credit history");
    } else {
      reasons.push("Poor credit history");
    }

    if (Number(form.applicant_income) >= 4000) {
      reasons.push("Applicant income is sufficient");
    } else {
      reasons.push("Low applicant income");
    }

    if (Number(form.loan_amount) <= 200) {
      reasons.push("Loan amount is reasonable");
    } else {
      reasons.push("High loan amount increases risk");
    }

    if (Number(form.dependents) <= 1) {
      reasons.push("Low number of dependents");
    } else {
      reasons.push("Higher number of dependents");
    }

    setExplanations(reasons);


    // Risk label
    if (prob >= 75) setRisk("Low Risk");
    else if (prob >= 50) setRisk("Medium Risk");
    else setRisk("High Risk");
  };

  const placeholders = {
    gender: "Gender (0 = Female, 1 = Male)",
    married: "Married (0 = No, 1 = Yes)",
    dependents: "Dependents (0, 1, 2, 3)",
    education: "Education (0 = Graduate, 1 = Not Graduate)",
    self_employed: "Self Employed (0 = No, 1 = Yes)",
    applicant_income: "Applicant Income (e.g. 5000)",
    coapplicant_income: "Coapplicant Income (e.g. 0)",
    loan_amount: "Loan Amount (in thousands, e.g. 150)",
    loan_term: "Loan Term (months, e.g. 360)",
    credit_history: "Credit History (0 = Bad, 1 = Good)",
    property_area: "Property Area (0 = Rural, 1 = Semiurban, 2 = Urban)"
  };

  const currentModel = modelDetails[selectedModel];


  return (
    <div className="min-h-screen w-full relative flex">
      {/* Background Image with Overlay */}
      <div 
        className="absolute bg-white-100 inset-0 bg-cover bg-center z-0"
        
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-indigo-900/70 backdrop-blur-sm" />
  
      {/* LEFT SIDEBAR - Model Selection */}
      <div className="relative w-72 bg-slate-900/40 backdrop-blur-xl border-r border-white/10 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Loan Predictor</h1>
          <p className="text-sm text-slate-300">AI-Powered Analysis</p>
        </div>
  
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-white/90 mb-3">
            Prediction Model
          </label>
          
          <div className="space-y-2">
            {[
              { value: "neural_network", label: "Neural Network", desc: "MLP Architecture" },
              { value: "svm", label: "Support Vector", desc: "SVM Algorithm" },
              { value: "decision_tree", label: "Decision Tree", desc: "Tree-based Model" },
              { value: "knn", label: "K-Nearest", desc: "KNN Classifier" }
            ].map((model) => (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  selectedModel === model.value
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                <div className="font-medium text-white">{model.label}</div>
                <div className={`text-xs mt-1 ${
                  selectedModel === model.value ? "text-blue-100" : "text-slate-400"
                }`}>
                  {model.desc}
                </div>
              </button>
            ))}
          </div>
  
          <p className="text-xs text-slate-400 mt-4 px-1">
            Select a model to compare prediction behavior and accuracy
          </p>
        </div>
      </div>
  
      {/* MAIN CONTENT AREA */}
      <div className="relative flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* CENTER PANEL - Input Form */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 overflow-auto">
            <h2 className="text-3xl font-bold mb-6 text-white">
              Loan Application
            </h2>
  
            {/* Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {Object.keys(form).map((key) => (
                <div key={key} className="flex flex-col">
                  <input
                    name={key}
                    placeholder={placeholders[key]}
                    value={form[key]}
                    onChange={handleChange}
                    className={`rounded-xl border px-4 py-3 text-sm bg-white/10 backdrop-blur text-white placeholder-slate-300 focus:outline-none focus:ring-2 transition ${
                      errors[key]
                        ? "border-red-400 focus:ring-red-400/50"
                        : "border-white/30 focus:ring-blue-400/50"
                    }`}
                  />
                  {errors[key] && (
                    <span className="text-xs text-red-400 mt-1 px-1">
                      {errors[key]}
                    </span>
                  )}
                </div>
              ))}
            </div>
  
            {/* Threshold */}
            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex justify-between mb-3">
                <label className="font-semibold text-white">
                  Decision Threshold
                </label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg">
                  {threshold}%
                </span>
              </div>
  
              <input
                type="range"
                min="30"
                max="70"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 rounded-lg"
              />
  
              <div className="flex justify-between text-xs text-slate-300 mt-2">
                <span>Aggressive</span>
                <span>Conservative</span>
              </div>
            </div>

            <button
              onClick={predictLoan}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white py-4 font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-200"
            >
              Analyze Application
            </button>

            
            <button
              onClick={() => navigate("/compare")}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white py-4 font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-200"
            >
              Compare Models
            </button>

  
          </div>
  
          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-6">
            
            {/* Model Summary */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                Model Analytics
              </h3>
  
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Model", value: currentModel.name },
                  { label: "Architecture", value: currentModel.layers },
                  { label: "Activation", value: currentModel.activation },
                  { label: "Optimizer", value: currentModel.optimizer },
                  { label: "Accuracy", value: currentModel.accuracy },
                  { label: "Dataset", value: currentModel.dataset }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Prediction Result */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 flex-1 overflow-auto">
              {probability !== null ? (
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-white">
                    Prediction Result
                  </h3>
  
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-300">Final Decision</span>
                      <span
                        className={`text-2xl font-bold px-4 py-2 rounded-xl ${
                          finalDecision === "Approved"
                            ? "text-green-400 bg-green-500/20"
                            : "text-red-400 bg-red-500/20"
                        }`}
                      >
                        {finalDecision}
                      </span>
                    </div>
  
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Approval Probability</span>
                        <span className="text-white font-bold">{probability}%</span>
                      </div>
  
                      <div className="w-full h-3 rounded-full bg-slate-700/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 transition-all duration-500 shadow-lg shadow-blue-500/50"
                          style={{ width: `${probability}%` }}
                        />
                      </div>
  
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-slate-300">Risk Level</span>
                        <span className="text-white font-semibold">{risk}</span>
                      </div>
                    </div>
                  </div>
  
                  {explanations.length > 0 && (
                    <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
                      <h4 className="font-semibold mb-3 text-blue-300 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Key Factors
                      </h4>
                      <ul className="space-y-2">
                        {explanations.map((reason, idx) => (
                          <li key={idx} className="text-sm text-blue-100 flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
  
                  <div className="text-xs text-slate-400 pt-2 border-t border-white/10">
                    Model: <span className="text-slate-300 font-medium">{selectedModel}</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Enter application details and click
                  </p>
                  <p className="text-white font-semibold mt-1">
                    Analyze Application
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  
}
