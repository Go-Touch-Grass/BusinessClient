import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://someproductionurl.com/api"
    : "http://localhost:8080/";

const createInstance = (baseUrl) => {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: { "Content-Type": "application/json" },
  });

  /// ADDED auto add authorization header and forbidden errors globally.
  // Request Interceptor: Automatically add the Authorization header with the token from cookies
  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get("authToken"); // Retrieve token from cookies
      console.log("Token being attached:", token); // Debugging - Check if token is present

      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle 401 Unauthorized and 403 Forbidden errors globally
  instance.interceptors.response.use(
    (response) => {
      return response; // If the request is successful, return the response
    },
    (error) => {
      // //const router = useRouter();  // Use the Next.js router for navigation

      /*
      if (error.response && error.response.status === 401) {
        // Handle 401 Unauthorized: Redirect to login and clear the token
        Cookies.remove('authToken');
        window.location.href = '/Login'; // Redirect using window.location
      } else if (error.response && error.response.status === 403) {
        // Handle 403 Forbidden: Display an error message or redirect
        alert('You do not have permission to access this resource.');
      }
*/
      return Promise.reject(error); // Reject the promise so that individual requests can still handle errors
    }
  );
  ////

  return instance;
};

export default createInstance(API_URL);
