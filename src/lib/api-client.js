import { appConfig } from '../config/appConfig.js'
import { fetchJson } from './http.js'

function buildApiUrl(path) {
  return `${appConfig.apiUrl}${path}`
}

export async function fetchApi(path, options = {}) {
  return fetchJson(buildApiUrl(path), options)
}
