import Base from './Base'
import * as data from '../localdb.json';

let dailyProblems = {};
let generatedIndexes = [];

class Problem extends Base {

  getDailyProblem(problems) {
    const today = new Date()
      .toJSON()
      .slice(0, 10)
      .toString();
  
    if (dailyProblems[today]) {
      return dailyProblems[today];
    }
    let randomIndex = Math.floor(Math.random() * problems.length);
    while (generatedIndexes.indexOf(randomIndex) > -1 && generatedIndexes.length < problems.length) {
      randomIndex = Math.floor(Math.random() * problems.length);
    }
    if (generatedIndexes.length === problems.length) {
      generatedIndexes = [];
    }
    const randomProblemUID = problems[randomIndex].UID;
    dailyProblems[today] = randomProblemUID;
    let randomProblem = {};
    randomProblem.date = today;
    randomProblem.UID = randomProblemUID;
  
    return randomProblemUID;
  }
  
  getProblemsFromDB () {
    const problems = []
    debugger
    // const result = await this.http.get('/problems')
    const problemsDB = data.problems
    let problemIds = Object.keys(problemsDB);
    for (let i = 0; i < problemIds.length; i++) {
      let currProblem = problemsDB[problemIds[i]];
      currProblem.UID = problemIds[i];
      problems.push(currProblem);
    }

    return problems
  }


  async getAllProblems () {
    try {
      debugger
      const problems = this.getProblemsFromDB()
      let result = {};
      result.problems = problems;
      result.daily = this.getDailyProblem(problems);

      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }



  async getProblem(problemID, userID) {
    try {
      debugger

      // const URL = `/problems/${problemID}/${userID}`
      // const result = await this.http.get(URL)
      // this._userSolution = result.data.solution

      const result = {}
      const allProblems = await this.getProblemsFromDB()
      result.data = allProblems.filter(x => x.UID === problemID)[0]
      

      this._functions = result.data.functions
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    } finally {
    }
  }

//   #include<stdio.h>
// int missingNumber(int* a, int b) {
//   int sum = 0;
//   for (int i = 0; i < b; i++) {
//     sum += a[i];
//   }
//   b += 1;
//   return ((int)b * (b + 1) / 2) - sum;
// }

// int main() {
//   int a[9] = { 1,2,3,4,5,7,8,9,10 };
  
//   int result = missingNumber(a, 9);
  
//   printf("%d", result);
// }

  async getDailyProblem() {
    try {
      const problems = this.getProblemsFromDB()

      // const result = await this.http.get(`/problems/daily-problem`)
      const result = this.getDailyProblem(problems)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
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
