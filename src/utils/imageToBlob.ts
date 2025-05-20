/**
 * @param {string} image - base64 string
 */

export const imageToBlob = async (image: string) => {
  return fetch(image).then(res => res.blob());
};
