
import { APIEndpoint, type User } from './common-entities'

class AuthEndpoint extends APIEndpoint {
  state(): Promise<User> {
    return new Promise((resolve, reject) => {
      this.doRequest({ endpoint: '/auth/state', method: 'GET' })
        .then(async (response) => {
          const data = await response.json()

          if (response.ok) return resolve(data)

          reject(data)
        })
    })
  }

  login(props: { email: string, password: string }) {
    return new Promise<void>((resolve, reject) => {
      this.doRequest({ endpoint: '/auth/login', method: 'POST', body: props })
        .then(async (response) => {
          if (response.ok) return resolve()

          reject(await response.json())
        })
    })
  }

  signup(props: { name: string, email: string, password: string }) {
    return new Promise<void>((resolve, reject) => {
      this.doRequest({ endpoint: '/auth/signup', method: 'POST', body: props })
        .then(async (response) => {
          if (response.ok) return resolve()

          reject(await response.json())
        })
    })
  }

  logout() {
    return new Promise<void>((resolve, reject) => {
      this.doRequest({ endpoint: '/auth/logout', method: 'POST' })
        .then(async (response) => {
          if (response.ok) return resolve()

          reject(await response.json())
        })
    })
  }
}

export default AuthEndpoint
