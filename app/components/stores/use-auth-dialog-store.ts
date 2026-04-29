import { create } from "zustand";

export type Step = "email" | "password" | "verification" | "forgot_password";
export type Action = "AUTHENTICATE" | "VERIFY_EMAIL";
export type SuccessAction = "BUY_NOW";
export type Fields = {
    email: string,
    password: string,
    code: string,
}

export type AuthDialogStore = {
    loading: boolean;
    error: string | null;
    open: boolean;
    title?: string;       // <-- Added
    description?: string; // <-- Added
    action: Action;
    successAction?: SuccessAction;
    onSuccessParams: any;
    openDialog: (data: Partial<Pick<AuthDialogStore, 'action' | 'successAction' | 'onSuccessParams' | 'title' | 'description'>>) => void; // <-- Updated
    closeDialog: () => void;
    fields: Fields,
    updateField: (key: keyof AuthDialogStore['fields'], value: string) => void,
    step: Step,
    setState: (data: Partial<AuthDialogStore>) => void;
};

const defaultFields: Fields = {
    email: '',
    password: '',
    code: ''
}

const defaultState: Pick<AuthDialogStore, 'open' | 'action' | 'fields' | 'step' | 'onSuccessParams' | 'loading' | 'error'> = {
    open: false,
    action: "AUTHENTICATE",
    fields: defaultFields,
    step: 'email',
    onSuccessParams: null,
    error: null,
    loading: false,
}

export const useAuthDialogStore = create<AuthDialogStore>((set) => ({
    ...defaultState,
    updateField: (key, value) => set(s => ({ ...s, fields: { ...s.fields, [key]: value } })),
    openDialog: (data) =>
        set({
            ...defaultState,
            ...data,
            open: true,
        }),

    closeDialog: () => set(defaultState),
    setState: (state) => set(state)
}));