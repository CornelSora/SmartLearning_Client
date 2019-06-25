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
  async getProfile(userID) {
    try {
      const result = await this.http.get(`/account/${userID}`)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }
  async getInvitations(email) {
    try {
      const result = await this.http.get(`/emails/invitations/${email}`)
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }
  async sendEmail(email, userId, problemId) {
    try {
      var request = {
        "email": email.toString(),
        "problem": problemId,
        "invitedBy": userId
      }
      const result = await this.http.post(`/emails/send`, JSON.stringify(request))
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }
  async updateInvitation(userInvitiations) {
    try {
      const result = await this.http.post(`/account/updateInvitation`, JSON.stringify(userInvitiations))
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }
  async updateStatus(pId, userId) {
    try {
      const result = await this.http.put(`/users/updatestatus`, JSON.stringify({ userID: userId, paymentId: pId }))
      return super.ok(result)
    } catch (e) {
      return super.error(e)
    }
  }
}

export default Account
