
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result is a data URL: "data:[<mediatype>][;base64],<data>"
      // We only need the <data> part.
      const base64Data = result.split(',')[1];
      if (base64Data) {
        resolve(base64Data);
      } else {
        reject(new Error("Failed to extract base64 data from file."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
