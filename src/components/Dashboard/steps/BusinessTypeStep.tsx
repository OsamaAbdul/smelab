const BusinessTypeStep = ({ value, onChange }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-800">Select your Business Type</h2>
    <select
      className="mt-4 w-full border rounded-lg p-3"
      value={value}
      onChange={(e) => onChange("businessType", e.target.value)}
    >
      <option value="">-- Select Business Type --</option>
      <option>Retail</option>
      <option>Food & Beverage</option>
      <option>Tech Startup</option>
      <option>Consulting</option>
      <option>Healthcare</option>
      <option>Manufacturing</option>
    </select>
  </div>
);

export default BusinessTypeStep;
