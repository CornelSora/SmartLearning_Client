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
      this._userSolution = result.data.solution
      this._functions = result.data.functions
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

  async addProblem(problem) {
    try {
      const result = await this.http.post('/problems', problem)
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
      const result = await this.http.post('/solutions', request)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }

  // getUserSolution() {
  //   return this._userSolution
  // }

  // getProblemFunctions() {
  //   return this._functions
  // }
}

export default Problem
