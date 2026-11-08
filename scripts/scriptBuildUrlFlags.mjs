import fs from "fs";
import path from "path";
import { getUrlFlags } from "./getUrlFlags.mjs";

// Leer y parsear el archivo languages.json
const languages = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "languages.json"), "utf8")
);

// Crear un objeto para almacenar las URL de las banderas
const flags = {};

// Iterar sobre la lista de idiomas
for (const language of languages.list) {
  // Obtener la URL de la bandera para el código de idioma
  const flagUrl = getUrlFlags(language.code);

  // Almacenar la URL de la bandera en el objeto flags
  flags[language.code] = flagUrl;
}

// Convertir el objeto flags a una cadena JSON
const flagsJson = JSON.stringify(flags, null, 2);

// Escribir la cadena JSON en el archivo flags.json
fs.writeFileSync(path.join(process.cwd(), "data", "flags.json"), flagsJson);
