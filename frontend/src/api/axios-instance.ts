import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let redirectingToLogin = false;

function redirectToLogin() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  window.location.href = "/login";
  setTimeout(() => {
    redirectingToLogin = false;
  }, 500);
}

// Response interceptor — handle 401 globally (invalid/expired session)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const alreadyOnAuthPage = window.location.pathname.startsWith("/login");

    if (
      status === 401 &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/register") &&
      !url.includes("/auth/logout") &&
      !alreadyOnAuthPage
    ) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
