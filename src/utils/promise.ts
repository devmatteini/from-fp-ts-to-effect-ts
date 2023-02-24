export const delay = (timeout: number) =>
    new Promise((resolve) => {
        setTimeout(() => resolve(timeout), timeout)
    })
