import { Inertia } from "@inertiajs/inertia"
import { onMounted, onUnmounted } from "vue"

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
    interval: interval,
    reloadOptions: typeof args[0] === "object" && args[0].reloadOptions ? args[0].reloadOptions
                  : only?.length ? { only: only } : undefined,
  }

  let poll = null

  // Function to start the poll
  const startPoll = () => {
    poll = setInterval(() => {
      Inertia.reload(options.reloadOptions)
    }, options.interval)
  }

  // Function to stop the poll
  const stopPoll = () => {
    clearInterval(poll)
  }

  // Start the poll on mount
  onMounted(() => {
    startPoll()
  })

  // Stop the poll on unmount
  onUnmounted(() => {
    clearInterval(poll)
  })

  return {
    startPoll,
    stopPoll,
  }
}
