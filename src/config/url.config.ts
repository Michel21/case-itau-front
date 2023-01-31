import { environment } from "../environments/environment";

export const urlConfig = Object.freeze({
  api_cat: environment.api,
  x_api_key: environment.x_api_key
})