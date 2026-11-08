import fs from "fs";
import path from "path";

export const getUrlFlags = (language) => {
  function getRealSvgPath(svgPath) {
    if (!fs.existsSync(svgPath)) {
      return "";
    }

    const content = fs.readFileSync(svgPath, "utf8");

    if (content.startsWith("../")) {
      const newPath = path.join(path.dirname(svgPath), content);
      return getRealSvgPath(newPath);
    }

    return svgPath;
  }

  const baseDir = path.join(process.cwd(), "public");
  const svgPath = path.join(
    baseDir,
    "assets",
    "flags",
    "language",
    `${language}.svg`
  );
  const realSvgPath = getRealSvgPath(svgPath);

  // Si el archivo SVG no existe, devuelve una cadena vacía
  if (realSvgPath === "") {
    return "";
  }

  // Convertir la ruta absoluta a una ruta relativa
  const relativePath = realSvgPath.replace(baseDir, "");

  console.log(relativePath);
  return relativePath;
};
