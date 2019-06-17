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

    setCode (code, language) {
        var settings = this.getObject()
        if (!settings.savedCode) {
            settings.savedCode = {}
        }
        settings.savedCode[language] = code
        LocalStorage.set(SETTINGS_STORAGE, settings)
    }

    getCode (language) {
        var savedCode = this.getObject().savedCode ? this.getObject().savedCode : null
        if (!savedCode) return null
        return savedCode[language] ? savedCode[language] : null
    }
}

export default SettingsStorage