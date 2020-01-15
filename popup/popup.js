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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('button').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0]
            chrome.tabs.sendMessage(tab.id, { action: 'GRAB' }, function (response) {
                apiReq('https://mycode.in.ua/api/ed-words/api.php?action=ADD_ED_WORDS', response)
                    .then((res) => {
                        window.close()
                    })
            })
        })
    })

})