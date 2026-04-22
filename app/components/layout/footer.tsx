export default function Footer() {
    return (
        <footer className="border-t bg-muted/50 text-muted-foreground dark:bg-muted/30 py-10 text-center">
            <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </footer>
    );
}