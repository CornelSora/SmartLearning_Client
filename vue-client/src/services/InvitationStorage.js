import LocalStorage from 'local-storage'

const INVITATION_STORAGE = 'INVITATION_STORAGE'
class InvitationStorage {
    getObject() {
        var defaultObj = LocalStorage.get(INVITATION_STORAGE)
        if (!defaultObj) {
            defaultObj = {}
            LocalStorage.set(INVITATION_STORAGE, defaultObj)
        }
        return defaultObj
    }

    setCode (code) {
        var settings = this.getObject()
        if (!settings.code) {
            settings.code = {}
        }
        settings.code = code
        LocalStorage.set(INVITATION_STORAGE, settings)
    }

    getCode () {
        var code = this.getObject().code ? this.getObject().code : null
        if (!code) return null
        return code
    }
}

export default InvitationStorage