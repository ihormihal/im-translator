const getDomWords = () => {
    let words = []
    document.querySelectorAll('.word-list .word-item').forEach((item) => {
        words.push({
            word: item.querySelector('.word').textContent.trim(),
            translations: item.querySelector('.translate').textContent.split(',').map(t => t.trim())
        })
    })
    let url = window.location.href.split('/')
    return { 
        id: url[url.length - 2],
        title: document.title.trim(), 
        words
    }
}

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if (request.action === "GRAB"){
        sendResponse(getDomWords())
    }
})