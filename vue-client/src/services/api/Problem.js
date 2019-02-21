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

  async getProblem(problemID, userID) {
    try {
      const result = await this.http.get(`/problems/${problemID}/${userID}`)
      console.log(result)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }

  async getProblemSolution(problemID, userID) {
    try {
      const result = await this.http.get(`/solutions/${problemID}/${userID}`)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }

  async saveProblemSolution(problemID, userID, solution) {
    try {
      var request = {
        "problemID": problemID.toString(),
        "userID": userID.toString(),
        "solution": solution
      }
      console.log(request)
      const result = await this.http.post('/solutions', request)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }
}

export default Problem
