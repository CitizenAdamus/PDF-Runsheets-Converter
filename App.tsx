import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { ConvertIcon } from './components/icons/ConvertIcon';
import { fileToBase64 } from './utils/fileUtils';
import { convertPdfToCsv } from './services/geminiService';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setCsvData(null);
    setError(null);
    setProgressMessage(null);
  };

  const handleConvert = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setCsvData(null);
    setProgressMessage('Initializing...');

    try {
      const base64File = await fileToBase64(selectedFile);
      const generatedCsv = await convertPdfToCsv(base64File, selectedFile.type, setProgressMessage);
      setCsvData(generatedCsv);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during conversion.');
    } finally {
      setIsProcessing(false);
      setProgressMessage(null);
    }
  }, [selectedFile]);

  const handleDownload = () => {
    if (!csvData) return;

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const originalFileName = selectedFile?.name.replace(/\.[^/.]+$/, "") || "runsheet";
    link.download = `${originalFileName}.csv`;
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up after download to prevent memory leaks
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            PDF Runsheet Converter
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Automatically convert your transportation PDF runsheets to perfectly formatted CSV files.
          </p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
          <div className="space-y-6">
            <FileUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleConvert}
                disabled={!selectedFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Spinner />
                    {progressMessage || 'Processing...'}
                  </>
                ) : (
                  <>
                    <ConvertIcon />
                    Convert to CSV
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!csvData || isProcessing}
                className="w-full"
                variant="secondary"
              >
                <DownloadIcon />
                Download CSV
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">
              <p className="font-semibold">Conversion Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {csvData && !error && (
              <div className="mt-6 p-4 bg-green-900/50 text-green-300 border border-green-700 rounded-lg text-center">
                <p className="font-semibold">Conversion Successful!</p>
                <p className="text-sm">Your CSV file is ready for download.</p>
            </div>
          )}
        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;