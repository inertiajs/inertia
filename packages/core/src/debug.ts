export const stackTrace = (autolog = true) => {
  try {
    throw new Error()
  } catch (e) {
    // @ts-ignore
    const stack = e.stack

    if (!autolog) {
      return stack
    }

    console.log(stack)
  }
}
