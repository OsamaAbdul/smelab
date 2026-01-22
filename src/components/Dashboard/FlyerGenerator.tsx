import { useState } from "react";
import { Button } from "@/components/ui/button";

const FlyerGenerator = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleGenerate = () => {
    alert("Flyer generated! (Demo)");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold">Flyer Generator</h1>
      <input
        type="text"
        placeholder="Flyer Title"
        className="w-full p-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Flyer Description"
        className="w-full p-2 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <Button onClick={handleGenerate} className="w-full">Generate Flyer</Button>
    </div>
  );
};

export default FlyerGenerator;
