export const stackTrace = (autolog = true) => {
  try {
    throw new Error()
  } catch (e) {
    const stack = (e as Error).stack

    if (!autolog) {
      return stack
    }

    console.log(stack)
  }
}
