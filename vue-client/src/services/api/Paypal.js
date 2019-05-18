import Base from './Base'

class Paypal extends Base {
  async pay () {
    try {
      const result = await this.http.get('/paypal/pay')
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }
}

export default Paypal
