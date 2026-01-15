import { useState } from "react";

export default function LoanForm() {
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
    setProbability(prob);

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL */}
        <div className="bg-white p-6 rounded-xl shadow">
          {/* LEFT CONTENT GOES HERE */}
          <h2 className="text-2xl font-bold mb-4">
            Loan Approval Prediction
          </h2>

          {/* Input Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(form).map((key) => (
              <div key={key} className="flex flex-col">
                <input
                  name={key}
                  placeholder={placeholders[key]}
                  value={form[key]}
                  onChange={handleChange}
                  className={`border p-2 rounded ${
                    errors[key] ? "border-red-500" : ""
                  }`}
                />
                {errors[key] && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors[key]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Threshold Slider */}
          <div className="mt-6">
            <label className="font-semibold">
              Decision Threshold: {threshold}%
            </label>
            <input
              type="range"
              min="30"
              max="70"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full mt-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Lower = aggressive approvals, Higher = conservative approvals
            </p>
          </div>

          {/* Predict Button */}
          <button
            onClick={predictLoan}
            className="mt-6 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Predict Loan Approval
          </button>

        </div>
  
        {/* RIGHT PANEL */}
        <div className="flex flex-col gap-6">
          
          {/* RIGHT TOP */}
          <div className="bg-white p-6 rounded-xl shadow">
            {/* MODEL SUMMARY HERE */}
            <h3 className="text-xl font-semibold mb-3">
              Model Summary
            </h3>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <p><strong>Model:</strong> {modelInfo.name}</p>
              <p><strong>Architecture:</strong> {modelInfo.layers}</p>
              <p><strong>Activation:</strong> {modelInfo.activation}</p>
              <p><strong>Optimizer:</strong> {modelInfo.optimizer}</p>
              <p><strong>Accuracy:</strong> {modelInfo.accuracy}</p>
              <p><strong>Dataset:</strong> {modelInfo.dataset}</p>
            </div>

          </div>
  
          {/* RIGHT BOTTOM */}
          <div className="bg-white p-6 rounded-xl shadow">
            {/* RESULT + EXPLANATION HERE */}
            {probability !== null ? (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Prediction Result
              </h3>

              <p className="text-lg">
                Final Decision:{" "}
                <span
                  className={
                    finalDecision === "Approved"
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {finalDecision}
                </span>
              </p>

              <p className="mt-1">
                Approval Probability:{" "}
                <strong>{probability}%</strong>
              </p>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded h-3">
                  <div
                    className="bg-blue-600 h-3 rounded"
                    style={{ width: `${probability}%` }}
                  ></div>
                </div>
              </div>

              <p className="mt-3 text-sm">
                Risk Level: <strong>{risk}</strong>
              </p>

              {/* Explanation */}
              {explanations.length > 0 && (
                <div className="mt-4 bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">
                    Why this decision?
                  </h4>
                  <ul className="list-disc list-inside text-sm">
                    {explanations.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">
              Enter details and click Predict to see results
            </p>
          )}

          </div>
  
        </div>
      </div>
    </div>
  );
  
}
