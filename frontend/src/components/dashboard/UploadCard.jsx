import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
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
    <div className="rounded-xl border border-stone-800 bg-[#0e0e0e] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-normal text-stone-100">
          Upload PDF Resume
        </h2>
        <span className="text-[10px] text-stone-500 font-light uppercase tracking-wider">
          PDF format only
        </span>
      </div>

      <div
        {...getRootProps()}
        className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-[#d4af37] bg-[#d4af37]/5"
            : "border-stone-800 hover:border-[#d4af37]/40 hover:bg-[#121212]"
        }`}
      >
        <input {...getInputProps()} />

        <UploadCloud
          size={26}
          className={`mx-auto mb-2 ${isDragActive ? "text-[#d4af37]" : "text-stone-500"}`}
        />

        <p className="text-xs font-normal text-stone-200">
          {isDragActive ? "Drop PDF here..." : "Drag & drop resume or browse files"}
        </p>

        <p className="text-[11px] text-stone-500 font-light mt-1">
          Max file size: 5MB
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2 text-xs text-stone-300 bg-[#141414] border border-stone-800/80 rounded-lg px-3 py-2">
          <FileText size={14} className="text-[#d4af37]" />
          <span className="truncate flex-1 font-light">{selectedFile.name}</span>
          <span className="text-[10px] text-stone-500 font-mono">
            {(selectedFile.size / 1024).toFixed(0)} KB
          </span>
        </div>
      )}

      {loading && (
        <p className="text-xs text-[#d4af37] flex items-center gap-1.5 font-light animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
          Parsing resume and running ATS evaluation...
        </p>
      )}

      {message && !loading && (
        <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-light">
          <CheckCircle2 size={13} />
          {message}
        </p>
      )}
    </div>
  );
}

export default UploadCard;