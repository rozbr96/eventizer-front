
import { toaster } from "@/components/ui/toaster"

export interface User {
  id: number
  name: string
  role?: 'organizer' | 'client' | 'doorman'
}

export interface PaginatedResult<T> {
  page: number
  items: Array<T>
  total_count: number
  total_pages: number
}

export class APIEndpoint {
  constructor(protected endpoint: string) { }

  private fallbackErrorMessage = 'Não foi possível concluir a requisição.'

  private errorMessagesFromDetails(details: unknown) {
    if (typeof details === 'string') return [details]
    if (Array.isArray(details)) return details.filter((detail): detail is string => typeof detail === 'string')

    return []
  }

  private async errorMessagesFromResponse(response: Response) {
    const fallback = [this.fallbackErrorMessage]

    try {
      const data = await response.clone().json()
      const messages = [
        ...this.errorMessagesFromDetails(data?.detail),
        ...this.errorMessagesFromDetails(data?.details),
      ]

      return messages.length > 0 ? messages : fallback
    } catch {
      return fallback
    }
  }

  private showErrorToasts(messages: string[]) {
    if (typeof window === 'undefined') return

    messages.forEach((message) => {
      toaster.create({
        title: 'Erro',
        description: message,
        type: 'error',
        closable: true,
      })
    })
  }

  private redirectToLogin() {
    if (typeof window === 'undefined') return
    if (window.location.pathname === '/login') return

    const redirect = `${window.location.pathname}${window.location.search}`
    const loginUrl = new URL('/login', window.location.origin)
    loginUrl.searchParams.set('redirect', redirect)

    window.location.href = loginUrl.toString()
  }

  private async handleErrorResponse(
    response: Response,
    options: {
      redirectOnUnauthorized: boolean,
      showErrors: boolean
    }
  ) {
    if (response.ok) return response

    if (options.showErrors)
      this.showErrorToasts(await this.errorMessagesFromResponse(response))

    if (options.redirectOnUnauthorized
      && (response.status === 401 || response.status === 403)
    ) this.redirectToLogin()

    return response
  }

  async doRequest(props: {
    endpoint: string,
    method: 'GET' | 'POST',
    query?: Record<string, unknown>,
    body?: Record<string, unknown>,
    headers?: HeadersInit,
    redirectOnUnauthorized?: boolean,
    showErrors?: boolean,
  }) {
    const { endpoint, method, body, query, headers, redirectOnUnauthorized = true, showErrors = true } = props

    const requestOptions: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      }
    }

    const queryString = Object.entries(query || {}).map(([key, value]) => `${key}=${value}`).join('&')
    const url = `${this.endpoint}${endpoint}?${queryString}`

    if (method === 'POST') requestOptions.body = JSON.stringify(body || {})

    return fetch(url, requestOptions)
      .then((response) => this.handleErrorResponse(response, { redirectOnUnauthorized, showErrors }))
      .catch((error) => {
        if (showErrors) this.showErrorToasts([this.fallbackErrorMessage])

        throw error
      })
  }
}
