export const resizeImage = (
  screenshot: string | File | Blob,
  max_size: number = 1920
): Promise<string> => {
  return new Promise(resolve => {
    let imageSource: string = '';

    if (screenshot instanceof Blob) {
      imageSource = URL.createObjectURL(screenshot);
    } else {
      imageSource = screenshot;
    }

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');

      let { width } = img;
      let { height } = img;

      if (width > height && width > max_size) {
        height *= max_size / width;
        width = max_size;
      } else if (height > max_size) {
        width *= max_size / height;
        height = max_size;
      }

      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
      const resizedImage = canvas.toDataURL('image/jpeg');
      resolve(resizedImage);
    };

    img.src = imageSource;
  });
};
