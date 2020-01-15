const speak = (word) => {
    const synth = window.speechSynthesis
    const voices = synth.getVoices()

    const utterThis = new SpeechSynthesisUtterance(word)
    utterThis.voice = voices[0]
    synth.speak(utterThis)
}

const apiReq = (url, data) => {
    return fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then((response) => {
            return response.json()
        })
}

const getTranslation = (word) => {
    return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=at&q=${word}`)
        .then(response => response.json())
        .then(result => {
            let translations = result[5] && result[5][0]
            if (translations) {
                return {
                    word: translations[0],
                    translations: translations[2].map((tr) => {
                        return tr[0] ? tr[0].toLowerCase() : ''
                    })
                }
            } else {
                return null
            }
        })
}

const addTranslation = (word, variant) => {
    return apiReq('https://mycode.in.ua/api/im-translator/api.php?action=ADD', {
        category_id: 1,
        word,
        variant
    })
}

const deleteTranslation = (word, variant) => {
    return apiReq('https://mycode.in.ua/api/im-translator/api.php?action=REMOVE', {
        category_id: 1,
        word,
        variant
    })
}

const fetchWord = async (word) => {
    const result = await getTranslation(word)
    const variants = await apiReq('https://mycode.in.ua/api/im-translator/api.php?action=VARIANTS', { word })

    result.translations = result.translations.map((variant) => {
        return {
            exists: variants.includes(variant),
            text: variant
        }
    })

    return result
}

class Tooltip {
    constructor() {
        this.el = document.createElement('div')
        this.el.id = 'im-translator-tooltip'
        this.hide()
        document.body.appendChild(this.el)
    }
    show(targetPosition) {
        this.el.style.top = targetPosition.top + 'px'
        this.el.style.left = targetPosition.left + 'px'
        this.el.style.display = 'block'
    }
    hide() {
        this.el.style.display = 'none'
    }

    render(content) {
        this.content = content
        this.el.innerHTML = `<div class="word">${content.word}</div>
        <div class="translation">
            ${content.translations.map((t, index) => `<div class="variant ${t.exists ? 'delete' : 'add'}" data-index="${index}">${t.text}</div>`).join('')}
        </div>`
    }
    isVisible() {
        return this.el.style.display === 'block'
    }
}

let tooltip = new Tooltip()

document.addEventListener('mouseup', (event) => {
    //click outside
    if(!event.path.includes(tooltip.el) && tooltip.isVisible()) {
        tooltip.hide()
        return
    }
    if(event.target.dataset.index){
        let index = Number(event.target.dataset.index)
        let variant = tooltip.content.translations[index]
        if(variant.exists){
            deleteTranslation(tooltip.content.word, variant.text).then(() => {
                variant.exists = false
                tooltip.render(tooltip.content)
            })
        }else{
            addTranslation(tooltip.content.word, variant.text).then(() => {
                variant.exists = true
                tooltip.render(tooltip.content)
            })
        }
        return
    }

    const selection = window.getSelection().toString()
    const word = selection ? selection.trim() : ''
    const pattern = /^([a-zA-Z\s\-]*)$/
    if(!word) return
    if(!pattern.test(word)) return
    if(word.split(' ').length > 2 || word.split('-').length > 1) return

    const targetPosition = {
        top: event.clientY + 20,
        left: event.clientX - 50
    }
    if(!tooltip.isVisible()){
        speak(word)
        fetchWord(word.toLowerCase()).then((translations) => {
            tooltip.render(translations)
            tooltip.show(targetPosition)
        })
    }
})

document.addEventListener('scroll', (e) => {
    tooltip.hide()
})