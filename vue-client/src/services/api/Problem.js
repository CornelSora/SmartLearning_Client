import Base from './Base'

class Problem extends Base {
  async getAllProblems () {
    try {
      const result = await this.http.get('/problems')
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }
}

export default Problem
