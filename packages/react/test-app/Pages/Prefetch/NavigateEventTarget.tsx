import NavigateEventTest from '@/Layouts/NavigateEventTest'

const NavigateEventTarget = ({ label }: { label: string }) => {
  return <div>This is the {label} target</div>
}

NavigateEventTarget.layout = (page: React.ReactNode) => <NavigateEventTest children={page} />

export default NavigateEventTarget
