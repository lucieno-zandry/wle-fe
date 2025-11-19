import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import z from "zod";
import Field from "../custom-components/field";
import { updateAuthUser } from "~/api/http-requests";
import { toast } from "sonner";
import { ValidationException } from "~/api/app-fetch";
import Button from "../custom-components/button";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";

const dataFormat = {
    passwordFormat: z.string().min(4)
}

export default function () {
    const [formData, setFormData] = useState({
        current_password: "",
        password: "",
        password_confirmation: ""
    })

    const [validationMessages, setValidationMessages] = useState<Record<string, string[]> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const canSubmit = useMemo(() => Object.keys(formData).every(key => !!formData[key as keyof typeof formData]) &&
        formData.password === formData.password_confirmation &&
        !validationMessages,
        [formData, validationMessages]);

    console.log(formData);

    console.log(canSubmit);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            return setValidationMessages({ password_confirmation: ["The password confirmation does not match!"] })
        }

        setIsLoading(true);
        updateAuthUser(formData)
            .then(() => {
                toast.success("Password updated successfuly!");
                setFormData({ ...formData, password: "", password_confirmation: "" });
            })
            .catch(error => {
                if (error instanceof ValidationException) {
                    setValidationMessages(error.errors);
                } else {
                    toast.error("Failed to update password with status : " + error.status);
                }
            })
            .finally(() => {
                setIsLoading(false);
            })
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleValidationErrorsChange = (validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => {
        setValidationMessages(v => {
            const updatedValidationMessages = getUpdatedFormErrors({
                formErrors: v,
                name: e.target.name,
                validationErrors,
            })

            return updatedValidationMessages;
        })
    }

    return <TabsContent value="security" className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Keep your account secure with a strong password</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field
                        id="current_password"
                        name="current_password"
                        type="password"
                        value={formData.current_password}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        label="Current Password"
                        dataFormat={dataFormat.passwordFormat}
                        validationErrors={validationMessages?.current_password}
                        onValidationErrorsChange={handleValidationErrorsChange} />

                    <Field
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        label="New Password"
                        dataFormat={dataFormat.passwordFormat}
                        validationErrors={validationMessages?.password}
                        onValidationErrorsChange={handleValidationErrorsChange} />

                    <Field
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        label="Confirm New Password"
                        dataFormat={dataFormat.passwordFormat}
                        onValidationErrorsChange={handleValidationErrorsChange} />

                    <Button type="submit" disabled={!canSubmit} isLoading={isLoading}>Update Password</Button>
                </form>
            </CardContent>
        </Card>
    </TabsContent>
}