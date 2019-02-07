import Base from './Base'

class Account extends Base {
  async register (data) {
    try {
      data = super.verify(data)
      const result = await this.http.post('/account/register', data)

      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }
}

export default Account
