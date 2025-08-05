// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'

interface ClientForm {
    name: string;
    [key: string]: any;
}

const { data, setData } = useForm<ClientForm>({
	name: '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setData(name, value);
};

export default function DynamicInputName() {
	return (
		<input
			name="name"
			type="text"
			value={data.name}
			onChange={handleChange}
		/>
	)
}