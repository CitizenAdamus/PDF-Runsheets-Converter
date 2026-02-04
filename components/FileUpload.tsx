
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { PdfIcon } from './icons/PdfIcon';
import { CloseIcon } from './icons/CloseIcon';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        alert('Please upload a valid PDF file.');
        handleClearFile();
      }
    }
  };
  
  const handleClearFile = () => {
      setFileName(null);
      onFileSelect(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
        handleFileChange(e.dataTransfer.files);
    }
  }, [disabled]);

  return (
    <div>
      <label
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex justify-center items-center w-full h-48 px-6 transition-all duration-300 border-2 border-dashed rounded-xl cursor-pointer
          ${isDragging ? 'border-blue-400 bg-gray-700/50' : 'border-gray-600 hover:border-blue-500'}
          ${disabled ? 'cursor-not-allowed bg-gray-800/50' : 'bg-gray-800 hover:bg-gray-700/80'}
          `}
      >
        <div className="text-center">
          {!fileName ? (
            <>
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg text-gray-300">
                <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">PDF file only</p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <PdfIcon className="h-12 w-12 text-red-400" />
              <p className="mt-2 text-lg text-gray-200 break-all">{fileName}</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={disabled}
        />
      </label>
      {fileName && (
        <div className="text-right mt-2">
            <button 
                onClick={handleClearFile} 
                className="inline-flex items-center text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                disabled={disabled}
            >
                <CloseIcon className="w-4 h-4 mr-1"/>
                Clear file
            </button>
        </div>
      )}
    </div>
  );
};
