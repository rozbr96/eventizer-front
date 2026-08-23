
import { APIEndpoint } from './common-entities'

export default class extends APIEndpoint {
  login(props: { email: string, password: string }) {
    return new Promise<void>((resolve, reject) => {
      this.doRequest({ endpoint: '/auth/login', method: 'POST', body: props })
        .then(async (response) => {
          response.ok ? resolve() : reject(await response.json())
        })
    })
  }
}

