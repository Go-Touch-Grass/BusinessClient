import axios from "axios";

const GLBAxiosInstance = axios.create({
  // headers: {
  //   "X-APP-ID": "66f4fea70b01ac5ee87a4d79",
  //   "X-API-Key": "sk_live_3HvRKIj8z1mVyX806VXl-USrl2rB5X0kMBUH",
  // },
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default GLBAxiosInstance;
