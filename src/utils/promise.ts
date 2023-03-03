export const delay = (timeout: number, shouldReject?: boolean) =>
    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldReject) reject("delay promise is rejected")
            resolve(timeout)
        }, timeout)
    })
