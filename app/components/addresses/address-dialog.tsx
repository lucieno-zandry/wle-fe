import { Form, useActionData, useNavigation } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import CustomField from "~/components/custom-components/field";
import Button from "../custom-components/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useState, useMemo, type FocusEvent, useEffect } from "react";
import z from "zod";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";
import { ValidationException } from "~/api/app-fetch";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import getValidationError from "~/lib/get-validation-error";

// Updated validation to comfortably handle spaces, parentheses, and dashes
const addressSchema = {
    label: z.string().max(50).optional(),
    recipient_name: z.string().min(2, "Name is required"),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]{7,20}$/, "Invalid phone number format"),
    phone_alt: z.string().regex(/^\+?[\d\s\-\(\)]{7,20}$/, "Invalid phone number format").optional().or(z.literal('')),
    line1: z.string().min(5, "Address is too short"),
    line2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
    postal_code: z.string().min(2, "Postal code is required"),
    country: z.string().length(2, "Country code must be 2 letters"),
    address_type: z.enum(["billing", "shipping", "both"]).optional(),
    is_default: z.boolean().optional(),
};

// Formatter for UI/UX friendly phone numbers: (XXX) XXX-XXXX
const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    // Leave international numbers alone to prevent breaking formatting
    if (value.startsWith('+')) return value;

    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
        return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
    return value;
};

type AddressDialogProps = {
    address?: Address;
    isLoading?: boolean;
    isEdit: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onValidationChange: (errors: string[] | null, e: FocusEvent<HTMLInputElement, Element> | string) => void;
    formErrors: Record<string, string[]> | null;
    canSubmit: boolean;
    t: TFunction<"translation", undefined>,
}

