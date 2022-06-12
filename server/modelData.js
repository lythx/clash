// Przechowywanie danych o modelach

const data = []

/**
 * Ładuje stałe dane modeli
 * @param {object[]} models 
 */
const load = (models) => {
    data.push(...models)
}

module.exports = { load, data }
