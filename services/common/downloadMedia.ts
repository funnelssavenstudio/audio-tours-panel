export const downloadMedia = async (uuidMedia: string) => {
  const response = await fetch(`/api/media/${uuidMedia}/download`);

  if (!response.ok) {
    if (response.status === 401) throw new Error("Token expired");
    throw new Error("Error al descargar el archivo");
  }

  const contentDisposition = response.headers.get("content-disposition");
  const filename = contentDisposition
    ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
    : "downloaded-file";

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
