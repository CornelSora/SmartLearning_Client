export default class Base {
  constructor (http) {
    this.http = http
  }

  ok (result) {
    return { ok: true, result: result ? (result.data ? result.data : result) : null }
  }

  error (e) {
    return { ok: false, message: this.failureReason(e) }
  }

  failureReason (e) {
    console.warn(e.response)
    const reason = e.response ? e.response.data.code : e.toString()
    switch (reason) {
      case 'ACCOUNT_INVALID_CREDENTIALS':
        return 'Email or password is incorrect'
      default:
        return e.response.data.message ? e.response.data.message : e.response.data
    }
  }

  verify (data) {
    return JSON.parse(JSON.stringify(data))
  }
}
