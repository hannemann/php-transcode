import './Loading.js'

const LoadEvent = new CustomEvent('loading', {detail: true})
const LoadReadyEvent = new CustomEvent('loading', {detail: false})
const CSRF_TOKEN = document.head.querySelector("[name~=csrf-token][content]").content;

let requests = 0

class Request {

    static async get(url, indicate = true) {
        console.log(indicate, requests)
        try {
            if (indicate) this.loading = true
            let response = await fetch(url)
            if (response.status !== 200) {
                let error = await response.json()
                throw new Error(error.message)
            }
        } catch (error) {
            Request.error = error
        } finally {
            if (indicate) this.loading = false
        }
    }

    static async post(url, body) {
        try {
            this.loading = true
            let response = await fetch(url, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                  'Content-Type': 'application/json',
                  "X-CSRF-Token": CSRF_TOKEN
                },
            })
            if (response.status !== 200) {
                let error = await response.json()
                throw new Error(error.message)
            }
        } catch (error) {
            Request.error = error
        } finally {
            this.loading = false
        }
    }

    static async delete(url) {
        try {
            this.loading = true
            let response = await fetch(url, {
                method: 'delete',
                headers: {
                  'Content-Type': 'application/json',
                  "X-CSRF-Token": CSRF_TOKEN
                },
            })
            if (response.status !== 200) {
                let error = await response.json()
                throw new Error(error.message)
            }
        } catch (error) {
            Request.error = error
        } finally {
            this.loading = false
        }
    }

    static set loading(value) {
        if (value) {
            requests++
            if (requests === 1) {
                document.dispatchEvent(LoadEvent)
            }
        } else {
            requests--
            if (requests <= 0) {
                requests = 0
                document.dispatchEvent(LoadReadyEvent)
            }
        }
    }

    static set error(error) {
        console.error(error)
        document.dispatchEvent(new CustomEvent('toast', {
            detail: {
                message: error,
                type: 'error'
            }
        }))
        throw error
    }
}

export { Request }