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
  async saveClient(userID, email) {
    try {
      var request = {
        "userID": userID.toString(),
        "clientInfo": {
          "email": email.toString()
        }  
      }
      const result = await this.http.post('/users/clients', request)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }
  async getClients(userID) {
    try {
      const result = await this.http.get(`/users/clients/${userID}`)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }

  async sendEmail(email, userId) {
    try {
      var request = {
        "email": email.toString(),
        "problem": "-LYC8RguuOLye1yJQt3H",
        "invitedBy": userId
      }
      await this.http.post(`/emails/send`, JSON.stringify(request))
    } catch (e) {
    }
  }
}

export default Account
