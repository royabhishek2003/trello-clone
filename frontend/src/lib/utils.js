import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function absoluteUrl(path) {
  return `${import.meta.env.VITE_APP_URL}${path}`;
}
;
export {
  absoluteUrl,
  cn
};
