import LocalStorage from 'local-storage'

const SETTINGS_STORAGE = 'SETTINGS_STORAGE'
class SettingsStorage {
    getObject() {
        var defaultObj = LocalStorage.get(SETTINGS_STORAGE)
        if (!defaultObj) {
            defaultObj = {}
            LocalStorage.set(SETTINGS_STORAGE, defaultObj)
        }
        return defaultObj
    }

    setLanguage(language) {
        var settings = this.getObject()
        settings.language = language
        LocalStorage.set(SETTINGS_STORAGE, settings)
    }

    setTheme(theme) {
        var settings = this.getObject()
        settings.theme = theme
        LocalStorage.set(SETTINGS_STORAGE, settings)
    }

    getLanguage() {
        return this.getObject().language ? this.getObject().language : null
    }

    getTheme() {
        return this.getObject().theme ? this.getObject().theme : null
    }

    setCode (code, language, problemId) {
        var settings = this.getObject()
        if (!settings.savedCode) {
            settings.savedCode = {}
            settings.savedCode[language] = {}
        }
        if (!settings.savedCode[language]) {
            settings.savedCode[language] = {}
        }
        if (problemId) {
            settings.savedCode[language][problemId] = code
        } else {
            settings.savedCode[language] = code            
        }
        LocalStorage.set(SETTINGS_STORAGE, settings)
    }

    getCode (language, problemId) {
        var savedCode = this.getObject().savedCode ? this.getObject().savedCode : null
        if (!savedCode) return null
        if (problemId) {
            if (!savedCode[language]) return null
            return savedCode[language][problemId] ? savedCode[language][problemId] : null
        } else {
            return savedCode[language] ? savedCode[language] : null            
        }
    }
}

export default SettingsStorage