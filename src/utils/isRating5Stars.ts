export default function isRating5Stars(rating: number) {
  if (!rating) return true;
  return rating !== null && typeof rating === 'number' && rating === 5;
}
