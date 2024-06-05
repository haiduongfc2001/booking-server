interface Review {
  location_rating: number;
  price_rating: number;
  service_rating: number;
  cleanliness_rating: number;
  amenities_rating: number;
}

interface AggregatedRatings {
  overall: number;
  location: number;
  price: number;
  service: number;
  cleanliness: number;
  amenities: number;
}

export const calculateAverageRatings = (
  reviews: Review[]
): AggregatedRatings => {
  let totalRating = 0;
  let totalLocationRating = 0;
  let totalPriceRating = 0;
  let totalServiceRating = 0;
  let totalCleanlinessRating = 0;
  let totalAmenitiesRating = 0;

  reviews.forEach((review) => {
    const reviewAverageRating =
      (review.location_rating +
        review.price_rating +
        review.service_rating +
        review.cleanliness_rating +
        review.amenities_rating) /
      5;

    totalRating += reviewAverageRating;
    totalLocationRating += review.location_rating;
    totalPriceRating += review.price_rating;
    totalServiceRating += review.service_rating;
    totalCleanlinessRating += review.cleanliness_rating;
    totalAmenitiesRating += review.amenities_rating;
  });

  const totalReviews = reviews.length;
  return {
    overall: totalReviews > 0 ? totalRating / totalReviews : 0,
    location: totalReviews > 0 ? totalLocationRating / totalReviews : 0,
    price: totalReviews > 0 ? totalPriceRating / totalReviews : 0,
    service: totalReviews > 0 ? totalServiceRating / totalReviews : 0,
    cleanliness: totalReviews > 0 ? totalCleanlinessRating / totalReviews : 0,
    amenities: totalReviews > 0 ? totalAmenitiesRating / totalReviews : 0,
  };
};
