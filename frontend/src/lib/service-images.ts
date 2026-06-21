/**
 * Centralized service images (LOCAL)
 * Path: /public/Quranic-Public-Assets/Services/
 *
 * To change an image: just replace the file in the public folder
 * with the same name (or update the path here).
 */

const BASE_PATH = "/Quranic-Public-Assets/Services";

export const SERVICE_IMAGES: Record<string, string> = {
  "quran-recitation": `${BASE_PATH}/Quran Recitation.jpeg`,
  "tajweed": `${BASE_PATH}/Tajweed.jpeg`,
  "arabic-language": `${BASE_PATH}/Arabic Language.jpeg`,
  "islamic-studies": `${BASE_PATH}/Islamic Studies.jpeg`,
  "kids-program": `${BASE_PATH}/Kids Program.jpeg`,
  "new-muslims": `${BASE_PATH}/New Muslims.jpeg`,
};

/**
 * Get service image by slug or index
 */
export function getServiceImage(slugOrIndex: string | number): string {
  const slugs = [
    "quran-recitation",
    "tajweed",
    "arabic-language",
    "islamic-studies",
    "kids-program",
    "new-muslims",
  ];

  const slug =
    typeof slugOrIndex === "number" ? slugs[slugOrIndex] : slugOrIndex;

  return SERVICE_IMAGES[slug] || SERVICE_IMAGES["quran-recitation"];
}

/**
 * Get all images as array (ordered)
 */
export const SERVICE_IMAGES_ARRAY = [
  SERVICE_IMAGES["quran-recitation"],
  SERVICE_IMAGES["tajweed"],
  SERVICE_IMAGES["arabic-language"],
  SERVICE_IMAGES["islamic-studies"],
  SERVICE_IMAGES["kids-program"],
  SERVICE_IMAGES["new-muslims"],
];