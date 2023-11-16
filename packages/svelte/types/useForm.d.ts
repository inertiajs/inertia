/// <reference types="svelte" />

import { FormDataConvertible, Method, Progress, Router, VisitOptions } from "@inertiajs/core";
import { Writable } from "svelte/store";

type Form<TForm extends object> = TForm & {
    isDirty: boolean
    errors: Partial<Record<keyof TForm, string>>
    hasErrors: boolean
    processing: boolean
    progress: Progress | null
    wasSuccessful: boolean
    recentlySuccessful: boolean
    transform: (callback: (data: TForm) => TForm) => void
    defaults(): void
    defaults(field: keyof TForm, value: FormDataConvertible): void
    defaults(fields: Partial<TForm>): void
    reset: (...fields: (keyof TForm)[]) => void
    clearErrors: (...fields: (keyof TForm)[]) => void
    setError(field: keyof TForm, value: string): void
    setError(errors: Record<keyof TForm, string>): void
    submit: (method: Method, url: string, options?: VisitOptions) => void
    get: (url: string, options?: VisitOptions) => void
    patch: (url: string, options?: VisitOptions) => void
    post: (url: string, options?: VisitOptions) => void
    put: (url: string, options?: VisitOptions) => void
    delete: (url: string, options?: VisitOptions) => void
    cancel: () => void
}

export default useForm;
declare function useForm<TData extends Record<string, any>>(data: TData): Writable<Form<TData>>;
declare function useForm<TData extends Record<string, any>>(rememberKey: string, data: TData): Writable<Form<TData>>;



//# sourceMappingURL=useForm.d.ts.map