export function AddressDialog({
    address,
    isEdit,
    isLoading = false,
    onOpenChange,
    open,
    canSubmit,
    formErrors,
    onValidationChange,
    t
}: AddressDialogProps) {

    // Intercept phone input to auto-format
    const handlePhoneFormatting = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-semibold tracking-tight">
                        {isEdit ? t('addresses:edit') : t('addresses:add_new')}
                    </DialogTitle>
                    <DialogDescription id="dialog-description">
                        {isEdit ? "Update your address details below." : "Enter the details for your new address."}
                    </DialogDescription>
                </DialogHeader>

                <Form method="post" className="space-y-6">
                    {/* Action Intent */}
                    <input type="hidden" name="_intent" value={isEdit ? "update-address" : "create-address"} />
                    <input type="hidden" name="_module" value="address" />

                    {isEdit && <input type="hidden" name="id" value={address!.id} />}

                    <FieldGroup className="space-y-4">
                        <CustomField
                            name="recipient_name"
                            label={t('addresses:recipient_name')}
                            defaultValue={address?.recipient_name}
                            dataFormat={addressSchema.recipient_name}
                            onValidationErrorsChange={onValidationChange}
                            validationErrors={formErrors?.recipient_name}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomField
                                name="phone"
                                label={t('addresses:phone')}
                                type="tel"
                                placeholder="(555) 555-5555"
                                defaultValue={address?.phone}
                                onChange={handlePhoneFormatting}
                                dataFormat={addressSchema.phone}
                                onValidationErrorsChange={onValidationChange}
                                validationErrors={formErrors?.phone}
                                required
                            />
                            <CustomField
                                name="phone_alt"
                                label={t('addresses:phone_alt')}
                                type="tel"
                                placeholder="(555) 555-5555"
                                defaultValue={address?.phone_alt ?? ""}
                                onChange={handlePhoneFormatting}
                                dataFormat={addressSchema.phone_alt}
                                onValidationErrorsChange={onValidationChange}
                                validationErrors={formErrors?.phone_alt}
                            />
                        </div>

                        <CustomField
                            name="label"
                            label={t('addresses:label')}
                            placeholder="e.g., Home, Work, Apartment"
                            defaultValue={address?.label ?? ""}
                            dataFormat={addressSchema.label}
                            onValidationErrorsChange={onValidationChange}
                            validationErrors={formErrors?.label}
                        />

                        <CustomField
                            name="line1"
                            label={t('addresses:line1')}
                            placeholder="Street address, P.O. box"
                            defaultValue={address?.line1}
                            dataFormat={addressSchema.line1}
                            onValidationErrorsChange={onValidationChange}
                            validationErrors={formErrors?.line1}
                            required
                        />

                        <CustomField
                            name="line2"
                            label={t('addresses:line2_optional')}
                            placeholder="Apt, suite, unit, building, floor"
                            defaultValue={address?.line2 ?? ""}
                            dataFormat={addressSchema.line2}
                            onValidationErrorsChange={onValidationChange}
                            validationErrors={formErrors?.line2}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomField
                                name="city"
                                label={t('addresses:city')}
                                defaultValue={address?.city}
                                dataFormat={addressSchema.city}
                                onValidationErrorsChange={onValidationChange}
                                validationErrors={formErrors?.city}
                                required
                            />
                            <CustomField
                                name="state"
                                label={t('addresses:state')}
                                placeholder="State/Province"
                                defaultValue={address?.state ?? ""}
                                dataFormat={addressSchema.state}
                                onValidationErrorsChange={onValidationChange}
                                validationErrors={formErrors?.state}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomField
                                name="postal_code"
                                label={t('addresses:postal_code')}
                                defaultValue={address?.postal_code}
                                dataFormat={addressSchema.postal_code}
                                onValidationErrorsChange={onValidationChange}
                                validationErrors={formErrors?.postal_code}
                                required
                            />
                            <CustomField
                                name="country"
                                label={t('addresses:country')}
                                placeholder="ISO code (e.g., US)"
                                defaultValue={address?.country}
                                dataFormat={addressSchema.country}
                                onValidationErrorsChange={onValidationChange}
                                validationErrors={formErrors?.country}
                                required
                            />
                        </div>

                        <Field data-invalid={!!formErrors?.address_type} className="w-full md:max-w-xs">
                            <FieldLabel>{t('addresses:address_type')}</FieldLabel>
                            <Select name="address_type"
                                defaultValue={address?.address_type ?? "shipping"}
                                onValueChange={(value) => onValidationChange(getValidationError({ value, dataFormat: addressSchema.address_type }), "address_type")}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('addresses:address_type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Types</SelectLabel>
                                        {[
                                            { value: "shipping", label: "Shipping" },
                                            { value: "billing", label: "Billing" },
                                            { value: "both", label: "Both" },
                                        ].map(({ label, value }, key) => <SelectItem key={key} value={value}>{label}</SelectItem>)}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {formErrors?.address_type &&
                                <FieldError>{formErrors.address_type}</FieldError>}
                        </Field>
                    </FieldGroup>

                    {/* Switch for default */}
                    <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4 transition-colors hover:bg-muted/60">
                        <div className="space-y-1">
                            <Label htmlFor="is_default" className="text-sm font-semibold cursor-pointer">
                                {t("addresses:dialog.set_default_label")}
                            </Label>
                            <p className="text-xs text-muted-foreground leading-snug max-w-[90%]">
                                {t("addresses:dialog.set_default_description")}
                            </p>
                        </div>
                        <Switch
                            id="is_default"
                            name="is_default"
                            value="1"
                            defaultChecked={address?.is_default ?? false}
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-6">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => onOpenChange(false)}
                        >
                            {t("common:cancel")}
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            disabled={!canSubmit}
                        >
                            {isEdit ? t("addresses:dialog.save_changes") : t("addresses:dialog.create_address")}
                        </Button>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function ({ address, ...props }: Pick<AddressDialogProps, "address" | "open" | "onOpenChange">) {
    const isEdit = useMemo(() => Boolean(address), [address]);
    const navigation = useNavigation();
    const isLoading = useMemo(() => navigation.state === "submitting" || navigation.state === "loading", [navigation.state]);

    const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null);
    const actionData = useActionData();

    useEffect(() => {
        if (actionData && actionData instanceof ValidationException) {
            setFormErrors(actionData.errors);
        }
    }, [actionData]);

    const handleValidationChange = (errors: string[] | null, e: FocusEvent<HTMLInputElement> | string) => {
        const updatedErrors = getUpdatedFormErrors({
            formErrors: formErrors,
            name: typeof e === "string" ? e : e.target.name,
            validationErrors: errors
        });
        setFormErrors(updatedErrors);
    };

    const canSubmit = useMemo(() => !formErrors, [formErrors]);
    const { t } = useTranslation(["addresses", "common"]);

    return (
        <AddressDialog
            address={address}
            isEdit={isEdit}
            isLoading={isLoading}
            canSubmit={canSubmit}
            formErrors={formErrors}
            onValidationChange={handleValidationChange}
            t={t}
            {...props}
        />
    );
}