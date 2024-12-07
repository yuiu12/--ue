"use client"

import { useEffect, useState } from "react";

interface MyObject {
  label: string;
  mask: string;
  score: number;
}

export default function Home() {
  const [theFile, setTheFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<MyObject[]>([]);
  const [toShow, setToShow] = useState<MyObject | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setTheFile(file);
  };

  useEffect(() => {
    if (theFile) {
      const blobUrl = URL.createObjectURL(theFile);
      setImagePreview(blobUrl);
    }
  }, [theFile]);

  const identifyThings = async () => {
    setIsLoading(true);
    if (!theFile) {
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.set("theImage", theFile);

    try {
      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        
        console.log("File uploaded successfully");
        const theResponse = await response.json();
        console.log(theResponse)
        setApiResponse(theResponse.body);
        setIsLoading(false);
      } else {
        console.error("Failed to upload file");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error occurred during API call:", error);
      setIsLoading(false);
    }
  };
  function toggleThis(label: string) {
    const showThis = apiResponse.find((obj) => obj.label === label);
    setToShow((prev: MyObject | undefined) => {
      if (prev === showThis) {
        return undefined; 
      }
      return showThis || undefined; 
    });
  }
  
  



  return (
    <main className="flex min-h-screen bg-gray-900 flex-col items-center justify-between px-24 py-12">
      <h1 className=" text-5xl mb-4">AI-dentifier</h1>
      <div className="mb-4">
        This is a project that uses Facebook's DEtection TRansformer (DETR)
        model trained end-to-end on COCO 2017 panoptic (118k annotated images).
      </div>
      <input
        type="file"
        className="border p-2 rounded-sm border-gray-600"
        onChange={handleFileChange}
        accept=".jpg, .jpeg, .png"
      />
      <div className="w-80 h-80 relative placeholderdiv">
        {imagePreview && (
          <img src={imagePreview} className=" object-contain absolute z-0" />
        )}
        {toShow ? (
          <img
            src={`data:image/png;base64,${toShow.mask}`}
            className="object-contain absolute z-20 mix-blend-screen invert"
          />
        ) : (
          ""
        )}
      </div>
      {theFile ? (
        <button
          className="bg-blue-600 px-5 py-1 rounded-sm disabled:cursor-not-allowed disabled:bg-blue-900 transition-colors"
          onClick={identifyThings}
          disabled={isLoading}
        >
          {isLoading ? "loading..." : "Go!"}
        </button>
      ) : (
        ""
      )}
      {apiResponse?(
        <div className="mt-12 ">
          <div className="mb-4">Identified objects: </div>
          <div className="flex"> 
            {
            apiResponse.map((e) => (
              
              <div className="mx-2" key={e.label}>
                <button className="px-4 py-1 bg-blue-600 rounded-md" onClick={() => toggleThis(e.label)}>{e.label}</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </main>
  );
}