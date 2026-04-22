import { Outlet } from "react-router"
import { Card, CardContent } from "~/components/ui/card"
import { FieldDescription } from "~/components/ui/field"

export default function() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className={"flex flex-col gap-6"}>
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <Outlet />
                            <div className="bg-muted relative hidden md:block">
                                <img
                                    src="https://images.unsplash.com/photo-1575528941322-c74397246f19"
                                    alt="Image"
                                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <FieldDescription className="px-6 text-center">
                        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <a href="#">Privacy Policy</a>.
                    </FieldDescription>
                </div>
            </div>
        </div>
    )
}

export function meta() {
    return [
        { title: "Log In or Register" },
        { name: "description", content: "Use your email and password to authenticate." },
    ];
}