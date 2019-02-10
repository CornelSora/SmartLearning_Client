import Base from './Base'

class Compiler extends Base {
  async run (data) {
    try {
      data = super.verify(data)
      const result = await this.http.post('/run', data)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }
}

export default Account
