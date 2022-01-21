import { Inertia } from "@inertiajs/inertia"
import { onMounted, onUnmounted, watch } from "vue"

export default function usePoll(...args) {

  // Set the interval for the poll
  const interval = typeof args[0] === "number" ? args[0] // Try to get the interval from the first argument
                : typeof args[1] === "number" ? args[1] // Try to get the interval from the second argument
                : typeof args[0] === "object" && args[0].interval && typeof args[0].interval == 'number' ? args[0].interval // Try to get the interval from the options object
                : 2000; // Default to 5 seconds

  // Set the data to be polled
  const only = Array.isArray(args[0]) ? args[0] // Try to get data from the first argument
            : Array.isArray(args[1]) ? args[1] // Try to get data from the second argument
            : typeof args[0] === "object" && args[0].only ? args[0].only // Try to get data from the options object
            : [] // Default to all data

  // Set the poll options
  const options = {
    // The interval, in ms(miliseconds)
    interval: interval,
    // The 'keepAlive' option is to decide if polling should happen when the app is in the background
    keepAlive: typeof args[0] === "object" && args[0].hasOwnProperty('keepAlive') && typeof args[0].keepAlive === "boolean" ? args[0].keepAlive : false,
    // The 'startImmediately' option is to decide if polling should start immediately
    startImmediately: typeof args[0] === "object" && args[0].hasOwnProperty('startImmediately') && typeof args[0].startImmediately === "boolean" ? args[0].startImmediately : true,
    // The 'startWhen' option is to define the condition for when polling should start
    startWhen: typeof args[0] === "object" && args[0].hasOwnProperty('startWhen')  ? args[0].startWhen : undefined,
    // The 'stopWhen' option is to define the condition for when polling should stop
    stopWhen: typeof args[0] === "object" && args[0].hasOwnProperty('stopWhen') ? args[0].stopWhen : undefined,
    // The reloadOptions is for letting the user pass options directly to the reload method
    reloadOptions: typeof args[0] === "object" && args[0].reloadOptions ? args[0].reloadOptions
                  : only?.length ? { only: only } : undefined,
  }

  // Initialize the poll instance
  let poll = null

  // Initialize the variable to check the state of tab's visibility
  let tabIsInBackground = false

  // Function to start the poll
  const startPoll = () => {
    if (poll === null) {
      poll = setInterval(() => {
        // If the tab is in the background and keepAlive is false, return
        if ( !options.keepAlive && tabIsInBackground) return
        // Use Inertia's reload to refresh the props
        Inertia.reload(options.reloadOptions)
      }, options.interval)
    }
  }

  // Function to stop the poll
  const stopPoll = () => {
    clearInterval(poll)
  }

  // Start the poll on mount
  onMounted(() => {
    document.addEventListener(
        'visibilitychange',
        () => {
          tabIsInBackground = document.hidden
        },
        false
    )
    // If startImmediately is true, start the poll
    if (options.startImmediately) startPoll()
  })

  // Stop the poll on unmount
  onUnmounted(() => {
    clearInterval(poll)
  })

  // Watch stopWhen and stop the poll whenever it's value is true
  if(options.stopWhen){
    watch(options.stopWhen, (condition) => {
      if (condition) stopPoll()
    }, { immediate: true, deep: true })
  }
  // Watch startWhen and start the poll whenever it's value is true
  if(options.startWhen){
    watch(options.startWhen, (condition) => {
      if (condition) startPoll()
    }, { immediate: true, deep: true })
  }

  return {
    startPoll,
    stopPoll,
  }
}
