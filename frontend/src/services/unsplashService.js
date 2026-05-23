import axios from 'axios';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE_URL = 'https://api.unsplash.com';

const unsplashApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
  }
});

// Simple memory cache
const cache = new Map();

/**
 * Fetch trending/random photos
 */
export const getRandomPhotos = async (count = 30) => {
  const cacheKey = `random_${count}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await unsplashApi.get('/photos/random', {
      params: {
        count,
        orientation: 'landscape'
      }
    });
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Unsplash fetch error:', error);
    return [];
  }
};

/**
 * Search photos with debouncing/caching in mind
 */
export const searchPhotos = async (query, page = 1, perPage = 30) => {
  if (!query) return [];
  
  const cacheKey = `search_${query}_${page}_${perPage}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await unsplashApi.get('/search/photos', {
      params: {
        query,
        page,
        per_page: perPage,
        orientation: 'landscape'
      }
    });
    
    cache.set(cacheKey, response.data.results);
    return response.data.results;
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
};
