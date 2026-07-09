import { UploadCloud, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";

function UploadCard({
  loading,
  selectedFile,
  message,
  handleFileChange,
}) {

  const onDrop = (acceptedFiles) => {

    if (acceptedFiles.length === 0) return;

    handleFileChange({
      target: {
        files: acceptedFiles,
      },
    });

  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (

    <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <h2 className="text-3xl font-bold mb-6">
        Upload Resume
      </h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition

        ${
          isDragActive
            ? "border-red-500 bg-zinc-800"
            : "border-zinc-700 hover:border-red-500 hover:bg-zinc-800"
        }`}
      >

        <input {...getInputProps()} />

        <UploadCloud
          size={60}
          className="mx-auto text-red-500"
        />

        <h3 className="text-2xl font-semibold mt-5">

          {isDragActive
            ? "Drop your resume here..."
            : "Drag & Drop Resume"}

        </h3>

        <p className="text-zinc-400 mt-3">
          or Click to Browse
        </p>

        <p className="text-sm text-zinc-500 mt-2">
          PDF files only
        </p>

      </div>

      {selectedFile && (

        <div className="mt-8 flex items-center gap-3">

          <FileText />

          <span>{selectedFile.name}</span>

        </div>

      )}

      {loading && (

        <p className="text-blue-400 mt-5">
          Uploading...
        </p>

      )}

      {message && (

        <p className="text-green-500 mt-5">
          {message}
        </p>

      )}

    </div>

  );
}

export default UploadCard;